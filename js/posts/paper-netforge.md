There is a pattern that shows up when people train a computer program to defend a network. The program plays a simulated company. An attacker starts locking machines. The program notices that if it takes every machine offline, the attack stops and its score goes up. On a training plot this looks like progress. In an actual security team it looks like someone shutting down the office.

The learning algorithm is not really the issue. The issue is the game. If the simulator tells the defender things a human analyst would never know, or treats a slow, political action as an instant switch, a high score does not mean much.

## Introduction

Two groups of people bump into this, and they do not share a vocabulary.

If you work in security, you already know the room. The SOC (security operations center) is the team that watches a company network. They do not sit in front of a live map of every cable. They sit in front of alerts. Those alerts come from a SIEM, which is just the system that collects logs: a login, a new process, an odd connection. The SIEM is late, noisy, and incomplete. It is a story about the network, not the network itself. When something looks bad, one of the strongest moves is to isolate a host, meaning take that machine off the network so the attacker cannot use it. That is a ticket, a wait, and often an argument with whoever owns the machine. The network is also split into zones. The DMZ is the public-facing edge. Internal is the office. Restricted is the more locked-down part: finance, or the industrial controllers on a factory floor. Different people watch different zones. They cannot see everything, and they cannot act on each other’s hosts.

If you work in machine learning, the setup is a gym. A gym is a simulated world with a simple loop: reset, then step. An agent is a program that, at each step, looks at an observation (what it is allowed to know), picks an action, and gets a reward (a number). Reinforcement learning is the family of methods that adjust the agent so the reward goes up over many episodes. In this article there are two colors of agent. Red is the attacker. Blue is the defender. They are programs, but they are meant to stand in for the people above. Multi-agent just means more than one of them is acting at the same time.

