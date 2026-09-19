import { directory } from "./data.js";

const GLYPHS = "./-|\\+*#";

function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function treePrefix(i, n) {
    return i === n - 1 ? "└── " : "├── ";
}

export function mountDirectory(root) {
    if (!root) return;
    const n = directory.length;
    root.innerHTML = `
        <div class="font-mono text-[13px] leading-7 mb-1">.</div>
        ${directory.map((node, i) => `
            <a class="dir-row group" href="${node.href}" data-i="${i}">
                <span class="dir-path whitespace-pre">${treePrefix(i, n)}<span class="dir-chars">${node.path}</span></span>
                <span class="text-on-surface-variant">// ${node.comment}</span>
            </a>
        `).join("")}
    `;

    if (reducedMotion()) return;

    root.querySelectorAll(".dir-row").forEach((row) => {
        let timer = null;
        row.addEventListener("mouseenter", () => {
            const el = row.querySelector(".dir-chars");
            const original = el.dataset.original || el.textContent;
            el.dataset.original = original;
            let k = 0;
            timer = setInterval(() => {
                el.textContent = original.split("").map((ch, idx) => {
                    if (ch === "/" || ch === "." || ch === "_") {
                        return k % 2 === 0 && idx === (k % original.length) ? GLYPHS[(idx + k) % GLYPHS.length] : ch;
                    }
                    return ch;
                }).join("");
                k += 1;
            }, 80);
        });
        row.addEventListener("mouseleave", () => {
            clearInterval(timer);
            const el = row.querySelector(".dir-chars");
            if (el.dataset.original) el.textContent = el.dataset.original;
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    mountDirectory(document.getElementById("directory-tree"));
});
