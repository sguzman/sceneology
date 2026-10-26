# Sceneology ontology

The public ontology describes what a scene and its parts **mean**, independently of any particular renderer.

- [Scenes](SCENES.md) — starting scene vocabulary.
- [Full human-readable v1 representation](REPRESENTATION.md) — dimension, spatial grammar, animation, interaction, effects, audio, experiments and evidence boundaries.
- [Scene schema](schemas/scene-v1.schema.json), [entity schema](schemas/entity-v1.schema.json), [experiment schema](schemas/experiment-v1.schema.json), and [renderer mapping schema](schemas/representation-map-v1.schema.json) — versioned machine-readable definitions.
- [Renderer mappings](MAPPINGS.md) — correspondence, source identity, limitations and loss-aware targets.
- [Synthetic fixtures](examples/) — standalone 2D, motion, 3D, interaction, reusable entity, and failed-hypothesis examples.
- [Semantic checker](../scripts/check-ontology.mjs) — reference, dimension and timeline integrity with negative controls.
- [Experiments](EXPERIMENTS.md) — reproducible inquiry, outcomes and non-artistic quality statuses.
- [Record schema](schemas/record-v1.schema.json) — initial machine-readable catalog record contract.

This is a **new public foundation**, not a claim that existing private ontology has already been migrated or brought into semantic parity. More specialized grammars (constructive 3D, rigging, effects, audio and others) will be integrated only after separate content screening and technical parity checks.

## Separation of layers

1. **Concept:** An object, scene, event, relation, constraint, behavior or material meaning.
2. **Specification:** A declarative instance and its constraints, dependencies and expected result.
3. **Realization:** A concrete authored/constructed asset, scene graph, algorithm or renderer binding.
4. **Experiment:** A testable attempt and its observations, whether successful, partial, failed or unresolved.
5. **Showcase:** An editorial selection of particular publicly viewable realizations, not an ontological status.

These layers may reference each other through stable public identifiers.
