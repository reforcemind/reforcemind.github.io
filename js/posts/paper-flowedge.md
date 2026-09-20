There is a pattern that shows up when a learned policy leaves the training stack. Someone times PyTorch. Someone rewrites the hot part in C++. The median drops. On a slide that looks like the robot is solved. Then they ask the same program to finish inside a 10 ms period, and every step misses.

The compiler is not really the issue. The issue is the timed window. If `sample` can still allocate, fault in a page, or walk a graph interpreter, you have two programs with the same weights and different tails. A median cannot see that. I wrote [FlowEdge](https://github.com/reforcemind/FlowEdge) for allocation-controlled, deadline-aware inference: one arena sized at load, kernels that take `std::span`, and a miss that is a value if you set a period this checkpoint cannot meet. That is not a claim of deterministic hard real-time.

## Introduction

Two groups of people bump into this, and they do not share a vocabulary.

If you train policies, the object is a checkpoint. Flow matching is a short ODE: noise in, action out, cost is the number of function evaluations. Diffusion Policy is a family of visuomotor policies; implementations can use more than one scheduler. The FlowEdge replay here uses a Conv1D U-Net with DDIM sampling. You train those in PyTorch. LeRobot still owns cameras, normalization, and the motors. None of that belongs inside the inference kernel.

If you write C++, the object is what happens after `load` returns. An **arena** is one `std::byte` slab and a cursor. `alloc` is `std::align` plus a bump. There is no free list. The **hot path** is every call to `sample`. **p50** is the median of those times on a file. **p99** is the time that 99 percent beat, and it is only a tail estimate if the window is large. **Max** is the worst one in the window. A **period** is a wall-clock budget you may attach to that loop. If the sample is still running when the wall arrives, that is a **miss**. The caller still needs a defined action: hold the last output, drop the send, or raise.

Throughput is a different question. You can raise it by batching and still miss every deadline.

FlowEdge is C++23. You convert one of those two heads, load the file, call `sample`. The rest of this piece is the container: it removes several avoidable sources of latency variance and makes deadline misses explicit. It is not a claim that Diffusion Policy now fits in 10 ms, and it is not a claim that the OS, the caches, or CUDA have gone away.

## The cheap win

On the published Diffusion Policy replay, the C++ path is faster than PyTorch: **851 vs 1409 ms** p50 on CPU (`threads=1`, same observation file), **131 vs 345 ms** on a GTX 1650. Same checkpoint. Same observations. That compare is real. It answers “is this implementation slower than the training stack on this file?”

It does not answer “can this finish in 10 ms?”

The period measurement is a different harness. `--period-ms 10 --on-miss hold`, twenty steps: **20 / 20 misses**. Observed p50 / p99 / max over that run: CPU 655 / 812 / 834 ms, CUDA 589 / 1571 / 1795 ms. Those absolute p50 values should not be compared to the 131 ms replay number. The period run is here to answer the deadline question. Twenty steps is enough to see that every tick missed. It is not a serious p99 benchmark. For a tail you would trust, you want hundreds of samples, preferably thousands.

When latency is hundreds of milliseconds against a 10 ms budget, you do not need a precise p99 to conclude the deadline is not met. Reporting only the 131 ms replay median is how the cheap win looks like a control loop.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-deadline"></div>
  <figcaption>Fig. 1 — A period is a wall-clock budget. On this checkpoint we miss 10 ms every time. The miss is part of the API.</figcaption>
</figure>

So the systems work is not “make the median smaller until the slide is green.” It is: what is `sample` allowed to do, and what do you log when it cannot finish.

## One slab at load

`malloc` inside `sample` introduces allocator state into the timed window. It may involve synchronization, metadata traversal, page faults, or system calls. Two identical inputs can then take different times because the heap looked different. The PyTorch compare is no longer only about kernels.

At load the engine sizes one slab from the checkpoint:

$$
\begin{aligned}
\mathrm{slab}
&= W_{\mathrm{bytes}} + S_{\mathrm{decode}} + S_{\mathrm{flow}} \\
&\quad + R_{\mathrm{pool}} + O_{\mathrm{align}}
\end{aligned}
$$

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-slab"></div>
  <figcaption>Fig. 2 — Same formula as a map of the slab. Weights dominate. Alignment is the remainder after 64-byte carving.</figcaption>
</figure>

Weights are carved once, 64-byte aligned. Decode state, ODE scratch, the task ring, and the `std::jthread` objects live in the same bytes. `alloc` returns `nullptr` on exhaustion, so a model that does not fit fails in `fe_engine_load`, not in the middle of a step.

Scratch is stack-like. `mark()` records the cursor. `reset_to()` winds it back. A layer carves intermediates, the caller rewinds, the next layer reuses the same range. No per-object header, and the kernels do not own their buffers.

```cpp
std::byte* Arena::alloc(std::size_t n, std::size_t a) noexcept {
    void* p = cursor_;
    std::size_t space = static_cast<std::size_t>(end_ - cursor_);
    if (!std::align(a, n, p, space)) return nullptr;
    cursor_ = static_cast<std::byte*>(p) + n;
    return static_cast<std::byte*>(p);
}
```

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-layout"></div>
  <figcaption>Fig. 3 — Address space of the slab. begin_ to end_ is one allocation. cursor_ bumps; reset_to(mark) rewinds scratch.</figcaption>
</figure>

Load may still `new` the slab. That is allowed. `flowedge-profile` counts allocations only inside the timed window. Zero is the number I keep on that path. Two concurrent solves means two engines. Mutable scratch is never shared.

This removes several avoidable sources of latency variance and makes a miss explicit if you set a period. It does not make execution deterministic. OS scheduling, interrupts, CPU frequency scaling, caches, TLBs, CUDA scheduling, and contention are still there.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-arena"></div>
  <figcaption>Fig. 4 — One std::byte slab. Bump on alloc, rewind on mark. Exhaustion is a load error.</figcaption>
</figure>

## Touch the pages at load

The loader mmaps a `.safetensors` file, reads the JSON header without a JSON library, and copies each tensor into the arena. mmap alone does not guarantee that all required pages are resident and their page-table entries populated before the timed window. A plain lazy mmap can move first-touch faults into `sample`. `MAP_POPULATE`, an explicit pass over the pages, or page locking are other ways to do that work at load. FlowEdge copies tensors during load so the required pages are touched and the final kernel layout is established before sampling. File offsets are not 64-byte aligned. The kernels want 64-byte spans, and the copy is also how that layout is fixed.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-mmap"></div>
  <figcaption>Fig. 5 — A plain lazy mmap can fault on first touch inside sample. The load copy touches the pages and sets the 64-byte layout. MAP_POPULATE or mlock would be other load-time options.</figcaption>
</figure>

BF16 weights stay BF16. Widening is a left shift in the innermost SIMD loop of `matmul`. Activations stay F32. `in_proj` and `out_proj` land near 15 GB/s on the published CPU path. On this path, the projection behaves like a bandwidth-dominated kernel; further FMA blocking is not the bottleneck that would close the gap from 851 ms to 10 ms.

## Nothing crosses the C ABI

The public surface is C linkage over an opaque handle. Python and a ROS2 node both include `engine.h`. They do not see the arena.

```c
fe_engine* fe_engine_load(const char* path);
int  fe_engine_sample(fe_engine*, const int32_t* tokens, size_t n,
                      const float* noise, size_t steps, int method, float* action);
int  fe_engine_flow_begin(fe_engine*, const float* condition,
                          const float* noise, size_t steps, int method);
int  fe_engine_flow_advance(fe_engine*, size_t step_budget, float* action,
                            size_t* steps_remaining);
void fe_engine_cancel_before(fe_engine*, uint64_t generation);
void fe_engine_free(fe_engine*);
```

`fe_engine_load` catches OOM and returns `nullptr`. Sample does not throw. There is no process-global current model. One handle is one session. `flow_begin` / `flow_advance` exist so a caller can poll between whole solver steps. That is in the header. It does not change the p50 on this checkpoint. Scalar, AVX2, NEON, and CUDA backends sit behind the same interface; the backend is a link-time switch.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-stack"></div>
  <figcaption>Fig. 6 — C ABI, then the engine, then kernels.h, then the ISA. The backend is a link-time switch.</figcaption>
</figure>

## Hand-written kernels

There is no ONNX interpreter on `sample`. Reuse is the arena, the loader, and `kernels.h`. Every kernel operates on caller-owned buffers exposed as `std::span` and performs no dynamic allocation. Those buffers are 64-byte aligned. CMake picks AVX2, NEON, or scalar. CUDA is a different translation unit behind the same header, and it is not inside the v0.1.2 CPU wheel.

Threading is an SPMC pool carved from the slab, not `std::async`. Small projections stay on the caller thread. Large ones pick a 2/4/8 tier from the shape.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-pool"></div>
  <figcaption>Fig. 7 — The pool lives in the slab. No packaged_task, no heap on enqueue.</figcaption>
</figure>

At CUDA load, weights and scratch go up once. Tests assert no `cudaMalloc` after that. A 4 GB GTX 1650 under WSL cannot always hold the PushT U-Net (~959 MiB). If the upload fails, the CPU kernels stay, and `fe_engine_cuda_resident` is 0. The 131 vs 345 ms replay number is from a card that took the model.

## How you know you solved it

A faster median is not the whole job. I log whether the timed window allocated, whether a period I asked for was missed, whether CUDA is still resident, and whether a profile on a named host moved.

| Measurement | Number | What it is |
|---|---|---|
| DP replay, CPU `threads=1` | 851 vs 1409 ms p50 | vs PyTorch, same file |
| DP replay, GTX 1650 | 131 vs 345 ms p50 | vs PyTorch CUDA, same observations |
| Period 10 ms, CPU, hold | 20 / 20 misses | deadline question; observed 655 / 812 / 834 ms over 20 steps |
| Period 10 ms, CUDA, hold | 20 / 20 misses | same question, different harness than 131 ms; observed 589 / 1571 / 1795 ms over 20 steps |
| Flow matching vs PyTorch | ~1e-6 rel | ULP gate, not a policy p50 |

The 20 / 20 miss counts are the result in those rows. The p50 / p99 / max figures next to them are observations from that smoke run, not a robust tail. Replay p50 and period p50 should not be read as the same experiment.

| Question | What you log |
|---|---|
| Did the timed window allocate? | malloc count inside that window |
| Did we miss a period we asked for? | misses / steps, then observed p50 / p99 / max |
| Is CUDA still resident? | `fe_engine_cuda_resident` |
| Did a named-host profile move? | profile JSON vs a baseline on that host |

The last row of the first table is a correctness check on `flow_sample`. I have not published a flow-matching policy p50. If you need one, run a matched replay.

`flowedge-profile` warms, times, and can fail a build when malloc appears in the window or a profile regresses against a baseline that carries the checkpoint fingerprint, compiler, and CPU label. A different machine is not the same comparison. A 20-step period smoke test is not that profile.

## Other tools

PyTorch and LeRobot are the right tools to train, to encode cameras, and to talk to motors. TensorRT and ONNX are the right tools when the architecture is a general DAG. A model server is the right tool when the unit of work is a batch.

The C++ bet here is narrower. These two heads. One slab at load. No allocator in the timed window. A miss you can log if you set a period this file cannot meet. Allocation-controlled and deadline-aware, not a hard real-time kernel.

## Trying it

CPU wheels for CPython 3.10–3.12 are on the [v0.1.2 GitHub release](https://github.com/reforcemind/FlowEdge/releases/tag/v0.1.2). They are not on PyPI. CUDA is a source backend.

```bash
python -m pip install flowedge-0.1.2-*.whl
python examples/core/flow_sample.py models/mamba_flow.safetensors euler 10
```

From source: C++23, CMake 3.21+.

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j
./build/flow_sample models/mamba_flow.safetensors euler 10
```

Code: [github.com/reforcemind/FlowEdge](https://github.com/reforcemind/FlowEdge). Notes: [arena](https://reforcemind.github.io/FlowEdge/architecture/memory.html), [kernels](https://reforcemind.github.io/FlowEdge/architecture/kernels.html), [C ABI](https://reforcemind.github.io/FlowEdge/api/c-abi.html), [performance](https://reforcemind.github.io/FlowEdge/performance.html).
