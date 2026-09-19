const FRAMES = [
`observation
[ rgb | state ]
      |
      v
LeRobot encoder
      |
      v
+------------------+
| FLOWEDGE CORE    |
| arena  ·  no malloc
| DDIM / flow ODE  |
+------------------+
      |
      v
action chunk  -->  robot / PushT
      |
   on-miss: hold | drop | raise`,

`observation
[ rgb | state ]
      |
      v
LeRobot encoder
      |  c
      v
+------------------+
| FLOWEDGE CORE    |
| sampling . . .   |
| NFE  x  velocity |
+------------------+
      |
      v
action chunk  -->  robot / PushT
      |
   period missed?  hold last`,

`observation
[ rgb | state ]
      |
      v
LeRobot encoder
      |
      v
+------------------+
| FLOWEDGE CORE    |
| x_t --> x_{t+1}  |
| deterministic    |
+------------------+
      |
      v
action chunk  -->  robot / PushT
      |
   replayable miss log`
];

function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function mountFlowDemo(el) {
    if (!el) return;
    let i = 0;
    el.textContent = FRAMES[0];
    if (reducedMotion()) return;
    setInterval(() => {
        i = (i + 1) % FRAMES.length;
        el.textContent = FRAMES[i];
    }, 1600);
}
