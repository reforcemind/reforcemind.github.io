I have two published numbers for the same Diffusion Policy checkpoint, and they argue with each other.

On a matched replay, the C++ path is **851 vs 1409 ms** p50 on CPU (`threads=1`) and **131 vs 345 ms** on a GTX 1650. Same observations. Same weights. That speedup is real.

Then I attach `--period-ms 10 --on-miss hold` and run twenty steps.

**20 / 20 misses.**

Both results are true. They are not the same experiment. The first one asks whether FlowEdge is faster than PyTorch on a file. The second asks whether this checkpoint can keep a 10 ms promise. I started [FlowEdge](https://github.com/reforcemind/FlowEdge) because those two kept getting put on one slide.

The C++ rule that keeps them from mixing is simple. After `load` returns, `sample` should not malloc. If it still can, the 851 ms is mixed with the heap, and the 20 / 20 misses are mixed with whoever else is on the machine. Pages, threads, and a period you are allowed to miss are the same sentence applied to the rest of the runtime.

FlowEdge is a small C++23 runtime for two converted heads: flow matching, and a Conv1D U-Net Diffusion Policy sampled with DDIM. Other Diffusion Policy stacks can use other schedulers. Training stays in PyTorch. Cameras, normalization, and the motors can stay in LeRobot. FlowEdge takes the narrower job: load the converted file, size the memory it needs, and produce actions, or say that the action was late.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge"></div>
  <figcaption>Fig. 1 — LeRobot can own cameras and the robot. FlowEdge owns the sample path, and the three things it can do when that path is late.</figcaption>
</figure>

After `load` returns, as little as possible should still be happening. No discovering the model. No walking a graph. No allocator in the timed window. No shipping weights to the GPU again. The boring work belongs at load.

That is not hard real-time. Linux can still preempt the process. Caches, TLBs, frequency scaling, interrupts, CUDA, and contention are still there. The narrower goal is allocation-controlled, deadline-aware inference: take out variance we put there ourselves, measure what is left, and treat a miss as a result instead of a missing row.

Throughput is a different axis. You can raise it by batching and still miss every deadline.

## Two questions, two harnesses

The replay table answers the first question.

| Setup | FlowEdge | PyTorch |
|---|---:|---:|
| CPU, `threads=1` | 851 ms p50 | 1409 ms p50 |
| GTX 1650 | 131 ms p50 | 345 ms p50 |

A period is not another latency column. It is a wall-clock boundary. If the next tick arrives while `sample` is still running, the promise was missed, and the caller still has to do something: **hold** the last output, **drop** the late one, or **raise**.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-deadline"></div>
  <figcaption>Fig. 2 — A period is a wall. Crossing it is a miss. hold, drop, and raise are part of the API, not a footnote.</figcaption>
</figure>

The period run is a different harness from the replay. Its absolute p50 should not be compared to 131 ms. On the published PushT DDIM checkpoint, twenty steps at 10 ms with `hold` miss **20 / 20**. Observed p50 / p99 / max over that smoke run: CPU 655 / 812 / 834 ms, CUDA 589 / 1571 / 1795 ms.

Twenty samples are enough to see that every tick missed. They are not a p99 study. For a tail you would trust, you want hundreds of samples, preferably thousands. When the budget is 10 ms and the step is hundreds of milliseconds, you do not need a precise tail to know the deadline is not met. You do need not to hide the miss behind the replay median.

## Size the slab at load

Once a miss is a value, the heap in `sample` is an obvious place to look. `malloc` there puts allocator state into the timed window. It may involve synchronization, metadata traversal, page faults, or system calls. None of that has to happen on every call, which is exactly why two identical inputs can take different times.

So the engine sizes one `std::byte` slab from the checkpoint at load:

$$
\begin{aligned}
\mathrm{slab}
&= W_{\mathrm{bytes}} + S_{\mathrm{decode}} + S_{\mathrm{flow}} \\
&\quad + R_{\mathrm{pool}} + O_{\mathrm{align}}
\end{aligned}
$$

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-slab"></div>
  <figcaption>Fig. 3 — Weights, decode state, solver scratch, the pool, and alignment padding in one allocation.</figcaption>
</figure>

Weights are carved once, 64-byte aligned. Persistent decode state, flow scratch, the task ring, and the worker objects live in the same bytes. If the model does not fit, `alloc` returns `nullptr` in `fe_engine_load`. I want that before the first tick, not halfway through a step.

The bump itself is small:

```cpp
std::byte* Arena::alloc(std::size_t n, std::size_t a) noexcept {
    void* p = cursor_;
    std::size_t space = static_cast<std::size_t>(end_ - cursor_);
    if (!std::align(a, n, p, space)) return nullptr;
    cursor_ = static_cast<std::byte*>(p) + n;
    return static_cast<std::byte*>(p);
}
```

No free list. Scratch is a stack on the same slab. `mark()` records the cursor. A layer carves what it needs. `reset_to()` rewinds. The next layer reuses the same range.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-layout"></div>
  <figcaption>Fig. 4 — Weights stay put. Scratch advances the cursor and is rewound. begin_ to end_ is still one allocation.</figcaption>
</figure>

The shapes are known. Repeated `sample` asks for the same kinds of temporaries. There is not much reason to rediscover them on every call. Load may still `new` the slab. `flowedge-profile` counts allocations only inside the timed window. Zero is the number I keep on the published path. Two concurrent solves means two engines. Mutable scratch is never shared.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-arena"></div>
  <figcaption>Fig. 5 — Convert once, size one arena, fail in load if it does not fit. The hot path is not the allocator.</figcaption>
</figure>

This removes several avoidable sources of latency variance and makes a miss explicit if you set a period. It does not make execution deterministic.

## Mapping the file is not the same as being ready

The loader mmaps `.safetensors`, reads the JSON header without a JSON library, and copies each tensor into the arena. mmap alone does not guarantee that all required pages are resident and their page-table entries populated before the timed window. A plain lazy map can move first-touch work into `sample`.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-mmap"></div>
  <figcaption>Fig. 6 — mmap gives an address range. First-touch work can still land in sample unless load does that work first.</figcaption>
</figure>

`MAP_POPULATE`, an explicit walk of the pages, or locking them are other ways to push that work earlier. FlowEdge copies at load anyway: it touches the pages it will sample from, and it establishes the 64-byte layout the kernels want. File offsets are not guaranteed to have that alignment.

BF16 weights stay BF16. Widening is a left shift in the innermost SIMD loop of `matmul`. Activations stay F32. `in_proj` and `out_proj` land near 15 GB/s on the published CPU path. On this path, the projection behaves like a bandwidth-dominated kernel; further FMA blocking is not the bottleneck that would close the gap from 851 ms to 10 ms.

## Keep the C ABI small

Python and a ROS2 node should not see the arena. They get an opaque `fe_engine*` and C linkage.

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

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-stack"></div>
  <figcaption>Fig. 7 — Opaque handle, then the engine, then kernels on caller-owned spans. Scalar, AVX2, NEON, and CUDA sit behind the same interface.</figcaption>
</figure>

`fe_engine_load` catches OOM and returns `nullptr`. `sample` does not throw across the C boundary. There is no process-global current model. One handle is one session and owns its mutable state. Scalar, AVX2, and NEON are a CMake pick. CUDA is a different translation unit behind the same header, and it is not inside the v0.1.2 CPU wheel.

## Yield between solver steps

A flow-matching solve is several network evaluations. If a newer observation arrives while the old solve is still running, finishing the old one is not automatically useful. `flow_begin` / `flow_advance` split that work at whole Euler, Heun, or RK4 steps. `cancel_before` is an atomic generation watermark.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-coop"></div>
  <figcaption>Fig. 8 — Advance yields between whole function evaluations, not inside a matmul. A newer observation can drop stale work before it is published.</figcaption>
</figure>

I do not interrupt a matmul. The caller gets control between NFEs. That does not make this checkpoint cheap, and it does not turn 851 ms into 10 ms. It makes stale work visible. Publishing the right action for an observation that stopped mattering 200 ms ago is not a win.

## Do not smuggle the heap back in through threads

`std::async` and packaged tasks are an easy way to allocate again. The pool is an SPMC ring carved from the same slab. Small projections stay on the caller thread. Larger shapes pick a 2 / 4 / 8 tier. Workers spin briefly, then park on `atomic::wait`.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="flowedge-pool"></div>
  <figcaption>Fig. 9 — Task ring and workers live in the arena. Enqueue should not allocate.</figcaption>
</figure>

Every kernel operates on caller-owned buffers exposed as `std::span` and performs no dynamic allocation. Those buffers are 64-byte aligned. There is no ONNX interpreter on `sample`. Reuse is the arena, the loader, and `kernels.h`.

CUDA follows the same rule. Weights and scratch go up at load. Tests assert no `cudaMalloc` after that. A 4 GB GTX 1650 under WSL cannot always hold the PushT U-Net (~959 MiB). If residency fails, CPU kernels stay loaded and `fe_engine_cuda_resident` is 0. The 131 vs 345 ms replay number is from a card that took the model.

## What the numbers are for

Most numbers are unused unless you keep the question next to them.

| Measurement | Result | Question |
|---|---|---|
| DP replay, CPU `threads=1` | 851 vs 1409 ms p50 | Is the C++ replay faster than PyTorch on the same file? |
| DP replay, GTX 1650 | 131 vs 345 ms p50 | Same question on CUDA |
| Period 10 ms, CPU, hold | 20 / 20 misses | Does this checkpoint meet this period? |
| Period 10 ms, CUDA, hold | 20 / 20 misses | Same deadline question, different harness than 131 ms |
| Flow matching vs PyTorch | ~1e-6 rel | Did `flow_sample` keep the numerical output? |

The last row is a ULP gate. I have not published a matched flow-matching policy p50, and I do not want the correctness check to become one by accident. The 20 / 20 miss counts are the result in the period rows. The observed 655 / 812 / 834 ms and 589 / 1571 / 1795 ms next to them are from that twenty-step run, not a robust tail.

| Question | What I log |
|---|---|
| Did the timed window allocate? | malloc count inside that window |
| Did we miss the period we asked for? | misses / steps |
| What did observed latency look like? | p50 / p99 / max |
| Is CUDA still resident? | `fe_engine_cuda_resident` |
| Did a named-host profile move? | profile JSON vs that host's baseline |

`flowedge-profile` warms, times, and can fail a build when malloc appears in the window or a profile moves against a baseline that carries the checkpoint fingerprint, compiler, and CPU label. A different machine is not the same comparison. A twenty-step period smoke test is not that profile.

## The bet

PyTorch is still where I train. LeRobot is still cameras, preprocessing, and the robot. TensorRT and ONNX are still the tools for a general DAG. A model server is still the tool for a batch.

FlowEdge is narrower. Two heads. Memory layout known before the first tick. Pages and device buffers ready before the first tick. Kernels that do not own their buffers and do not allocate. A miss you can log if the period does not fit. Allocation-controlled and deadline-aware. Not a 100 Hz Diffusion Policy loop. Not a hard real-time kernel.

Don't malloc after load. The rest of this runtime is that sentence, applied to pages, threads, and a period you are allowed to miss.

Once those surprises are out of the way, the remaining latency is the interesting part.

## Trying it

CPU wheels for CPython 3.10–3.12 are on the [v0.1.2 GitHub release](https://github.com/reforcemind/FlowEdge/releases/tag/v0.1.2). They are not on PyPI. CUDA is a source backend.

```bash
python -m pip install flowedge-0.1.2-*.whl
python examples/core/flow_sample.py models/mamba_flow.safetensors euler 10
```

From source: C++23, CMake 3.21+.

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j
./build/flow_sample models/mamba_flow.safetensors euler 10
```

Code: [github.com/reforcemind/FlowEdge](https://github.com/reforcemind/FlowEdge). Notes: [memory](https://reforcemind.github.io/FlowEdge/architecture/memory.html), [kernels](https://reforcemind.github.io/FlowEdge/architecture/kernels.html), [C ABI](https://reforcemind.github.io/FlowEdge/api/c-abi.html), [performance](https://reforcemind.github.io/FlowEdge/performance.html).
