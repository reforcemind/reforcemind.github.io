# Deadline-aware inference

A manipulator at 100 Hz wants a command every 10 ms. If this sample is late, the motors still need a defined action, and that choice has to be replayable.

`--on-miss` is that contract:

| Mode | Meaning |
|---|---|
| `hold` | Keep sending the last accepted action |
| `drop` | Skip the send for this tick |
| `raise` | Fault |

Limits and e-stop stay in the robot adapter. FlowEdge does not pretend to be a safety PLC.

On the current LeRobot Diffusion Policy (PushT, DDIM, published replay) a 10 ms period is missed **20 / 20** steps. CPU step p50 is hundreds of milliseconds; CUDA on a GTX 1650 is 131 ms policy p50, still not 10 ms. The honest statement is: the miss policy works, the checkpoint does not hit the tick.

That is still useful. A runtime that records misses is a better deployment primitive than a blog post that quotes p50 and calls it real-time.
