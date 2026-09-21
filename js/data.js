export const site = {
  name: "ReForceMind",
  tagline: "Research and systems\nfor agents that\nlearn and act",
  description:
    "A small research lab working on reinforcement learning, agent environments, robotics inference, ML systems, and efficient deployment.",
  url: "https://reforcemind.github.io",
  email: "igorjankowwski@gmail.com",
  github: "https://github.com/reforcemind",
  huggingface: "https://huggingface.co/ReForceMind",
  ogImage: "https://reforcemind.github.io/assets/og-card.png",
  revision: "REV_0.9.0"
};

export const areas = [
  "Reinforcement learning",
  "Agent environments",
  "Robotics",
  "Efficient inference",
  "ML systems"
];

export const pipeline = [
  {
    id: "env",
    label: "Environment",
    detail: "NetForge and future simulators",
    href: "netforge.html"
  },
  {
    id: "train",
    label: "Training",
    detail: "Research, post-training, notes",
    href: "research.html"
  },
  {
    id: "policy",
    label: "Policy",
    detail: "Checkpoints and weights",
    href: "resources.html"
  },
  {
    id: "runtime",
    label: "FlowEdge",
    detail: "C++23 inference runtime",
    href: "flowedge.html"
  },
  {
    id: "hw",
    label: "Hardware",
    detail: "CPU, CUDA, later accelerators",
    href: "flowedge.html#benchmark"
  }
];

export const projects = [
  {
    id: "flowedge",
    name: "FlowEdge",
    kind: "SYSTEM",
    status: "active",
    release: "v0.1.2",
    blurb:
      "C++23 inference runtime for robotics policies: fixed memory after load, explicit miss handling, CPU and CUDA, LeRobot adapter.",
    summary:
      "A deploy runtime for learned policies. Convert a checkpoint once, load it into a bump-allocated arena, sample flow matching or Diffusion Policy, and honor a control period with --on-miss hold|drop|raise.",
    href: "flowedge.html",
    github: "https://github.com/reforcemind/FlowEdge",
    docs: "https://reforcemind.github.io/FlowEdge/",
    contributing: "https://github.com/reforcemind/FlowEdge/blob/main/CONTRIBUTING.md",
    issues: "https://github.com/reforcemind/FlowEdge/issues",
    releases: "https://github.com/reforcemind/FlowEdge/releases/tag/v0.1.2",
    huggingface: "https://huggingface.co/ReForceMind/mamba_flow",
    selected: true,
    backends: [
      { name: "CPU (AVX2 / NEON)", status: "available" },
      { name: "CUDA", status: "available" },
      { name: "Tenstorrent", status: "research" },
      { name: "Metal / Vulkan", status: "planned" }
    ],
    heads: [
      { name: "Flow matching (Euler / Heun / RK4)", status: "available" },
      { name: "Diffusion Policy / DDIM (LeRobot)", status: "available" },
      { name: "Mamba backbone", status: "available" }
    ],
    benchmarks: [
      {
        id: "cpu-dp",
        label: "Diffusion Policy replay, CPU, threads=1",
        flowedge: "851 ms p50",
        baseline: "1409 ms p50",
        note: "Matched PushT vs LeRobot/PyTorch. Faster, not a 10 ms loop."
      },
      {
        id: "cuda-dp",
        label: "Diffusion Policy replay, GTX 1650",
        flowedge: "131 ms p50",
        baseline: "345 ms p50",
        note: "Same observation file as CPU. Encoder still in LeRobot."
      },
      {
        id: "period",
        label: "10 ms period, --on-miss hold",
        flowedge: "20 / 20 misses",
        baseline: "n/a",
        note: "Current PushT DDIM misses the 10 ms tick. Hold last action; do not claim the deadline is hit."
      }
    ]
  },
  {
    id: "netforge",
    name: "NetForge",
    kind: "ENVIRONMENT",
    status: "active",
    release: "paper",
    blurb:
      "MARL environment for cyber defense: red vs blue on generated networks, PettingZoo API, JAX vectorized backend.",
    summary:
      "A multi-agent environment where a red operator attacks a procedurally generated enterprise/OT network and zone-split blue agents defend from synthetic SIEM telemetry.",
    href: "netforge.html",
    github: "https://github.com/reforcemind/NetForge_RL",
    docs: "https://reforcemind.github.io/NetForge_RL/",
    paper: "https://arxiv.org/abs/2604.09523",
    install: "pip install 'netforge_rl[jax] @ git+https://github.com/reforcemind/NetForge_RL'",
    selected: true,
    backends: [
      { name: "PettingZoo ParallelEnv", status: "available" },
      { name: "JAX vectorized core", status: "available" },
      { name: "Gymnasium single-agent facade", status: "available" }
    ]
  }
];

