const W = 62;
const H = 22;

const ZONES = [
    { name: "DMZ", x: 24, y: 5, w: 14, h: 3, color: "forest" },
    { name: "CORP", x: 6, y: 12, w: 16, h: 3, color: "ink" },
    { name: "SECURE", x: 40, y: 12, w: 16, h: 3, color: "crimson" },
    { name: "OT/PLC", x: 40, y: 18, w: 16, h: 3, color: "ochre" }
];

function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function emptyGrid() {
    return Array.from({ length: H }, () => Array.from({ length: W }, () => " "));
}

function write(grid, x, y, text) {
    for (let i = 0; i < text.length; i++) {
        const xx = x + i;
        if (y >= 0 && y < H && xx >= 0 && xx < W) grid[y][xx] = text[i];
    }
}

function box(grid, x, y, w, h, label) {
    for (let i = 0; i < w; i++) {
        grid[y][x + i] = i === 0 ? "+" : i === w - 1 ? "+" : "-";
        grid[y + h - 1][x + i] = i === 0 ? "+" : i === w - 1 ? "+" : "-";
    }
    for (let j = 1; j < h - 1; j++) {
        grid[y + j][x] = "|";
        grid[y + j][x + w - 1] = "|";
    }
    const lx = x + Math.max(1, Math.floor((w - label.length) / 2));
    write(grid, lx, y + 1, label);
}

function vline(grid, x, y0, y1) {
    const a = Math.min(y0, y1);
    const b = Math.max(y0, y1);
    for (let y = a; y <= b; y++) {
        if (grid[y][x] === " ") grid[y][x] = "|";
    }
}

function hline(grid, y, x0, x1) {
    const a = Math.min(x0, x1);
    const b = Math.max(x0, x1);
    for (let x = a; x <= b; x++) {
        if (grid[y][x] === " ") grid[y][x] = "-";
        else if (grid[y][x] === "|") grid[y][x] = "+";
    }
}

function topology(t) {
    const g = emptyGrid();
    write(g, 22, 1, "INTERNET / WAN");
    box(g, 24, 4, 14, 3, "DMZ");
    box(g, 6, 11, 16, 3, "CORPORATE");
    box(g, 40, 11, 16, 3, "SECURE");
    box(g, 40, 17, 16, 3, "OT / PLC");
    vline(g, 31, 3, 4);
    vline(g, 31, 7, 9);
    hline(g, 9, 14, 48);
    vline(g, 14, 9, 11);
    vline(g, 48, 9, 11);
    vline(g, 48, 14, 17);

    write(g, 1, 12, "blue");
    write(g, 1, 13, "_int");
    write(g, 57, 12, "blue");
    write(g, 57, 13, "_sec");
    write(g, 26, 7, "blue_dmz");
    write(g, 2, 2, "red_op");

    const packets = [
        { path: [{ x: 28, y: 2 }, { x: 31, y: 3 }, { x: 31, y: 5 }], glyph: "R", n: 3 },
        { path: [{ x: 31, y: 7 }, { x: 31, y: 9 }, { x: 14, y: 9 }, { x: 14, y: 11 }], glyph: "r", n: 4 },
        { path: [{ x: 18, y: 12 }, { x: 31, y: 9 }, { x: 48, y: 9 }, { x: 48, y: 12 }], glyph: "B", n: 4 },
        { path: [{ x: 48, y: 14 }, { x: 48, y: 17 }], glyph: "*", n: 2 }
    ];

    packets.forEach((p, pi) => {
        const idx = Math.floor(t / 14 + pi * 2) % p.path.length;
        const pt = p.path[idx];
        if (pt && pt.y < H && pt.x < W) g[pt.y][pt.x] = p.glyph;
    });

    write(g, 0, 20, "R red   B blue   * kinetic   | reachability");
    return g.map((row) => row.join("")).join("\n");
}

export function mountNetforgeAscii(el) {
    if (!el) return;
    let tick = 0;
    const draw = () => {
        el.textContent = topology(tick);
    };
    draw();
    if (reducedMotion()) return;
    setInterval(() => {
        tick += 1;
        draw();
    }, 240);
}
