import { artifactsByKind } from "./data.js";

const LABELS = {
    code: "Code",
    models: "Models",
    datasets: "Datasets",
    benchmarks: "Benchmarks",
    papers: "Papers"
};

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("artifact-registry");
    if (!root) return;
    const grouped = artifactsByKind();
    root.innerHTML = Object.entries(grouped).map(([kind, items]) => `
        <section id="${kind}" class="scroll-mt-28">
            <h2 class="font-serif text-3xl md:text-4xl border-b hairline border-ink-black pb-3 mb-2">${LABELS[kind] || kind}</h2>
            <p class="meta text-on-surface-variant mb-4">${String(items.length).padStart(2, "0")} entries</p>
            <div>
                ${items.map((item) => `
                    <a class="registry-item" href="${item.href}" target="_blank" rel="noopener">
                        <span class="font-mono text-[13px] break-all">${item.title}</span>
                        <span class="meta text-ochre-discovery shrink-0">${item.detail}</span>
                    </a>
                `).join("")}
            </div>
        </section>
    `).join("");
});
