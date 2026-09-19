# Malloc-free after load

Training stacks are allowed to allocate. A robot loop is not. Heap traffic after warmup shows up as jitter, not as a line in a throughput table.

FlowEdge sizes resident set at load:

- weights
- decode / SSM state
- ODE or DDIM scratch
- thread pool

from one bump-allocated arena. Supported hot paths do not call `malloc` after that. Same observation, same action. RSS is a number you can write down.

This is narrower than “zero allocations anywhere in the process.” Python still exists in the LeRobot adapter. Encoders may allocate. The claim is about Core’s supported sample path, which is the part that has to be boring on a deadline.

If you add a kernel and it allocates on first use, that is a bug, not a footnote.
