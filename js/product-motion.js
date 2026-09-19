function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function mountReveal(root = document) {
    const nodes = [...root.querySelectorAll("[data-reveal]")];
    if (!nodes.length) return;
    if (reduced()) {
        nodes.forEach((n) => n.classList.add("is-in"));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("is-in");
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: "80px 0px -6% 0px" });
    nodes.forEach((n) => {
        const top = n.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.92) n.classList.add("is-in");
        else io.observe(n);
    });
}

export function mountSectionSwitch(nav, { onChange } = {}) {
    if (!nav) return;
    const buttons = [...nav.querySelectorAll("[data-target]")];
    const sections = buttons
        .map((b) => document.querySelector(`[data-panel="${b.dataset.target}"]`))
        .filter(Boolean);
    if (!sections.length) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let i = Math.max(0, sections.findIndex((s) => s.classList.contains("is-on")));
    let booted = false;

    const setOn = (id) => {
        const next = sections.findIndex((s) => s.dataset.panel === id);
        if (next < 0) return;
        i = next;
        buttons.forEach((b) => {
            const on = b.dataset.target === id;
            b.classList.toggle("is-on", on);
            if (on) b.setAttribute("aria-pressed", "true");
            else b.removeAttribute("aria-pressed");
        });
        sections.forEach((s) => {
            const on = s.dataset.panel === id;
            if (on && booted) {
                s.classList.remove("is-on");
                void s.offsetWidth;
                s.classList.add("is-on");
            } else {
                s.classList.toggle("is-on", on);
            }
        });
        history.replaceState(null, "", `#${id}`);
        window.scrollTo(0, 0);
        onChange?.(id);
        booted = true;
    };

    buttons.forEach((b) => {
        b.addEventListener("click", () => setOn(b.dataset.target));
    });

    nav.querySelector("[data-sec-prev]")?.addEventListener("click", () => {
        setOn(sections[(i - 1 + sections.length) % sections.length].dataset.panel);
    });
    nav.querySelector("[data-sec-next]")?.addEventListener("click", () => {
        setOn(sections[(i + 1) % sections.length].dataset.panel);
    });

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        const id = a.getAttribute("href").slice(1);
        if (!sections.some((s) => s.dataset.panel === id)) return;
        a.addEventListener("click", (e) => {
            e.preventDefault();
            setOn(id);
        });
    });

    window.addEventListener("keydown", (e) => {
        if (e.defaultPrevented) return;
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            setOn(sections[(i - 1 + sections.length) % sections.length].dataset.panel);
        }
        if (e.key === "ArrowRight") {
            e.preventDefault();
            setOn(sections[(i + 1) % sections.length].dataset.panel);
        }
    });

    const hash = location.hash.replace("#", "");
    if (hash && sections.some((s) => s.dataset.panel === hash)) setOn(hash);
    else setOn(sections[i]?.dataset.panel || sections[0].dataset.panel);
}

export function mountStepSwitch(root) {
    if (!root) return;
    const steps = [...root.querySelectorAll(".use-item")];
    if (!steps.length) return;
    const prev = root.querySelector("[data-step-prev]");
    const next = root.querySelector("[data-step-next]");
    const all = root.querySelector("[data-step-all]");
    const label = root.querySelector(".step-label");
    const dots = root.querySelector(".step-dots");
    let i = 0;
    let showAll = reduced();

    if (dots) {
        dots.innerHTML = steps.map((_, k) =>
            `<button type="button" class="step-dot" data-step="${k}" aria-label="Step ${k + 1}"></button>`
        ).join("");
        dots.querySelectorAll("button").forEach((b) => {
            b.addEventListener("click", () => {
                showAll = false;
                root.classList.remove("show-all");
                paint(Number(b.dataset.step));
            });
        });
    }

    function paint(n) {
        i = (n + steps.length) % steps.length;
        steps.forEach((s, k) => {
            s.classList.toggle("is-on", showAll || k === i);
            s.classList.toggle("is-enter", !showAll && k === i);
        });
        dots?.querySelectorAll("button").forEach((d, k) => d.classList.toggle("is-on", k === i));
        if (label) label.textContent = `${i + 1} / ${steps.length}`;
        root.classList.toggle("show-all", showAll);
        if (all) all.textContent = showAll ? "Walk through" : "Show all";
    }

    prev?.addEventListener("click", () => {
        showAll = false;
        paint(i - 1);
    });
    next?.addEventListener("click", () => {
        showAll = false;
        paint(i + 1);
    });
    all?.addEventListener("click", () => {
        showAll = !showAll;
        paint(i);
    });

    paint(0);
}

export function mountPerfRace(root) {
    if (!root) return { replay() {} };

    const replay = () => {
        root.classList.remove("is-running");
        void root.offsetWidth;
        root.classList.add("is-running");
    };
    return { replay };
}

export function animateSketch(host) {
    if (!host) return;
    const svg = host.querySelector("svg");
    if (!svg) return;
    host.classList.add("is-live");
}

export function mountScenarioSwitch(root) {
    if (!root) return { play() {}, stop() {} };
    const cards = [...root.querySelectorAll("[data-scenario]")];
    if (!cards.length) return { play() {}, stop() {} };
    let i = 0;
    let timer = 0;
    const paint = (n) => {
        i = (n + cards.length) % cards.length;
        cards.forEach((c, k) => c.classList.toggle("is-on", k === i));
    };
    const stop = () => clearInterval(timer);
    const play = () => {
        if (reduced()) return;
        stop();
        timer = setInterval(() => paint(i + 1), 4200);
    };
    root.querySelector("[data-sc-prev]")?.addEventListener("click", () => {
        paint(i - 1);
        play();
    });
    root.querySelector("[data-sc-next]")?.addEventListener("click", () => {
        paint(i + 1);
        play();
    });
    paint(0);
    if (reduced()) {
        cards.forEach((c) => c.classList.add("is-on"));
        root.classList.add("show-all");
        return { play() {}, stop() {} };
    }
    return { play, stop };
}
