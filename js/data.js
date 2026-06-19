export const researchData = [
    {
        id: "REF-001",
        date: "May 2026",
        title: "Flow-Matched Distillation & Reversible Flow Adaptation",
        authors: "Research Team",
        type: "Empirical Evaluation",
        publishedDate: "May 28, 2026",
        fullAuthors: "ReForceMind Research Team",
        abstract: [
            "Evaluation of Flow-Matched Distillation and Reversible Flow Adaptation across Quadruped Locomotion and Panda Manipulation. We demonstrate hardware efficiency and out-of-distribution generalization capabilities for edge deployment.",
            "This report details the projection manifold validation and hardware constraints encountered when distilling continuous flow dynamics into reversible architectures. We analyze training convergence and latency trade-offs, proving that flow-matched architectures can operate within metabolic budgets without sacrificing manipulation precision or locomotion stability."
        ],
        links: {
            github: "https://github.com/reforcemind/Reversible-Flow-Adaptation",
            weights: "resources.html",
            huggingface: "https://huggingface.co/collections/ReForceMind/reversible-flow-adaptation"
        },
        contentFile: "js/posts/ref-001/ref-001.md"
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
        contentFile: "js/posts/ref-002/ref-002.md"
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

