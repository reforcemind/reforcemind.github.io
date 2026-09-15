export const researchData = [];

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

