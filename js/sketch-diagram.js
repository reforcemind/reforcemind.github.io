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

function box(svg, { x, y, w, h, title, sub, fill, hatch, seed, dark }) {
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
    const titleY = sub ? y + h / 2 - 8 : y + h / 2 + 6;
    svg.appendChild(el("text", {
        x: x + w / 2,
        y: titleY,
        "text-anchor": "middle",
        class: dark ? "sketch-label sketch-label-light" : "sketch-label"
    }, [])).textContent = title;
    if (sub) {
        const t = el("text", {
            x: x + w / 2,
            y: y + h / 2 + 16,
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
    flowedge: drawFlowedge
};

export function mountDiagrams(root = document) {
    root.querySelectorAll("[data-diagram]").forEach((host) => {
        const fn = DIAGRAMS[host.dataset.diagram];
        if (!fn) return;
        fn(host);
        host.classList.add("is-live");
    });
}