export const artifacts = [
  {
    id: "code-flowedge",
    kind: "code",
    title: "reforcemind/FlowEdge",
    detail: "C++23 runtime · v0.1.2 wheels",
    href: "https://github.com/reforcemind/FlowEdge",
    project: "flowedge"
  },
  {
    id: "code-netforge",
    kind: "code",
    title: "reforcemind/NetForge_RL",
    detail: "PettingZoo + JAX environment",
    href: "https://github.com/reforcemind/NetForge_RL",
    project: "netforge"
  },
  {
    id: "model-mamba-flow",
    kind: "models",
    title: "ReForceMind/mamba_flow",
    detail: "Flow-matching checkpoint for FlowEdge",
    href: "https://huggingface.co/ReForceMind/mamba_flow",
    project: "flowedge"
  },
  {
    id: "model-panda-rf",
    kind: "models",
    title: "panda_reversible_flow_model",
    detail: "Panda · reversible flow · epoch 600",
    href: "https://huggingface.co/ReForceMind/panda_reversible_flow_model",
    project: "research"
  },
  {
    id: "model-panda-dr",
    kind: "models",
    title: "panda_domain_randomization_model",
    detail: "Panda · domain randomization",
    href: "https://huggingface.co/ReForceMind/panda_domain_randomization_model",
    project: "research"
  },
  {
    id: "model-quad-rf",
    kind: "models",
    title: "quadruped_reversible_flow_model",
    detail: "Quadruped · reversible flow",
    href: "https://huggingface.co/ReForceMind/quadruped_reversible_flow_model",
    project: "research"
  },
  {
    id: "model-quad-dr",
    kind: "models",
    title: "quadruped_domain_randomization_model",
    detail: "Quadruped · domain randomization",
    href: "https://huggingface.co/ReForceMind/quadruped_domain_randomization_model",
    project: "research"
  },
  {
    id: "data-panda-rf",
    kind: "datasets",
    title: "panda_reversible_flow",
    detail: "1.84M rows",
    href: "https://huggingface.co/datasets/ReForceMind/panda_reversible_flow",
    project: "research"
  },
  {
    id: "data-panda-dr",
    kind: "datasets",
    title: "panda_domain_randomization",
    detail: "1.84M rows",
    href: "https://huggingface.co/datasets/ReForceMind/panda_domain_randomization",
    project: "research"
  },
  {
    id: "data-quad-rf",
    kind: "datasets",
    title: "quadruped_reversible_flow",
    detail: "Dataset",
    href: "https://huggingface.co/datasets/ReForceMind/quadruped_reversible_flow",
    project: "research"
  },
  {
    id: "data-quad-dr",
    kind: "datasets",
    title: "quadruped_domain_randomization",
    detail: "Dataset",
    href: "https://huggingface.co/datasets/ReForceMind/quadruped_domain_randomization",
    project: "research"
  },
  {
    id: "bench-cpu",
    kind: "benchmarks",
    title: "PushT Diffusion Policy, CPU threads=1",
    detail: "851 ms vs 1409 ms p50",
    href: "https://reforcemind.github.io/FlowEdge/performance.html",
    project: "flowedge"
  },
  {
    id: "bench-cuda",
    kind: "benchmarks",
    title: "PushT Diffusion Policy, GTX 1650",
    detail: "131 ms vs 345 ms p50",
    href: "https://reforcemind.github.io/FlowEdge/performance.html",
    project: "flowedge"
  },
  {
    id: "bench-jax",
    kind: "benchmarks",
    title: "NetForge JAX backend",
    detail: "~2.5e5 env-steps/s at batch 4096 CPU",
    href: "https://reforcemind.github.io/NetForge_RL/",
    project: "netforge"
  },
  {
    id: "paper-netforge",
    kind: "papers",
    title: "NetForge RL: A Multi-Agent Simulation Environment for Cyber Defense with Durative Actions",
    detail: "arXiv:2604.09523",
    href: "https://arxiv.org/abs/2604.09523",
    project: "netforge"
  },
  {
    id: "collection-rfa",
    kind: "models",
    title: "Reversible-Flow-Adaptation collection",
    detail: "HF collection · 8 items",
    href: "https://huggingface.co/collections/ReForceMind/reversible-flow-adaptation",
    project: "research"
  }
];

