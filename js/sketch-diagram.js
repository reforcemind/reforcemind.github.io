const NS = "http://www.w3.org/2000/svg";

function rng(seed) {
    let a = seed | 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function j(rand, n = 2.6) {
    return (rand() - 0.5) * n;
}

function el(name, attrs = {}, children = []) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
    children.forEach((c) => node.appendChild(c));
    return node;
}

function sketchRect(x, y, w, h, rand) {
    const p = (px, py) => `${px + j(rand)} ${py + j(rand)}`;
    const t = p(x, y);
    const r = p(x + w, y);
    const b = p(x + w, y + h);
    const l = p(x, y + h);
    const tm = `${x + w / 2 + j(rand, 4)} ${y - 1.8 + j(rand)}`;
    const rm = `${x + w + 1.8 + j(rand)} ${y + h / 2 + j(rand, 4)}`;
    const bm = `${x + w / 2 + j(rand, 4)} ${y + h + 1.8 + j(rand)}`;
    const lm = `${x - 1.8 + j(rand)} ${y + h / 2 + j(rand, 4)}`;
    return `M ${t} Q ${tm} ${r} Q ${rm} ${b} Q ${bm} ${l} Q ${lm} ${t} Z`;
}

function sketchLine(x1, y1, x2, y2, rand) {
    const mx = (x1 + x2) / 2 + j(rand, 8);
    const my = (y1 + y2) / 2 + j(rand, 8);
    return `M ${x1 + j(rand, 1.2)} ${y1 + j(rand, 1.2)} Q ${mx} ${my} ${x2 + j(rand, 1.2)} ${y2 + j(rand, 1.2)}`;
}

function arrowHead(x1, y1, x2, y2, rand) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 11;
    const spread = 0.48;
    const ax = x2 + j(rand, 0.8);
    const ay = y2 + j(rand, 0.8);
    const bx = ax - len * Math.cos(angle - spread);
    const by = ay - len * Math.sin(angle - spread);
    const cx = ax - len * Math.cos(angle + spread);
    const cy = ay - len * Math.sin(angle + spread);
    return `M ${bx} ${by} L ${ax} ${ay} L ${cx} ${cy}`;
}

function box(svg, { x, y, w, h, title, sub, fill, hatch, seed, dark, compact }) {
    const rand = rng(seed);
    const path = sketchRect(x, y, w, h, rand);
    svg.appendChild(el("path", {
        d: path,
        fill: hatch,
        stroke: "none"
    }));
    svg.appendChild(el("path", {
        d: path,
        fill: fill,
        "fill-opacity": "0.72",
        stroke: dark ? "#fcefd4" : "#1a1208",
        "stroke-width": "1.7",
        "stroke-linejoin": "round"
    }));
    const rand2 = rng(seed + 17);
    svg.appendChild(el("path", {
        d: sketchRect(x, y, w, h, rand2),
        fill: "none",
        stroke: dark ? "#fcefd4" : "#1a1208",
        "stroke-width": "0.7",
        "stroke-opacity": "0.45",
        "stroke-linejoin": "round"
    }));
    const titleY = sub ? y + h / 2 - (compact ? 6 : 8) : y + h / 2 + 6;
    const titleClass = compact
        ? (dark ? "sketch-label sketch-label-sm sketch-label-light" : "sketch-label sketch-label-sm")
        : (dark ? "sketch-label sketch-label-light" : "sketch-label");
    svg.appendChild(el("text", {
        x: x + w / 2,
        y: titleY,
        "text-anchor": "middle",
        class: titleClass
    }, [])).textContent = title;
    if (sub) {
        const t = el("text", {
            x: x + w / 2,
            y: y + h / 2 + (compact ? 14 : 16),
            "text-anchor": "middle",
            class: dark ? "sketch-sub sketch-label-light" : "sketch-sub"
        });
        t.textContent = sub;
        svg.appendChild(t);
    }
}

function arrow(svg, x1, y1, x2, y2, seed) {
    const rand = rng(seed);
    svg.appendChild(el("path", {
        d: sketchLine(x1, y1, x2, y2, rand),
        fill: "none",
        stroke: "#1a1208",
        "stroke-width": "1.6",
        "stroke-linecap": "round",
        class: "sketch-arrow"
    }));
    svg.appendChild(el("path", {
        d: arrowHead(x1, y1, x2, y2, rand),
        fill: "none",
        stroke: "#1a1208",
        "stroke-width": "1.6",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
    }));
}

