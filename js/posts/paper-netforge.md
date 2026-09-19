# NetForge RL

arXiv:[2604.09523](https://arxiv.org/abs/2604.09523) · code:[reforcemind/NetForge_RL](https://github.com/reforcemind/NetForge_RL)

NetForge is the environment layer of ReForceMind. A red operator attacks a procedurally generated enterprise / OT network. Three zone-split blue agents defend from synthetic SIEM, not from a ground-truth state vector.

The environment implements PettingZoo `ParallelEnv` with Gymnasium spaces, fixed-shape observations, and per-agent action masks. Actions are durative: an agent cannot act again until the pending command resolves. Isolating a host cancels an in-flight exploit against it.

## What is actually there

- Five scenarios: `ransomware`, `apt_espionage`, `cloud_hybrid`, `iot_grid`, `ot_stuxnet`.
- Difficulty presets `easy` / `medium` / `hard` and a frozen held-out split.
- JAX vectorized core: about \(2.5 \times 10^5\) environment-steps/s at batch 4096 on CPU. That kernel is a throughput surrogate with a coarser observation than the Python engine.
- Baselines: scripted, a JIT-fused IPPO trainer (ransomware mean reward 0.06 → 0.71 on a committed run), self-play / Elo.
- Six diagnostic probes (memory, attention, temporal, precision, safety, generalization).

MITRE ATT&CK identifiers and CVE labels are abstract vulnerability tags. The repository does not ship exploit payloads.

```python
from netforge_rl.environment import make_env

env = make_env("medium", scenario_type="ransomware", seed=0)
obs, infos = env.reset(seed=0)
```
