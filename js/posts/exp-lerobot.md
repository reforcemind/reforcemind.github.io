# Policy → FlowEdge → actions

The demo we want is a robot. The demo we can ship this week is a LeRobot rollout: convert Diffusion Policy, keep the RGB encoder in LeRobot, run Core on the U-Net, step a fake robot / PushT, log `--on-miss`.

```bash
python -m pip install -e integrations/lerobot
python -m flowedge_dev pipeline convert models/diffusion_pusht \
  models/diffusion_pusht.flowedge.safetensors --arch diffusion
python -m flowedge_dev pipeline rollout models/diffusion_pusht.flowedge.safetensors \
  --steps 20 --threads 4 --period-ms 10 --on-miss hold
```

`--period-ms 10` on this checkpoint is a miss log, not a success rate. That is the point of the first demo: you can see the contract. LIBERO / a physical SO-100 is the next visible artifact, not a fifth accelerator backend.

Flow matching sample (no LeRobot):

```bash
curl -L "https://huggingface.co/ReForceMind/mamba_flow/resolve/main/mamba_flow.safetensors" \
  -o models/mamba_flow.safetensors
python examples/core/flow_sample.py models/mamba_flow.safetensors euler 10
```