export const rolesData = [
  {
    id: "01",
    title: "Research Scientist — RL",
    team: "Core Team",
    description: `Product: <a href="netforge.html" class="underline decoration-ink-black/40 hover:decoration-ink-black transition-colors font-medium">NetForge</a>\n\nResponsibilities:\n- Designing MARL environments that look like the operational setting: noisy partial observations, several defenders, an adaptive adversary.\n- Building evaluation probes (memory, attention, temporal, precision, safety, generalization) instead of a single mean-reward curve.\n- Comparing notes on PettingZoo / JAX vectorized backends, scenario generators, and held-out splits.`
  },
  {
    id: "02",
    title: "Systems Engineer — Inference",
    team: "Infrastructure",
    description: `Product: <a href="flowedge.html" class="underline decoration-ink-black/40 hover:decoration-ink-black transition-colors font-medium">FlowEdge</a>\n\nResponsibilities:\n- CUDA kernels, LeRobot adapters, malloc-free CPU paths, and packaging toward pip install flowedge.\n- Honest benchmarks: matched visual-policy replay, miss counts under --period-ms, not generated-token speedups.\n- If you have a robot or a Jetson and can run a converted Diffusion Policy, that is more valuable than another backend sketch.`
  },
  {
    id: "03",
    title: "Open Source Collaborator",
    team: "Applied",
    description: `Product: <a href="https://github.com/reforcemind/FlowEdge/blob/main/CONTRIBUTING.md" target="_blank" class="underline decoration-ink-black/40 hover:decoration-ink-black transition-colors font-medium">CONTRIBUTING.md</a>\n\nResponsibilities:\n- Trying the FlowEdge quickstart, filing a miss-log, or taking a labeled good-first-issue.\n- NetForge environment bugs, evaluation reproductions, and JAX/Python parity checks.\n- Star the repo if you like; a reproduction is better.`
  }
];

export const collab = [
  {
    id: "research",
    title: "Research",
    kicker: "Notes, environments, experiments",
    body: "ReForceMind is a small lab, not a hiring portal. If you are working on MARL environments, robotics policies, or inference systems and want to compare notes, write. A short technical note, a failed experiment, or a dataset is enough to start."
  },
  {
    id: "engineering",
    title: "Engineering",
    kicker: "FlowEdge, kernels, deployment",
    body: "Useful work right now is CUDA kernels, LeRobot adapters, malloc-free CPU paths, packaging (the goal is pip install flowedge), and honest benchmarks. If you have a robot or a Jetson and can run a converted Diffusion Policy, that is more valuable than another backend sketch."
  },
  {
    id: "opensource",
    title: "Open source",
    kicker: "Issues, reproductions, first tasks",
    body: "Star the repo if you like, but trying the quickstart, filing a miss-log, or taking a labeled good-first-issue is better. Discussions and issue templates live on the FlowEdge GitHub. NetForge accepts environment bugs and evaluation reproductions."
  }
];