function note(svg, x, y, text, seed, anchor = "middle") {
    const t = el("text", {
        x: x + j(rng(seed), 1.5),
        y: y,
        "text-anchor": anchor,
        class: "sketch-note"
    });
    t.textContent = text;
    svg.appendChild(t);
}

function txt(svg, x, y, text, cls, anchor = "middle") {
    const t = el("text", { x, y, "text-anchor": anchor, class: cls });
    t.textContent = text;
    svg.appendChild(t);
}

function pin(svg, x, yBar, label, seed) {
    arrow(svg, x, yBar - 26, x, yBar - 2, seed);
    txt(svg, x, yBar - 34, label, "sketch-note");
}

function memStrip(svg, { x, y, h, segs, seed }) {
    const total = segs.reduce((sum, g) => sum + g.w, 0);
    const rand = rng(seed);
    svg.appendChild(el("path", {
        d: sketchRect(x, y, total, h, rand),
        fill: "#fffaf2",
        stroke: "#1a1208",
        "stroke-width": "1.8",
        "stroke-linejoin": "round"
    }));
    let cx = x;
    segs.forEach((g, i) => {
        const r = rng(seed + 11 + i * 17);
        const p = sketchRect(cx + 1.2, y + 2.2, g.w - 2.4, h - 4.4, r);
        svg.appendChild(el("path", { d: p, fill: g.hatch, stroke: "none" }));
        svg.appendChild(el("path", {
            d: p,
            fill: g.fill,
            "fill-opacity": "0.78",
            stroke: "#1a1208",
            "stroke-width": "1.15",
            "stroke-linejoin": "round"
        }));
        const titleY = g.sub ? y + h / 2 - 5 : y + h / 2 + 5;
        txt(svg, cx + g.w / 2, titleY, g.title, "sketch-label sketch-label-sm");
        if (g.sub) {
            txt(svg, cx + g.w / 2, y + h / 2 + 14, g.sub, "sketch-sub");
        }
        cx += g.w;
    });
    svg.appendChild(el("path", {
        d: sketchRect(x, y, total, h, rng(seed + 91)),
        fill: "none",
        stroke: "#1a1208",
        "stroke-width": "0.7",
        "stroke-opacity": "0.4",
        "stroke-linejoin": "round"
    }));
    return { x, y, w: total, h };
}

function defs(svg) {
    const d = el("defs");
    const patterns = [
        ["hatch-sand", "#d4a017"],
        ["hatch-green", "#2D4B32"],
        ["hatch-red", "#7A1A1A"],
        ["hatch-blue", "#4A6FA5"],
        ["hatch-ink", "#1a1208"]
    ];
    patterns.forEach(([id, color]) => {
        const p = el("pattern", {
            id,
            patternUnits: "userSpaceOnUse",
            width: "7",
            height: "7",
            patternTransform: "rotate(38)"
        });
        p.appendChild(el("path", {
            d: "M 0 0 L 0 7",
            stroke: color,
            "stroke-width": "0.9",
            opacity: "0.28"
        }));
        d.appendChild(p);
    });
    svg.appendChild(d);
}

function board(host, viewBox) {
    host.innerHTML = "";
    const svg = el("svg", {
        viewBox,
        role: "img",
        class: "sketch-svg"
    });
    defs(svg);
    host.appendChild(svg);
    return svg;
}

export function drawFlowedge(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 420");
    svg.setAttribute("aria-label", "FlowEdge path: robot sensors to LeRobot encoder to FlowEdge core to actions, with a miss policy if the sample is late");

    box(svg, { x: 28, y: 148, w: 168, h: 100, title: "robot sensors", sub: "rgb · joints", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 11 });
    box(svg, { x: 248, y: 148, w: 176, h: 100, title: "LeRobot encoder", sub: "cameras stay here", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 23 });
    box(svg, { x: 484, y: 108, w: 228, h: 180, title: "FlowEdge Core", sub: "arena · no malloc", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 41 });
    box(svg, { x: 772, y: 72, w: 160, h: 88, title: "action chunk", sub: "to the motors", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 59 });
    box(svg, { x: 772, y: 228, w: 160, h: 96, title: "if this sample", sub: "is late…", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 73 });

    arrow(svg, 196, 198, 248, 198, 101);
    arrow(svg, 424, 198, 484, 198, 102);
    arrow(svg, 712, 160, 772, 116, 103);
    arrow(svg, 712, 248, 772, 268, 104);

    note(svg, 852, 348, "hold  ·  drop  ·  raise", 202);
    note(svg, 480, 44, "train in PyTorch  →  run the tick in FlowEdge", 203);
}

