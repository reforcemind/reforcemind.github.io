import { drawFlowedge } from "./sketch-diagram.js?v=8";
import {
    mountSectionSwitch,
    mountStepSwitch,
    mountPerfRace,
    animateSketch
} from "./product-motion.js?v=14";

document.addEventListener("DOMContentLoaded", () => {
    const race = mountPerfRace(document.getElementById("perf-races"));
    mountStepSwitch(document.getElementById("use-switch"));
    mountSectionSwitch(document.getElementById("section-switch"), {
        onChange: (id) => {
            if (id === "perf") race.replay();
            if (id === "system") animateSketch(document.getElementById("flowedge-diagram"));
        }
    });

    const draw = async () => {
        if (document.fonts && document.fonts.ready) {
            try { await document.fonts.ready; } catch (_) { /* ignore */ }
        }
        drawFlowedge(document.getElementById("flowedge-diagram"));
        if (document.querySelector('[data-panel="system"]')?.classList.contains("is-on")) {
            animateSketch(document.getElementById("flowedge-diagram"));
        }
    };
    draw();
});
