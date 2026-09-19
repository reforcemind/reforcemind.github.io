# What “real-time” means here

People say real-time when they mean “faster than PyTorch.” Those are different sentences.

**Control real-time** — the physical plant has a period \(T\). A command is valid if it is issued before the next tick. If it is not, the system still needs a defined action. Success is a miss count, not a mean.

**Model latency** — p50 / p99 of one policy sample. Useful, comparable, easy to cheat if you change the checkpoint, the crop, or the encoder placement.

FlowEdge reports both, and refuses to collapse them. The matched Diffusion Policy is faster than PyTorch on CPU and CUDA. It still misses a 10 ms period on that checkpoint. Flow matching is the cheaper head in NFE; it is not a published 10 ms policy either until a measured loop says so.

Generic model servers optimize throughput and batching. A robot wants the newest valid action before a deadline, batch size 1, bounded RSS, replayable misses. That is the product shape even while the current PushT DDIM is slow.

When we have a policy that hits \(T\), the table will say hits, not “real-time capable.”
