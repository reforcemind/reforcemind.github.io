const FENCE = /```[\s\S]*?```/g;
const DISPLAY_DOLLAR = /\$\$([\s\S]+?)\$\$/g;
const DISPLAY_BRACKET = /\\\[([\s\S]+?)\\\]/g;
const INLINE_PAREN = /\\\(([\s\S]+?)\\\)/g;

export function extractMath(src) {
    const fences = [];
    let text = src.replace(FENCE, (block) => {
        fences.push(block);
        return `%%FENCE${fences.length - 1}%%`;
    });

    const math = [];
    const stash = (tex, display) => {
        math.push({ tex: tex.trim(), display });
        return `%%MATH${math.length - 1}%%`;
    };

    text = text.replace(DISPLAY_DOLLAR, (_, tex) => stash(tex, true));
    text = text.replace(DISPLAY_BRACKET, (_, tex) => stash(tex, true));
    text = text.replace(INLINE_PAREN, (_, tex) => stash(tex, false));

    fences.forEach((block, i) => {
        text = text.replace(`%%FENCE${i}%%`, block);
    });

    return { text, math };
}

function mathSpan(math, n) {
    const item = math[Number(n)];
    if (!item) return "";
    const cls = item.display ? "essay-eq" : "essay-math";
    const tag = item.display ? "div" : "span";
    return `<${tag} class="${cls}" data-math="${n}"></${tag}>`;
}

export function injectMathPlaceholders(html, math) {
    html = html.replace(/<p>\s*%%MATH(\d+)%%\s*<\/p>/gi, (_, n) => mathSpan(math, n));
    return html.replace(/%%MATH(\d+)%%/g, (_, n) => mathSpan(math, n));
}

export function unwrapMathBlocks(root) {
    if (!root) return;
    root.querySelectorAll("p").forEach((p) => {
        const kids = [...p.childNodes].filter((n) => !(n.nodeType === 3 && !String(n.textContent).trim()));
        if (kids.length === 1 && kids[0].nodeType === 1 && kids[0].classList.contains("essay-eq")) {
            p.replaceWith(kids[0]);
            return;
        }
        if (p.querySelector(":scope > figure, :scope > .essay-eq, :scope > .sketch-board")) {
            while (p.firstChild) p.parentNode.insertBefore(p.firstChild, p);
            p.remove();
        }
    });
}

async function loadKatex() {
    if (window.katex) return window.katex;
    const mod = await import("https://cdn.jsdelivr.net/npm/katex@0.16.9/+esm");
    return mod.default || mod;
}

export async function hydrateMath(root, math) {
    if (!root) return;
    unwrapMathBlocks(root);
    let katex;
    try {
        katex = await loadKatex();
    } catch (err) {
        console.error("KaTeX failed to load", err);
        return;
    }

    root.querySelectorAll("[data-math]").forEach((el) => {
        const item = math[Number(el.dataset.math)];
        if (!item) return;
        try {
            katex.render(item.tex, el, {
                displayMode: item.display,
                throwOnError: false,
                output: "html"
            });
        } catch (err) {
            el.textContent = item.tex;
        }
    });

    root.querySelectorAll("[data-tex]").forEach((el) => {
        try {
            katex.render(el.getAttribute("data-tex"), el, {
                displayMode: el.dataset.display !== "inline",
                throwOnError: false,
                output: "html"
            });
        } catch (err) {
            el.textContent = el.getAttribute("data-tex");
        }
    });
}