export function drawNetforge(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 460");
    svg.setAttribute("aria-label", "NetForge loop: your trainer talks to a PettingZoo env, red attacks a generated network, blue reads a filtered SIEM feed");

    box(svg, { x: 360, y: 22, w: 240, h: 78, title: "your trainer", sub: "IPPO · SB3 · RLlib", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 8 });
    box(svg, { x: 330, y: 140, w: 300, h: 84, title: "PettingZoo env", sub: "reset / step / masks", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 19 });
    box(svg, { x: 24, y: 278, w: 188, h: 112, title: "red_operator", sub: "recon, then attack", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 31 });
    box(svg, { x: 268, y: 268, w: 232, h: 132, title: "generated net", sub: "DMZ · corp · OT", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 47 });
    box(svg, { x: 556, y: 286, w: 168, h: 96, title: "SIEM feed", sub: "filtered · delayed", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 61 });
    box(svg, { x: 768, y: 262, w: 168, h: 144, title: "blue × 3", sub: "dmz · int · secure", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 79 });

    arrow(svg, 480, 100, 480, 140, 301);
    arrow(svg, 360, 210, 160, 278, 302);
    arrow(svg, 480, 224, 384, 268, 303);
    arrow(svg, 600, 210, 850, 262, 304);
    arrow(svg, 212, 334, 268, 334, 305);
    arrow(svg, 500, 334, 556, 334, 306);
    arrow(svg, 724, 334, 768, 334, 307);

    note(svg, 480, 448, "same seed  →  same episode. MITRE tags, not exploit code.", 308);
}

export function drawNetforgeObserve(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 400");
    svg.setAttribute("aria-label", "Information split: red must recon the true graph, blue only reads a delayed SIEM feed");

    box(svg, { x: 28, y: 150, w: 200, h: 112, title: "red_operator", sub: "recon, then exploit", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 12 });
    box(svg, { x: 320, y: 78, w: 280, h: 150, title: "true graph", sub: "DMZ · corp · OT", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 33 });
    box(svg, { x: 700, y: 40, w: 220, h: 100, title: "SIEM feed", sub: "filtered · delayed", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 54 });
    box(svg, { x: 700, y: 230, w: 220, h: 120, title: "blue × 3", sub: "never sees the graph", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 71 });

    arrow(svg, 228, 206, 320, 160, 401);
    arrow(svg, 600, 130, 700, 90, 402);
    arrow(svg, 810, 140, 810, 230, 403);

    note(svg, 274, 248, "must recon first", 404, "middle");
    note(svg, 480, 360, "two worlds, one seed. Blue trains on the feed, not the topology.", 405);
}

export function drawFlowedgeStack(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 300");
    svg.setAttribute("aria-label", "C ABI over an opaque engine, kernels.h, then AVX2 NEON or CUDA at link time");

    box(svg, { x: 24, y: 88, w: 200, h: 108, title: "C ABI", sub: "fe_engine*", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 21 });
    box(svg, { x: 268, y: 88, w: 196, h: 108, title: "engine", sub: "arena · weights", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 37 });
    box(svg, { x: 508, y: 88, w: 200, h: 108, title: "kernels.h", sub: "std::span, no alloc", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 52 });
    box(svg, { x: 752, y: 88, w: 184, h: 108, title: "ISA", sub: "AVX2 · NEON · CUDA", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 68 });

    arrow(svg, 224, 142, 268, 142, 901);
    arrow(svg, 464, 142, 508, 142, 902);
    arrow(svg, 708, 142, 752, 142, 903);

    note(svg, 480, 44, "no exception crosses the boundary. OOM is nullptr.", 904);
    note(svg, 480, 258, "backend is a CMake switch, not a runtime dispatcher.", 905);
}

