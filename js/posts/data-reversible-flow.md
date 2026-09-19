# Reversible-Flow-Adaptation

Collection: [huggingface.co/collections/ReForceMind/reversible-flow-adaptation](https://huggingface.co/collections/ReForceMind/reversible-flow-adaptation)

Test-time adaptation for robotic control using rectified flows. Two embodiments (Panda, quadruped), two training recipes (reversible flow, domain randomization). Checkpoints are final-epoch (600) across seeds `1`, `2`, `42`.

Architecture, as recorded on the model cards:

1. ViT state encoder with an auxiliary physics-distillation head (privileged parameters such as mass or friction).
2. 1D U-Net vector field, optimal-transport / rectified flow.

Weights are JAX / Orbax, not FlowEdge safetensors. They belong in the research layer: environments and post-training, not the C++ runtime. Connecting this family to FlowEdge is future conversion work, not a current deploy path.

Datasets on the Hub include `panda_reversible_flow` and `panda_domain_randomization` (~1.84M rows each) plus quadruped counterparts.