export const researchData = [
  {
    id: "PAPER-002",
    type: "ESSAY",
    format: "substack",
    title: "Don't malloc after load",
    dek: "After load, sample should not allocate. Then a faster PyTorch median is a kernel compare, and a 10 ms miss is a logged result — not the same slide.",
    date: "2026.09",
    publishedDate: "19 September 2026",
    readMinutes: 16,
    authors: "I. Jankowski",
    fullAuthors: "Igor Jankowski",
    project: "flowedge",
    abstract: [
      "Don't malloc after load. That is how 851 vs 1409 ms on CPU, and 131 vs 345 ms on a GTX 1650, stay a PyTorch compare, and how 20 / 20 misses at 10 ms stay a result instead of a missing row."
    ],
    links: {
      github: "https://github.com/reforcemind/FlowEdge",
      label: "FlowEdge",
      docs: "https://reforcemind.github.io/FlowEdge/"
    },
    contentFile: "js/posts/paper-flowedge.md"
  },
  {
    id: "PAPER-001",
    type: "ESSAY",
    format: "substack",
    title: "Don't train the defender on the true graph",
    dek: "Security teams watch alerts, not a map of every machine. A lot of training setups forget that, treat isolation as instant, and then celebrate mean reward.",
    date: "2026.04",
    publishedDate: "10 April 2026",
    readMinutes: 14,
    authors: "I. Jankowski",
    fullAuthors: "Igor Jankowski",
    project: "netforge",
    abstract: [
      "A simulated defender can raise its score by taking the whole subnet offline, or by using a map of the network that a real analyst would never have. This article explains the setting for people outside the subfield, then walks through observation, action duration, and team structure, and how I evaluate so those shortcuts show up. Examples use NetForge_RL."
    ],
    links: {
      pdf: "https://arxiv.org/abs/2604.09523",
      github: "https://github.com/reforcemind/NetForge_RL",
      label: "NetForge_RL"
    },
    contentFile: "js/posts/paper-netforge.md"
  }
];

export const directory = [
  {
    path: "research/",
    href: "research.html",
    comment: "archive"
  },
  {
    path: "research/flowedge-runtime.md",
    href: "research.html#PAPER-002",
    comment: "p99 · C++23 runtime"
  },
  {
    path: "research/netforge-rl.md",
    href: "research.html#PAPER-001",
    comment: "arXiv:2604.09523"
  },
  {
    path: "projects/flowedge/",
    href: "flowedge.html",
    comment: "C++23 inference runtime"
  },
  {
    path: "projects/netforge/",
    href: "netforge.html",
    comment: "MARL cyber-defense env"
  },
  {
    path: "artifacts/code/",
    href: "resources.html#code",
    comment: "github"
  },
  {
    path: "artifacts/models/",
    href: "resources.html#models",
    comment: "huggingface weights"
  },
  {
    path: "artifacts/datasets/",
    href: "resources.html#datasets",
    comment: "corpora"
  },
  {
    path: "artifacts/benchmarks/",
    href: "resources.html#benchmarks",
    comment: "measured p50 / miss counts"
  },
  {
    path: "artifacts/papers/",
    href: "resources.html#papers",
    comment: "arxiv"
  },
  {
    path: "join/",
    href: "join.html",
    comment: "research · engineering · open source"
  }
];

export function projectById(id) {
  return projects.find((p) => p.id === id);
}

export function selectedProjects() {
  return projects.filter((p) => p.selected);
}

export function latestResearch(n = 4) {
  return researchData.slice(0, n);
}

export function artifactsByKind() {
  const order = ["code", "models", "datasets", "benchmarks", "papers"];
  const grouped = {};
  for (const k of order) grouped[k] = [];
  for (const a of artifacts) {
    if (!grouped[a.kind]) grouped[a.kind] = [];
    grouped[a.kind].push(a);
  }
  return grouped;
}