export function drawFlowedgeDeadline(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 300");
    svg.setAttribute("aria-label", "Control period: sample must finish before the next tick, otherwise hold, drop, or raise");

    box(svg, { x: 24, y: 88, w: 196, h: 108, title: "t = 0", sub: "period starts", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 21 });
    box(svg, { x: 268, y: 88, w: 196, h: 108, title: "sample", sub: "still running", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 37 });
    box(svg, { x: 508, y: 88, w: 200, h: 108, title: "deadline", sub: "10 ms wall", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 52 });
    box(svg, { x: 752, y: 88, w: 184, h: 108, title: "on miss", sub: "hold · drop · raise", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 68 });

    arrow(svg, 220, 142, 268, 142, 601);
    arrow(svg, 464, 142, 508, 142, 602);
    arrow(svg, 708, 142, 752, 142, 603);

    note(svg, 480, 44, "p50 can look fine while every tick still misses.", 604);
    note(svg, 480, 258, "the miss is a logged value, not an uncaught exception.", 605);
}

export function drawFlowedgeArena(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 400");
    svg.setAttribute("aria-label", "Convert a checkpoint, load one bump arena, sample without malloc");

    box(svg, { x: 28, y: 150, w: 200, h: 112, title: "checkpoint", sub: "mmap · pre-fault", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 12 });
    box(svg, { x: 320, y: 78, w: 280, h: 150, title: "std::byte slab", sub: "alloc · mark · reset_to", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 33 });
    box(svg, { x: 700, y: 40, w: 220, h: 100, title: "hot path", sub: "malloc = 0", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 54 });
    box(svg, { x: 700, y: 230, w: 220, h: 120, title: "same input", sub: "same output", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 71 });

    arrow(svg, 228, 206, 320, 160, 701);
    arrow(svg, 600, 130, 700, 90, 702);
    arrow(svg, 810, 140, 810, 230, 703);

    note(svg, 274, 248, "std::align + bump", 704, "middle");
    note(svg, 480, 360, "exhaustion returns nullptr. fail in load, not on the tick.", 705);
}

export function drawFlowedgeCoop(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 300");
    svg.setAttribute("aria-label", "Cooperative solve: begin, advance in NFE steps, cancel if a newer observation arrives");

    box(svg, { x: 24, y: 88, w: 200, h: 108, title: "flow_begin", sub: "project c once", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 21 });
    box(svg, { x: 268, y: 88, w: 196, h: 108, title: "flow_advance", sub: "whole NFE steps", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 37 });
    box(svg, { x: 508, y: 88, w: 200, h: 108, title: "newer obs", sub: "cancel watermark", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 52 });
    box(svg, { x: 752, y: 88, w: 184, h: 108, title: "publish", sub: "or drop stale", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 68 });

    arrow(svg, 224, 142, 268, 142, 801);
    arrow(svg, 464, 142, 508, 142, 802);
    arrow(svg, 708, 142, 752, 142, 803);

    note(svg, 480, 44, "yield between solver steps. never inside a matmul.", 804);
    note(svg, 480, 258, "cancel_before is an atomic watermark. one handle, one solve.", 805);
}

export function drawFlowedgeSlab(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 320");
    svg.setAttribute("aria-label", "One arena slab: weights, decode state, flow scratch, thread pool, alignment pad");

    note(svg, 480, 36, "one std::byte slab, sized from the checkpoint at load", 910);

    const segs = [
        { w: 268, title: "W_bytes", sub: "weights", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 11 },
        { w: 168, title: "S_decode", sub: "SSM state", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 23 },
        { w: 168, title: "S_flow", sub: "ODE scratch", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 37 },
        { w: 154, title: "R_pool", sub: "task ring", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 52 },
        { w: 90, title: "O_align", sub: "pad", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 68 }
    ];
    let x = 24;
    segs.forEach((s) => {
        box(svg, {
            x,
            y: 78,
            w: s.w,
            h: 148,
            title: s.title,
            sub: s.sub,
            fill: s.fill,
            hatch: s.hatch,
            seed: s.seed,
            compact: true
        });
        x += s.w + 8;
    });

    note(svg, 480, 262, "exhaustion is nullptr. fail in fe_engine_load, not on the tick.", 911);
    note(svg, 480, 296, "alloc is std::align + bump. mark / reset_to rewinds scratch.", 912);
}

