const SKETCH_CSS = `
.sketch-label { font-family: "Patrick Hand", "Comic Sans MS", cursive; font-size: 22px; fill: #1a1208; }
.sketch-label-sm { font-size: 16px; }
.sketch-label-light { fill: #fcefd4; }
.sketch-sub { font-family: "Patrick Hand", "Comic Sans MS", cursive; font-size: 15px; fill: #574240; }
.sketch-label-light.sketch-sub, .sketch-label-light + .sketch-sub { fill: #fcefd4; }
.sketch-note { font-family: "Patrick Hand", "Comic Sans MS", cursive; font-size: 16px; fill: #7A1A1A; }
`;

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function serializeSketch(svg) {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    if (!clone.getAttribute("width")) clone.setAttribute("width", "960");
    if (!clone.getAttribute("height")) {
        const vb = clone.getAttribute("viewBox") || "0 0 960 430";
        const parts = vb.split(/\s+/);
        clone.setAttribute("height", parts[3] || "430");
    }
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `@import url("https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap");${SKETCH_CSS}`;
    clone.insertBefore(style, clone.firstChild);
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "#fffdf8");
    clone.insertBefore(bg, style.nextSibling);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
}

function svgToImage(svg) {
    const xml = serializeSketch(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not rasterize SVG"));
        };
        img.src = url;
    });
}

async function svgToCanvas(svg, scale = 2) {
    const img = await svgToImage(svg);
    const vb = (svg.getAttribute("viewBox") || "0 0 960 430").split(/\s+/).map(Number);
    const w = Math.round((vb[2] || 960) * scale);
    const h = Math.round((vb[3] || 430) * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas;
}

function canvasToRgba(canvas) {
    return canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
}

function setDrawProgress(svg, t) {
    const paths = [...svg.querySelectorAll("path")];
    const texts = [...svg.querySelectorAll("text")];
    paths.forEach((p, i) => {
        const len = Math.max(p.getTotalLength?.() || 80, 24);
        p.style.strokeDasharray = String(len);
        const local = Math.min(1, Math.max(0, t * 1.25 - (i / Math.max(paths.length, 1)) * 0.35));
        p.style.strokeDashoffset = String(len * (1 - local));
        p.style.opacity = local > 0.05 ? "1" : "0";
        if (p.getAttribute("fill") && p.getAttribute("fill") !== "none") {
            p.style.fillOpacity = String(0.72 * local);
        }
    });
    texts.forEach((el) => {
        el.style.opacity = String(Math.min(1, Math.max(0, (t - 0.55) / 0.45)));
    });
}

function clearDrawProgress(svg) {
    svg.querySelectorAll("path, text").forEach((el) => {
        el.style.strokeDasharray = "";
        el.style.strokeDashoffset = "";
        el.style.opacity = "";
        el.style.fillOpacity = "";
    });
}

async function encodeGif(svg) {
    const { GIFEncoder, quantize, applyPalette } = await import("https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js");
    const frames = 14;
    const scale = 1.15;
    const gif = GIFEncoder();
    let palette;
    for (let i = 0; i <= frames; i += 1) {
        setDrawProgress(svg, i / frames);
        const canvas = await svgToCanvas(svg, scale);
        const rgba = canvasToRgba(canvas);
        if (!palette) palette = quantize(rgba, 256);
        const index = applyPalette(rgba, palette);
        gif.writeFrame(index, canvas.width, canvas.height, {
            palette,
            delay: i === frames ? 140 : 9,
            repeat: 0
        });
    }
    clearDrawProgress(svg);
    gif.finish();
    return new Blob([gif.bytes()], { type: "image/gif" });
}

function figName(host) {
    return host.dataset.diagram || "diagram";
}

async function handleExport(host, kind, btn) {
    const svg = host.querySelector("svg");
    if (!svg) return;
    const name = figName(host);
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "…";
    try {
        if (kind === "svg") {
            downloadBlob(new Blob([serializeSketch(svg)], { type: "image/svg+xml" }), `${name}.svg`);
        } else if (kind === "png") {
            const canvas = await svgToCanvas(svg, 2);
            await new Promise((resolve) => canvas.toBlob((blob) => {
                downloadBlob(blob, `${name}.png`);
                resolve();
            }, "image/png"));
        } else {
            const blob = await encodeGif(svg);
            downloadBlob(blob, `${name}.gif`);
        }
    } catch (err) {
        console.error(err);
        btn.textContent = "err";
        setTimeout(() => { btn.textContent = prev; }, 1200);
        return;
    } finally {
        clearDrawProgress(svg);
        btn.disabled = false;
        btn.textContent = prev;
    }
}

export function mountSketchExport(root = document) {
    root.querySelectorAll(".essay-fig").forEach((fig) => {
        if (fig.querySelector(".fig-export")) return;
        const host = fig.querySelector(".sketch-board[data-diagram]");
        if (!host) return;
        const bar = document.createElement("div");
        bar.className = "fig-export";
        bar.setAttribute("aria-label", "Download diagram");
        ["svg", "png", "gif"].forEach((kind) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = kind;
            btn.title = `Download ${kind.toUpperCase()}`;
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                handleExport(host, kind, btn);
            });
            bar.appendChild(btn);
        });
        host.insertAdjacentElement("afterend", bar);
    });
}
