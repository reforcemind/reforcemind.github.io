export const researchData = [
    {
        id: "REF-001",
        date: "July 2026",
        title: "Structure-Adaptive Jacobian Recovery for Receding-Horizon MPC",
        authors: "Research Team",
        type: "Algorithm Release",
        publishedDate: "July 02, 2026",
        fullAuthors: "ReForceMind Research Team",
        abstract: [
            "We present a structure-adaptive recovery pipeline for quasi-Newton solvers in receding-horizon MPC, built around two empirically characterised discontinuity archetypes: column-sparse gear events and rank-≈1 dense contact events.",
            "A tracking-error subspace detector triggers recovery; a density pre-screen routes to binary-splitting group testing (Θ(r log N/r) JVPs) or a secant continuation. On a coupled chain at N=64, the Adaptive solver achieves a 10.3× reduction in JVPs over finite differences; the Hybrid solver resolves N=32 coupling instability at 4.2× below FD."
        ],
        contentFile: "js/posts/ref-002/ref-002.md"
    },
    {
        id: "REF-002",
        date: "June 2026",
        title: "NetForge RL: Multi-Agent Cybersecurity Environment",
        authors: "Research Team",
        type: "Environment Release",
        publishedDate: "June 19, 2026",
        fullAuthors: "ReForceMind Research Team",
        abstract: [
            "We introduce NetForge RL, a Multi-Agent Reinforcement Learning environment where Red agents attack a network and Blue agents defend it.",
            "Built on PettingZoo with a JAX backend, NetForge offers fast vectorized training, partial observability, realistic telemetry, and MITRE ATT&CK alignment, paving the way for advanced LLM and RL-based cybersecurity agents."
        ],
        links: {
            github: "https://github.com/reforcemind/NetForge_RL",
            website: "https://reforcemind.github.io/NetForge_RL/"
        },
        contentFile: "js/posts/ref-001/ref-001.md"
    }
];

export const rolesData = [
    {
        id: "01",
        title: "Research Scientist - RL",
        team: "Core Team",
        description: `Product: <a href="" target="_blank" class="underline decoration-ink-black/40 hover:decoration-ink-black transition-colors font-medium">Post-training framework</a>\n\nResponsibilities:\n- Building automated DPO pipelines that use Vision-Language Models (VLMs) as judges for VLA trajectories.\n- Implementing XAI tools directly into the environment to analyze parameters and identify agent bottlenecks.\n- Designing and testing unsupervised environment interactions without relying on hardcoded, manual reward functions.`
    },
    {
        id: "02",
        title: "Systems Engineer - Training",
        team: "Infrastructure",
        description: `Product: <a href="" target="_blank" class="underline decoration-ink-black/40 hover:decoration-ink-black transition-colors font-medium">Post-training framework</a>\n\nResponsibilities:\n- Building and optimizing the infrastructure that connects local simulation rollouts with VLM evaluation loops.\n- Tackling system bottlenecks in data loading, state rendering, and raw inference speeds during the post-training phase.\n- Ensuring the framework remains lightweight, easy to deploy locally.`
    },
    {
        id: "03",
        title: "Machine Learning Engineer",
        team: "Applied",
        description: `Product: <a href="https://github.com/reforcemind/NetForge_RL" target="_blank" class="underline decoration-ink-black/40 hover:decoration-ink-black transition-colors font-medium">Netforge</a>\n\nResponsibilities:\n- Rewriting the core environment into pure JAX.\n- Maintaining a dual-backend architecture to keep the JAX core and PyTorch ecosystem working together smoothly via zero-copy data transfers.\n- Building semantic wrappers that translate numerical environment states into prompts, allowing us to test and fine-tune LLMs/VLMs directly in the loop.\n- Setting up an independent rendering pipeline and writing clean, interactive notebooks so the project is actually straightforward to use.`
    }
];