export function drawFlowedgeLayout(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 500");
    svg.setAttribute("aria-label", "Memory layout of the FlowEdge bump arena: one contiguous std::byte slab with begin, mark, cursor, and end pointers");

    const x0 = 40;
    const yBar = 78;
    const hBar = 118;
    const segs = [
        { w: 288, title: "W_bytes", sub: "weights · 64B", fill: "#f7d7d4", hatch: "url(#hatch-red)" },
        { w: 128, title: "S_decode", sub: "SSM state", fill: "#fff6e4", hatch: "url(#hatch-sand)" },
        { w: 124, title: "used", sub: "this layer", fill: "#e7eef8", hatch: "url(#hatch-blue)" },
        { w: 124, title: "free", sub: "scratch", fill: "#f4f7fb", hatch: "url(#hatch-blue)" },
        { w: 164, title: "R_pool", sub: "ring + jthread", fill: "#dcecdc", hatch: "url(#hatch-green)" },
        { w: 60, title: "O", sub: "align", fill: "#fff6e4", hatch: "url(#hatch-sand)" }
    ];
    memStrip(svg, { x: x0, y: yBar, h: hBar, segs, seed: 77 });

    const wEnd = x0 + segs[0].w;
    const dEnd = wEnd + segs[1].w;
    const usedEnd = dEnd + segs[2].w;
    const flowEnd = usedEnd + segs[3].w;
    const poolEnd = flowEnd + segs[4].w;
    const slabEnd = poolEnd + segs[5].w;

    pin(svg, x0 + 10, yBar, "begin_", 941);
    pin(svg, dEnd, yBar, "mark()", 942);
    pin(svg, usedEnd, yBar, "cursor_", 943);
    pin(svg, slabEnd - 8, yBar, "end_", 944);

    const yAddr = yBar + hBar + 28;
    txt(svg, x0, yAddr, "+0", "sketch-sub", "start");
    txt(svg, wEnd, yAddr, "+W", "sketch-sub");
    txt(svg, slabEnd, yAddr, "+slab", "sketch-sub", "end");
    txt(svg, (dEnd + flowEnd) / 2, yAddr + 22, "S_flow  ·  rewindable scratch", "sketch-note");

    note(svg, 480, 258, "weights stay put. scratch is a stack on the same bytes.", 945);

    const zoomY = 300;
    const zoomH = 52;
    const zoomW = [
        [
            { w: 96, title: "used", fill: "#e7eef8", hatch: "url(#hatch-blue)" },
            { w: 184, title: "free", fill: "#fffaf2", hatch: "url(#hatch-sand)" }
        ],
        [
            { w: 96, title: "used", fill: "#e7eef8", hatch: "url(#hatch-blue)" },
            { w: 76, title: "tmp", fill: "#f7d7d4", hatch: "url(#hatch-red)" },
            { w: 108, title: "free", fill: "#fffaf2", hatch: "url(#hatch-sand)" }
        ],
        [
            { w: 96, title: "used", fill: "#e7eef8", hatch: "url(#hatch-blue)" },
            { w: 184, title: "free", fill: "#fffaf2", hatch: "url(#hatch-sand)" }
        ]
    ];
    const labels = ["mark()", "alloc(n, 64)", "reset_to()"];
    zoomW.forEach((zsegs, i) => {
        const y = zoomY + i * 58;
        txt(svg, 24, y + 34, labels[i], "sketch-note", "start");
        memStrip(svg, { x: 168, y, h: zoomH, segs: zsegs, seed: 110 + i * 9 });
    });

    note(svg, 720, 378, "next layer reuses tmp.", 946);
    note(svg, 720, 472, "O(1) in the horizon.", 947);
}