I keep those two pictures in the same place in [NetForge_RL](https://github.com/reforcemind/NetForge_RL). You can read the rest without opening the repo.

## The cheap win

Ransomware in a simulator is usually scored on how much of the network is still usable. Isolating every host in a subnet stops the encryption, so the reward rises. That is a legal move with a convenient side effect. It is not the same as containing an attack.

That is easy to miss if you only look at mean reward, the average score over episodes. Mean reward does not know why the number moved. It also does not know whether the agent was handed the answer.

A real blue team does not receive the true graph of the network (who can talk to whom). Isolation is not instantaneous. There is not one person with authority over the whole estate. If the gym pretends otherwise, the agent is practicing a job that does not exist.

## What the defender is allowed to see

Give a blue agent the adjacency matrix and it already knows the topology. Operators do not start there. They start from tickets and SIEM events, filtered by zone and by whatever parsers someone configured last year.

So blue should see what an analyst sees. Windows / Sysmon-style event XML, packed into embeddings, sometimes delayed. Not the graph. Red is not omniscient either: it has to recon a host before it can exploit it. Both sides are driven from the same random seed, which means you can replay an episode. If you cannot replay it, you cannot tell a real result from a noisy one.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="netforge-observe"></div>
  <figcaption>Fig. 1 — Two views of the same episode. Red finds the graph by recon. Blue only sees a SIEM feed.</figcaption>
</figure>

In [NetForge_RL](https://github.com/reforcemind/NetForge_RL) this is a [PettingZoo](https://pettingzoo.farama.org/) environment on a generated office-and-factory network. OT is the factory side: PLCs and controllers, not laptops.

## Actions that take time

`isolate host` is slow. In a normal `gym.step` it is not: the action finishes in one tick. Then the policy never has to wait, and it never sees an isolate land while an exploit is still traveling.

Durative actions are the fix I used. An agent cannot pick a new action until the current one finishes. If blue isolates a host while red’s exploit is still running, the exploit dies. If blue waits too long, it lands. Acting now versus waiting is part of what gets learned.

The episode should also record which [MITRE ATT&CK](https://attack.mitre.org/) techniques red actually used. ATT&CK is a catalog of attacker behaviors. Without those labels, a policy that repeats `exploit` is hard to tell from one that followed a kill chain.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="netforge-time"></div>
  <figcaption>Fig. 2 — Isolation occupies a window of time. If it lands while an exploit is still running, the exploit is cancelled.</figcaption>
</figure>

This makes training slower. Skipping it means you assumed a firewall change applies at the speed of `env.step`.

## One defender versus a team

A single agent that can touch every host does not look like a SOC. Desks are split by zone. Each desk sees a different slice of the feed.

If you train one all-seeing blue agent, you hide that. The policy learns moves no team could carry out. A better setup is three blue agents, one per zone, plus a red operator. They have to work from overlapping, delayed observations. There is no shared full view of the network.

<figure class="essay-fig">
  <div class="sketch-board" data-diagram="netforge-loop"></div>
  <figcaption>Fig. 3 — The training loop. Red reconnoiters and attacks. Three blue agents, one per zone, read a filtered SIEM.</figcaption>
</figure>

That is the loop inside NetForge_RL. JaxMARL, RLlib, CleanRL, and Stable-Baselines3 all attach in the usual way. The simulator is there to keep the rules in the last three sections.

## How you know you solved it

The three rules above still fail if you declare victory with mean reward on `ransomware`. Isolating everything will raise that number. Precision will be terrible. The SLA (the promise that some machines have to stay up) will be broken.

So the jobs have to be written down, including how they end.

| Scenario | Red | Blue | It ends when |
|---|---|---|---|
| `ransomware` | lock Corporate + Secure | contain and restore | all Corporate/Secure down, or a PLC goes kinetic |
| `apt_espionage` | persist and exfiltrate | isolate every foothold | every infected host is isolated |
| `cloud_hybrid` | breach the Secure enclave | keep the Secure SLA | every Secure host is gone |
| `iot_grid` | take the controllers | keep controllers healthy | all controllers compromised |
| `ot_stuxnet` | drive a PLC kinetic | stop physical damage | any PLC kinetic destruction |

Difficulty is `easy`, `medium`, or `hard`, plus a frozen held-out seed so you are not tuning on the same episode you evaluate. Decoys sit in the network on purpose. `deception_efficacy` is how much of red’s effort was wasted on honeytokens. That is a different skill from average reward.

Then you ask more than one question of the policy.

| Probe | What it asks |
|---|---|
| memory | Did blue remember a foothold after the alerts went quiet? |
| attention | Did it look at the right zone, not only the loudest one? |
| temporal | Did it wait for a slow action to finish? |
| precision | Did it isolate the infected host, or the whole subnet? |
| safety | Did it break the SLA in order to raise the score? |
| generalization | Does it still work on the held-out split? |

On ransomware, an IPPO run (a standard multi-agent trainer) moved mean reward from 0.06 to 0.71 against a learned red, not a scripted one. Self-play puts every red and blue policy on one Elo ladder. I still would not trust either number without the probes. If the agent isolates the building, precision and safety say so.

The full tables and the JAX throughput number live in [arXiv:2604.09523](https://arxiv.org/abs/2604.09523). The JAX path is about \(2.5 \times 10^5\) environment-steps per second at batch 4096 on CPU, on a reduced transition with a scalar alert, not the full SIEM text. I use that path to iterate. The Python engine is the one that matches the observation I described.

## Other simulators

CybORG, CyberBattleSim, and the other cyber gyms were not written to answer this exact question. A leaderboard across them does not mean much. What you can compare is the contract: what the agent may see, and what an action does.

| | A typical cyber RL gym | The setup here |
|---|---|---|
| Blue observation | compact state or true graph | SIEM embeddings, filtered, sometimes delayed |
| Red observation | sometimes omniscient | recon before exploit |
| Action model | usually instantaneous | durative; isolate can cancel an exploit still in flight |
| Defenders | one agent for the whole net | three blues, one per zone |
| Replay | a seed is set | same seed, same observations, embeddings, infos, rewards |
| Labels | mixed | ATT&CK IDs; CVEs as tags, no exploit payloads |
| What you report | mean reward | reward and the six probes |

## Trying it

A CPU is enough to run one episode. The `[jax]` extra is only the vectorized backend.

```python
from netforge_rl.environment import make_env

env = make_env("medium", scenario_type="ransomware", seed=0)
obs, infos = env.reset(seed=0)
while env.agents:
    actions = {a: env.action_space(a).sample() for a in env.agents}
    obs, rewards, term, trunc, infos = env.step(actions)
    if all(term.values()) or all(trunc.values()):
        break
```

```bash
pip install 'netforge_rl[jax] @ git+https://github.com/reforcemind/NetForge_RL'
```

The four agents are `red_operator`, `blue_dmz`, `blue_internal`, and `blue_restricted`. After a run I look at precision and safety before I look at mean reward.

Igor Jankowski, *NetForge RL: A Multi-Agent Simulation Environment for Cyber Defense with Durative Actions*, arXiv:2604.09523, 2026. [abs](https://arxiv.org/abs/2604.09523) · [doi](https://doi.org/10.48550/arXiv.2604.09523)

```
@misc{jankowski2026netforgerlmultiagentsimulation,
  title={NetForge RL: A Multi-Agent Simulation Environment for Cyber Defense with Durative Actions},
  author={Igor Jankowski},
  year={2026},
  eprint={2604.09523},
  archivePrefix={arXiv},
  primaryClass={cs.LG},
  url={https://arxiv.org/abs/2604.09523},
}
```

ATT&CK identifiers and CVE labels in the simulator are abstract tags. The repository does not ship exploit code. Same seed, same episode is the reproducibility claim. It is not a claim about any real network.
