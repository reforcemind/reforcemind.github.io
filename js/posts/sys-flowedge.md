# FlowEdge as a system

Docs: [elprofesoriqo.github.io/FlowEdge](https://elprofesoriqo.github.io/FlowEdge/) · tag: [v0.1.1](https://github.com/elprofesoriqo/FlowEdge/releases/tag/v0.1.1)

FlowEdge is a C++23 inference engine for two robotics policy heads:

1. **Flow matching** — a condition \(c\) (Mamba or an external encoder) and a velocity field \(v(x,t \mid c)\). Integrate a short ODE from noise to action with Euler / Heun / RK4. Cost is NFE × one velocity net. No RNG on this path.
2. **Diffusion Policy** — LeRobot still encodes RGB. Core runs the Conv1D U-Net and DDIM on the action horizon.

LeRobot keeps cameras, training, joint limits, and e-stop. FlowEdge is the thing inside the control period.

## Load contract

Convert a pinned Hugging Face / LeRobot checkpoint into layouts the engine already knows (`backbone.*`, `flow.*`, `dp.*`). Load into one bump-allocated arena. Sample. Honor `--period-ms` with `--on-miss hold|drop|raise`.

v0.1.1 ships CPU wheels for CPython 3.10–3.12 (manylinux x86_64/aarch64, Windows AMD64, macOS ARM). They are **not on PyPI yet**. CUDA is `FLOWEDGE_BACKEND=cuda` with `nvcc`; those wheels are CPU-only.

Optional Relay is local IPC around Core. Matched Diffusion Policy replay does not start Relay.

Not a trainer. Not a graph compiler. Not a safety controller.
