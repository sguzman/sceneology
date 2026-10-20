# Sceneology ontology

The public ontology describes what a scene and its parts **mean**, independently of any particular renderer.

- [Scenes](SCENES.md) — meaning, composition, spatial and temporal structure, realizations.
- [Experiments](EXPERIMENTS.md) — reproducible inquiry, outcomes and non-artistic quality statuses.
- [Record schema](schemas/record-v1.schema.json) — initial machine-readable catalog record contract.

This is a minimal **new public foundation**, not a claim that an existing private ontology has already been migrated. More specialized grammars (constructive 3D, rigging, effects, audio and others) will be integrated only after separate content screening and technical parity checks.

## Separation of layers

1. **Concept:** An object, scene, event, relation, constraint, behavior or material meaning.
2. **Specification:** A declarative instance and its constraints, dependencies and expected result.
3. **Realization:** A concrete authored/constructed asset, scene graph, algorithm or renderer binding.
4. **Experiment:** A testable attempt and its observations, whether successful, partial, failed or unresolved.
5. **Showcase:** An editorial selection of particular publicly viewable realizations, not an ontological status.

These layers may reference each other through stable public identifiers.
