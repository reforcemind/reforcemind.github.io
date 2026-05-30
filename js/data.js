const researchData = [
    {
        id: "REF-001",
        date: "May 2026",
        title: "Flow-Matched Distillation & Reversible Flow Adaptation",
        authors: "Research Team",
        type: "Empirical Evaluation",
        publishedDate: "May 28, 2026",
        fullAuthors: "ReForceMind Research Team",
        abstract: [
            "Empirical evaluation of Flow-Matched Distillation and Reversible Flow Adaptation across Quadruped Locomotion and Panda Manipulation. We demonstrate significant hardware efficiency and robust out-of-distribution generalization capabilities for edge deployment.",
            "This report details the projection manifold validation and hardware constraints encountered when distilling complex continuous flow dynamics into reversible architectures. We specifically analyze training convergence and latency trade-offs, proving that flow-matched architectures can operate within strict metabolic budgets without sacrificing manipulation precision or locomotion stability."
        ],
        links: {
            pdf: "https://elprofesoriqo.github.io/Reversible-Flow-Adaptation/",
            github: "https://github.com/elprofesoriqo/Reversible-Flow-Adaptation",
            weights: "resources.html",
            huggingface: "https://huggingface.co/collections/ReForceMind/reversible-flow-adaptation"
        }
    },
    {
        id: "REF-002",
        date: "Apr 2026",
        title: "Event-Driven Temporal Graph Networks for Asynchronous Multi-Agent Cyber Defense",
        authors: "Research Team",
        type: "Primary Research",
        publishedDate: "April 18, 2026",
        fullAuthors: "ReForceMind Research Team",
        abstract: [
            "The transition of Multi-Agent Reinforcement Learning (MARL) policies from simulated cyber wargames to operational Security Operations Centers (SOCs) is fundamentally bottlenecked by the Sim2Real gap. Legacy simulators abstract away network protocol physics, rely on synchronous ticks, and provide clean state vectors rather than authentic, noisy telemetry.",
            "To resolve these limitations, we introduce NetForge_RL: a high-fidelity cyber operations simulator that reformulates network defense as an asynchronous, continuous-time Partially Observable Semi-Markov Decision Process (POSMDP). NetForge enforces Zero-Trust Network Access (ZTNA) constraints and requires defenders to process NLP-encoded SIEM telemetry. Crucially, NetForge bridges the Sim2Real gap natively via a dual-mode engine, allowing high-throughput MARL training in a mock hypervisor and zero-shot evaluation against live exploits in a Docker hypervisor.",
            "To navigate this continuous-time POSMDP, we propose Continuous-Time Graph MARL (CT-GMARL), utilizing fixed-step Neural Ordinary Differential Equations (ODEs) to process irregularly sampled alerts. Empirical results demonstrate that CT-GMARL achieves a converged median Blue reward of 57,135 - a 2.0x improvement over R-MAPPO and 2.1x over QMIX."
        ],
        links: {
            pdf: "https://arxiv.org/abs/2604.09523",
            github: "https://github.com/xaiqo/NetForge_RL",
            github2: "https://github.com/xaiqo/ct-gmarl",
            weights: "resources.html"
        }
    },
    {
        id: "REF-003",
        date: "Mar 2026",
        title: "Dual-Gated Epistemic Time-Dilation: Autonomous Compute Modulation in Asynchronous MARL",
        authors: "Research Team",
        type: "Primary Research",
        publishedDate: "March 11, 2026",
        fullAuthors: "ReForceMind Research Team",
        abstract: [
            "While Multi-Agent Reinforcement Learning (MARL) algorithms achieve unprecedented successes across complex continuous domains, their standard deployment strictly adheres to a synchronous operational paradigm. Under this paradigm, agents are universally forced to execute deep neural network inferences at every micro-frame, regardless of immediate necessity. This dense throughput acts as a fundamental barrier to physical deployment on edge-devices where thermal and metabolic budgets are highly constrained.",
            "We propose Epistemic Time-Dilation MAPPO (ETD-MAPPO), augmented with a Dual-Gated Epistemic Trigger. Instead of depending on rigid frame-skipping (macro-actions), agents autonomously modulate their execution frequency by interpreting aleatoric uncertainty (via Shannon entropy of their policy) and epistemic uncertainty (via state-value divergence in a Twin-Critic architecture). To format this, we structure the environment as a Semi-Markov Decision Process (SMDP) and build the SMDP-Aligned Asynchronous Gradient Masking Critic to ensure proper credit assignment.",
            "Empirical findings demonstrate massive improvements (> 60% relative baseline acquisition leaps) over current temporal models. By assessing LBF, MPE, and the 115-dimensional state space of Google Research Football (GRF), ETD correctly prevented premature policy collapse. Remarkably, this unconstrained approach leads to emergent Temporal Role Specialization, reducing computational overhead by a statistically dominant 73.6%."
        ],
        links: {
            pdf: "https://arxiv.org/abs/2603.23722",
            github: "https://github.com/xaiqo/edtmappo",
            weights: "resources.html"
        }
    }
];

const rolesData = [
    {
        id: "01",
        title: "Research Scientist - RL",
        team: "Core Team",
        description: "Product: Next-generation post-training environments and unsupervised reinforcement learning architectures.\n\nResponsibilities:\n- Design and implement novel reinforcement learning algorithms for continuous control.\n- Scale unsupervised environment interaction and reward shaping methodologies.\n- Co-develop scalable algorithmic substitution tools for Vision-Language-Action (VLA) models."
    },
    {
        id: "02",
        title: "Systems Engineer - Training",
        team: "Infrastructure",
        description: "Product: High-fidelity simulators and distributed computing engines that train asynchronous multi-agent policies.\n\nResponsibilities:\n- Build and optimize the distributed systems that power massive-scale RL experiments.\n- Tackle critical bottlenecks in data loading, multi-node communication, and raw GPU utilization.\n- Implement dual-mode engines allowing zero-shot evaluation across isolated environments."
    },
    {
        id: "03",
        title: "Machine Learning Engineer",
        team: "Applied",
        description: "Product: The deployment pipeline and edge-inference tools for hardware-constrained robotics and edge-devices.\n\nResponsibilities:\n- Deploy and optimize policy models for strict thermal and metabolic budgets.\n- Maintain and scale production inference pipelines utilizing TensorRT and TorchScript.\n- Engineer the continuous integration and deployment systems that deliver model weights directly to live robotic operations."
    }
];
