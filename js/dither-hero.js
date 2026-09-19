const BAYER = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21]
];

const ASCII = " .:-=+*#%@";

function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
}

function drawPlant(ctx, w, h, t) {
    ctx.fillStyle = "#f7e7c4";
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5;
    const base = h * 0.94;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, base);
    ctx.quadraticCurveTo(cx - 6, h * 0.5, cx + 2, h * 0.08);
    ctx.stroke();

    for (let i = 0; i < 16; i++) {
        const y = base - (i + 1) * (h * 0.052);
        const side = i % 2 === 0 ? -1 : 1;
        const sway = Math.sin(t * 0.00025 + i * 0.4) * 5;
        const len = w * 0.22 + (15 - Math.abs(i - 7)) * 4 + sway;
        const lift = -28 - i;
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.moveTo(cx + side * 3, y);
        ctx.quadraticCurveTo(cx + side * len * 0.5, y + lift, cx + side * len, y + 4);
        ctx.stroke();
        const leaflets = 7;
        for (let k = 1; k <= leaflets; k++) {
            const u = k / (leaflets + 1);
            const px = cx + side * len * u;
            const py = y + lift * Math.sin(u * Math.PI) * 0.7 + u * 6;
            const leaf = 14 + (1 - u) * 8;
            ctx.strokeStyle = k % 4 === 0 ? "#7a1a1a" : k % 3 === 0 ? "#2d4b32" : "#111";
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.quadraticCurveTo(px + side * leaf * 0.6, py - 10, px + side * leaf, py - 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.quadraticCurveTo(px + side * leaf * 0.5, py + 6, px + side * leaf * 0.7, py + 3);
            ctx.stroke();
        }
        ctx.strokeStyle = "#111";
    }

    ctx.strokeStyle = "rgba(45,75,50,0.65)";
    ctx.lineWidth = 0.7;
    const ox = w * 0.1;
    const oy = h * 0.14;
    for (let i = 0; i < 4; i++) ctx.strokeRect(ox + i * 16, oy + i * 9, 42, 24);
    ctx.strokeStyle = "rgba(122,26,26,0.75)";
    ctx.beginPath();
    ctx.moveTo(ox + 8, oy + 8);
    ctx.lineTo(cx - 10, h * 0.2);
    ctx.stroke();
}

function toPixels(src, dest, block) {
    const tw = Math.max(1, Math.floor(src.width / block));
    const th = Math.max(1, Math.floor(src.height / block));
    const tmp = makeCanvas(tw, th);
    const tctx = tmp.getContext("2d");
    tctx.imageSmoothingEnabled = false;
    tctx.drawImage(src, 0, 0, tw, th);
    const dctx = dest.getContext("2d");
    dctx.imageSmoothingEnabled = false;
    dctx.clearRect(0, 0, dest.width, dest.height);
    dctx.drawImage(tmp, 0, 0, dest.width, dest.height);
}

function toDither(src, dest) {
    const sctx = src.getContext("2d", { willReadFrequently: true });
    const img = sctx.getImageData(0, 0, src.width, src.height);
    const d = img.data;
    for (let y = 0; y < src.height; y++) {
        for (let x = 0; x < src.width; x++) {
            const i = (y * src.width + x) * 4;
            const lum = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
            const thr = (BAYER[y & 7][x & 7] / 64) * 255;
            const on = lum < thr + 12;
            if (!on) {
                d[i] = 247; d[i + 1] = 231; d[i + 2] = 196;
            } else if (lum < 72) {
                d[i] = 122; d[i + 1] = 26; d[i + 2] = 26;
            } else if (lum < 118) {
                d[i] = 45; d[i + 1] = 75; d[i + 2] = 50;
            } else {
                d[i] = 0; d[i + 1] = 0; d[i + 2] = 0;
            }
            d[i + 3] = 255;
        }
    }
    dest.getContext("2d").putImageData(img, 0, 0);
}

function toAscii(src, dest) {
    const ctx = dest.getContext("2d", { willReadFrequently: true });
    const w = dest.width;
    const h = dest.height;
    const cell = 8;
    const cols = Math.floor(w / cell);
    const rows = Math.floor(h / (cell * 1.15));
    const small = makeCanvas(cols, rows);
    const sc = small.getContext("2d", { willReadFrequently: true });
    sc.drawImage(src, 0, 0, cols, rows);
    const data = sc.getImageData(0, 0, cols, rows).data;
    ctx.fillStyle = "#f7e7c4";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `700 ${cell}px "JetBrains Mono", monospace`;
    ctx.fillStyle = "#1a1a1a";
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const idx = Math.min(ASCII.length - 1, Math.floor((1 - lum / 255) * (ASCII.length - 1)));
            if (idx > 0) ctx.fillText(ASCII[idx], x * cell, cell + y * cell * 1.15);
        }
    }
}