export function drawFlowedgeMmap(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 340");
    svg.setAttribute("aria-label", "plain lazy mmap can fault on first touch; copy at load touches pages and sets kernel layout");

    note(svg, 480, 32, "mmap alone does not populate the pages you will sample from.", 923);

    box(svg, { x: 24, y: 112, w: 220, h: 116, title: ".safetensors", sub: "mmap the file", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 14 });
    box(svg, { x: 312, y: 68, w: 232, h: 92, title: "lazy first touch", sub: "fault can land on tick", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 29 });
    box(svg, { x: 312, y: 188, w: 232, h: 92, title: "copy at load", sub: "touch + align 64", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 44 });
    box(svg, { x: 616, y: 112, w: 320, h: 116, title: "ready slab", sub: "layout set, pages touched", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 61 });

    arrow(svg, 244, 170, 312, 114, 920);
    arrow(svg, 244, 170, 312, 234, 921);
    arrow(svg, 544, 234, 616, 170, 922);

    note(svg, 480, 318, "copy at load. MAP_POPULATE or mlock would also work before sample.", 924);
}

export function drawFlowedgePool(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 300");
    svg.setAttribute("aria-label", "SPMC pool: caller enqueues, workers spin then park on atomic wait");

    box(svg, { x: 24, y: 72, w: 200, h: 120, title: "caller", sub: "small GEMM here", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 18 });
    box(svg, { x: 292, y: 56, w: 240, h: 152, title: "task ring", sub: "arena, pow2, padded", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 33 });
    box(svg, { x: 600, y: 24, w: 332, h: 68, title: "worker 0", sub: "spin, then atomic::wait", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 47, compact: true });
    box(svg, { x: 600, y: 104, w: 332, h: 68, title: "worker 1", sub: "std::jthread in the slab", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 61, compact: true });
    box(svg, { x: 600, y: 184, w: 332, h: 68, title: "worker n", sub: "no packaged_task", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 79, compact: true });

    arrow(svg, 224, 132, 292, 132, 930);
    arrow(svg, 532, 108, 600, 58, 931);
    arrow(svg, 532, 132, 600, 138, 932);
    arrow(svg, 532, 156, 600, 218, 933);

    note(svg, 480, 280, "SPMC, not std::async. enqueue bumps an epoch and wakes one worker.", 934);
}

export function drawNetforgeDurative(host) {
    if (!host) return;
    const svg = board(host, "0 0 960 300");
    svg.setAttribute("aria-label", "Durative action timeline: red exploit is in flight until blue isolate cancels it");

    box(svg, { x: 24, y: 88, w: 200, h: 108, title: "t = 0", sub: "red starts exploit", fill: "#f7d7d4", hatch: "url(#hatch-red)", seed: 21 });
    box(svg, { x: 268, y: 88, w: 196, h: 108, title: "in flight", sub: "red is busy", fill: "#fff6e4", hatch: "url(#hatch-sand)", seed: 37 });
    box(svg, { x: 508, y: 88, w: 200, h: 108, title: "blue isolate", sub: "cancels it", fill: "#e7eef8", hatch: "url(#hatch-blue)", seed: 52 });
    box(svg, { x: 752, y: 88, w: 184, h: 108, title: "next tick", sub: "new action window", fill: "#dcecdc", hatch: "url(#hatch-green)", seed: 68 });

    arrow(svg, 224, 142, 268, 142, 501);
    arrow(svg, 464, 142, 508, 142, 502);
    arrow(svg, 708, 142, 752, 142, 503);

    note(svg, 480, 44, "actions take time. isolate on that host kills the in-flight exploit.", 504);
    note(svg, 480, 258, "this is why a 1-step gym is the wrong abstraction for a SOC.", 505);
}

const DIAGRAMS = {
    "netforge-loop": drawNetforge,
    "netforge-observe": drawNetforgeObserve,
    "netforge-time": drawNetforgeDurative,
    flowedge: drawFlowedge,
    "flowedge-stack": drawFlowedgeStack,
    "flowedge-deadline": drawFlowedgeDeadline,
    "flowedge-arena": drawFlowedgeArena,
    "flowedge-coop": drawFlowedgeCoop,
    "flowedge-slab": drawFlowedgeSlab,
    "flowedge-layout": drawFlowedgeLayout,
    "flowedge-mmap": drawFlowedgeMmap,
    "flowedge-pool": drawFlowedgePool
};

export function mountDiagrams(root = document) {
    root.querySelectorAll("[data-diagram]").forEach((host) => {
        const fn = DIAGRAMS[host.dataset.diagram];
        if (!fn) return;
        fn(host);
        host.classList.add("is-live");
    });
}
