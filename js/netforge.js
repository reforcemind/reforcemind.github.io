import { projects } from "./data.js";
import { drawNetforge } from "./sketch-diagram.js?v=8";
import {
    mountSectionSwitch,
    mountStepSwitch,
    mountScenarioSwitch,
    animateSketch
} from "./product-motion.js?v=14";

document.addEventListener("DOMContentLoaded", () => {
    mountStepSwitch(document.getElementById("use-switch"));
    const scenarios = mountScenarioSwitch(document.getElementById("scenario-stage"));
    mountSectionSwitch(document.getElementById("section-switch"), {
        onChange: (id) => {
            if (id === "system") animateSketch(document.getElementById("netforge-diagram"));
            if (id === "scenarios") scenarios.play();
            else scenarios.stop();
        }
    });

    const draw = async () => {
        if (document.fonts && document.fonts.ready) {
            try { await document.fonts.ready; } catch (_) { /* ignore */ }
        }
        drawNetforge(document.getElementById("netforge-diagram"));
        if (document.querySelector('[data-panel="system"]')?.classList.contains("is-on")) {
            animateSketch(document.getElementById("netforge-diagram"));
        }
    };
    draw();

    const p = projects.find((x) => x.id === "netforge");
    if (!p) return;
    const install = document.getElementById("netforge-install");
    if (install) install.textContent = p.install;
});