export function mountHero(canvas) {
    const parent = canvas.parentElement;
    const view = canvas.getContext("2d", { alpha: false });
    view.imageSmoothingEnabled = false;

    let w = 0;
    let h = 0;
    let plant = makeCanvas(1, 1);
    let pix = makeCanvas(1, 1);
    let dit = makeCanvas(1, 1);
    let asc = makeCanvas(1, 1);
    let running = true;
    let locked = -1;

    function resize() {
        const cw = Math.max(240, parent.clientWidth);
        const ch = Math.max(240, parent.clientHeight);
        canvas.style.width = `${cw}px`;
        canvas.style.height = `${ch}px`;
        const cap = 640;
        const scale = Math.min(1, cap / cw);
        w = Math.max(240, Math.floor(cw * scale));
        h = Math.max(220, Math.floor(ch * scale));
        canvas.width = w;
        canvas.height = h;
        plant = makeCanvas(w, h);
        pix = makeCanvas(w, h);
        dit = makeCanvas(w, h);
        asc = makeCanvas(w, h);
        view.imageSmoothingEnabled = false;
    }

    resize();

    const cap = document.getElementById("hero-phase");
    const phases = ["ILLUSTRATION", "PIXEL", "DITHER", "ASCII"];
    const period = 4200;

    const pills = document.getElementById("hero-phases");
    if (pills) {
        pills.innerHTML = phases.map((name, i) =>
            `<button type="button" class="phase-btn" data-phase="${i}">${name}</button>`
        ).join("");
        pills.querySelectorAll("button").forEach((btn) => {
            btn.addEventListener("click", () => {
                locked = Number(btn.dataset.phase);
                markPills(locked);
            });
        });
    }

    function markPills(i) {
        if (!pills) return;
        pills.querySelectorAll("button").forEach((btn, idx) => {
            btn.classList.toggle("active", idx === i);
        });
    }

    function buffers(now) {
        drawPlant(plant.getContext("2d"), w, h, now);
        toPixels(plant, pix, 10);
        toDither(plant, dit);
        toAscii(dit, asc);
    }

    if (reducedMotion()) {
        buffers(0);
        view.drawImage(dit, 0, 0, w, h);
        if (cap) cap.textContent = "FIG. 01  //  DITHER";
        markPills(2);
        return;
    }

    let lastHeavy = 0;
    function frame(now) {
        if (running) {
            const cycle = (now / period) % 4;
            const auto = Math.floor(cycle);
            const i = locked >= 0 ? locked : auto;
            const next = locked >= 0 ? i : (auto + 1) % 4;
            const local = cycle - auto;
            const fade = locked >= 0 ? 0 : (local > 0.82 ? (local - 0.82) / 0.18 : 0);

            drawPlant(plant.getContext("2d"), w, h, now);
            const modes = [plant, pix, dit, asc];
            if (i === 1 || next === 1) toPixels(plant, pix, 10);
            if (now - lastHeavy > 120) {
                if (i === 2 || next === 2) toDither(plant, dit);
                if (i === 3 || next === 3) toAscii(dit, asc);
                lastHeavy = now;
            }

            view.drawImage(modes[i], 0, 0, w, h);
            if (fade > 0) {
                view.globalAlpha = fade;
                view.drawImage(modes[next], 0, 0, w, h);
                view.globalAlpha = 1;
            }
            if (cap) cap.textContent = locked >= 0
                ? `FIG. 01  //  ${phases[i]}`
                : `FIG. 01  //  ${phases[i]}  →  ${phases[next]}`;
            markPills(i);
        }
        requestAnimationFrame(frame);
    }

    const vis = new IntersectionObserver((entries) => {
        running = entries.some((e) => e.isIntersecting);
    }, { threshold: 0.05 });
    vis.observe(parent);

    if (typeof ResizeObserver !== "undefined") {
        new ResizeObserver(() => resize()).observe(parent);
    } else {
        let resizeTick = 0;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTick);
            resizeTick = setTimeout(resize, 120);
        });
    }
    requestAnimationFrame(frame);
}
