# CUDA, device-resident after load

September 2026 (PRs 167–173, 183) moved the flow head, Diffusion Policy U-Net + DDIM, and Mamba onto the device after load. LeRobot can roll out with `--device cuda` and the same `--on-miss` contract.

Headline matched replay on a **GTX 1650**, not a datacenter SKU: **131 ms vs 345 ms** p50. Native 10-step DDIM kernel mix on that card landed around 152–174 ms depending on clocks and launch geometry. `conv 2048 L4` is still the expensive family (tens of launches per sample).

v0.1.1 wheels are CPU. CUDA is source + `nvcc`:

```
cmake -S . -B build-cuda -DCMAKE_BUILD_TYPE=Release -DFLOWEDGE_BACKEND=cuda
```

Not TensorRT, not ONNX, not Jetson numbers. If you only have a laptop GPU, that is the intended comparison class for now.

Kernel work that mattered: short-horizon launch, closed-form `conv_transpose1d`, warp split-K on L=4 and L=8 (L=16 split-K was rejected), block-per-group GroupNorm. One native DDIM sample is on the order of 1490 device ops — launch overhead is the story as much as FLOPs.
