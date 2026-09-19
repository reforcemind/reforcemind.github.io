# Matched replay, not token speedups

We do not publish generated-checkpoint or fixed-token speedups as policy-latency evidence. The comparison is a captured visual-policy replay against LeRobot / PyTorch on the same observation file.

## CPU, `threads=1`

| | FlowEdge | LeRobot / PyTorch |
|---|---:|---:|
| Policy p50 | **851 ms** | **1409 ms** |
| Preprocess-to-chunk p50 | 889 ms | 1448 ms |
| Max abs action error | 3.05e-5 | — |
| FlowEdge / LeRobot | 0.60× | |

More threads help both sides. At 4 threads FlowEdge policy p50 is 633 ms vs 819 ms. Native DDIM (no Python wrapper) is 567 ms at 4 workers. None of these is a 10 ms loop.

## CUDA, GTX 1650

Same observation file. Not TensorRT. Not Jetson.

| | FlowEdge CUDA | PyTorch CUDA |
|---|---:|---:|
| Policy p50 | **131 ms** | **345 ms** |
| Preprocess-to-chunk p50 | 136 ms | 350 ms |
| Max abs action error | 7.63e-5 | — |
| FlowEdge / LeRobot | 0.38× | |

A 4 GB card cannot hold both U-Nets; the runner frees FlowEdge before loading PyTorch. Encoder still runs in LeRobot. Split-K Conv1D on horizon 8 plus block-per-group GroupNorm is what holds the published 131 vs 345 JSON.

Flow matching is gated by ULP versus the same PyTorch reference (~1e-6 rel). That path does not have a published policy p50 yet.

How to regenerate: `python -m flowedge_dev bench policy …` as in the [performance](https://elprofesoriqo.github.io/FlowEdge/performance.html) docs.
