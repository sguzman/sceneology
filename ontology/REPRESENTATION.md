# 🧠 Sceneology ontology v1: human-readable contract

This document describes the same **public, renderer-independent** vocabulary as [scene-v1.schema.json](schemas/scene-v1.schema.json), [entity-v1.schema.json](schemas/entity-v1.schema.json) and [experiment-v1.schema.json](schemas/experiment-v1.schema.json). Examples are synthetic schema fixtures, **not claims that historical art has been migrated, rendered, reviewed or approved**.

## Layers of identity

1. **Entity archetype** — reusable meaning and capabilities (character, object, environment, camera, light, emitter or controller). An archetype does not determine visual quality or render engine.
2. **Scene** — bounded composition with stable identity, frame, elements, relationships, constraints, visual presentation and possible time/interaction.
3. **Element** — situated, addressable instance with role, shape, transform, optional appearance, parent and asset binding. A distinct `id` exists for every element in one scene.
4. **Realization** — a concrete approach to making an element or scene appear or behave. A source file or rendering method does not establish visual approval.
5. **Rendering** — a frame/output at a specified state, time, camera and rendering backend. A screenshot cannot prove continuous motion.
6. **Experiment** — an isolated attempt with hypothesis, method, inputs, observations, outcome and limitations; a failure remains useful research.
7. **Exhibition selection** — an independent owner decision stored only in `catalog/showcase.json`. No ontology or technical status implies exhibition approval.

A semantic scene can have multiple renderers, representations or art treatments without changing the meanings of its parts. A variant should retain a distinct identity and explain its parentage in the technical library or public provenance.

## Scene document fields

| Field | Meaning and invariant |
| --- | --- |
| `schema_version` | Integer `1`; schema changes require versioning or explicit migrations |
| `id`, `title` | Stable machine identity and human-readable label |
| `dimension` | Explicit `2d` or `3d`, never silently inferred from art |
| `units` | `px`, `m`, or `unit`; coordinates are not interchangeable without conversion |
| `frame` | Positive width/height; depth required for 3D and forbidden for 2D |
| `elements` | Unique scene-local IDs; roles, shape and transforms are typed |
| `relations` | Typed subject–predicate–object links to existing, distinct elements |
| `constraints` | Declared geometric/ordering requirements, not assertions that a renderer has satisfied them |
| `presentation` | Color, draw order, optional camera, style identity and palette; this is not ownership of artistic approval |
| `timeline` | Optional fps, duration, loop and target-property keyframes |
| `inputs` | Optional trigger-to-action declarations, not proof that a given runtime handled events |
| `effects` | Optional typed visual treatments with numeric parameters; simulation fidelity is unspecified |
| `audio_cues` | Optional cue bindings; sound file existence and audible fidelity need separate evidence |
| `realization` | Implementation mode, engine label, assets and limitations; `declarative-only` is explicitly not a rendered artifact |

## Spatial conventions

The coordinate system is declared by `dimension`, `units` and `frame`.

- For **2D**, `[x,y]` uses a top-left origin: +x right, +y down. Frame extent is `width × height`. The order of painted elements is explicitly in `presentation.draw_order`, back to front; draw order is not a substitute for depth coordinates.
- For **3D**, `[x,y,z]` uses a right-handed coordinate frame: +x right, +y up, +z toward the viewer for the initial nominal camera. Frame `width × height × depth` describes scene extent, not display pixels; display projection is a separate renderer/camera decision.
- `position` and `scale` use dimension-matching vectors; scale components must be positive. Optional `size` uses the same vector length and positive components.
- `rotation` is a scalar angle **in degrees** around the screen-normal axis for 2D or the nominal vertical axis for 3D. This intentionally limited v1 cannot describe arbitrary 3D orientations. Future rotation representations must be explicit and versioned.
- `parent_id` expresses hierarchy. Parent chains must be acyclic and must not point outside the scene.
- A relation is explicit: `occludes`, `supported-by`, `in-front-of`, `inside`, `adjacent-to`, `attached-to` or `interacts-with`. Its truth is a *declaration*; geometric validation requires an applicable implementation.

## Temporal/interactive conventions

Timeline times use nonnegative **seconds**, from time zero through `duration_seconds`; `fps` describes intended sampling, not a verified capture. Tracks address one existing element and one property:

- `position` and `scale`: 2 or 3 numeric components matching dimension.
- `rotation` and `opacity`: numeric, with opacity in [0, 1].
- `visible`: boolean with `step` interpolation only.

Keyframes must be strictly increasing in time, must not exceed duration, and must agree with the property type. Tracks cannot duplicate a target-property pair. Rendering between keyframes follows `step` or `linear`, but a declarative fixture alone is not an executable animation.

Input events may request `toggle-visibility`, `set-opacity`, `play-timeline` and `pause-timeline`. Opacity actions require a numerical value. Timeline actions require an actual timeline. Event handling, focus behavior and accessibility must be tested in the real viewer.

## Reusable entities and experiments

An [entity archetype](schemas/entity-v1.schema.json) defines roles, supported dimensions, properties, possible relations and realizations. It does **not** contain concrete scene coordinates. Scenes may instantiate it without depending on a single renderer's geometry.

An [experiment](schemas/experiment-v1.schema.json) separates question, falsifiable hypothesis, method, inputs, observation **kind**, outcome, status and limitations. A `visual` observation must not be promoted to `measurement`; a `human-evaluation` observation needs an authorized public-safe summary. Failed experiments can enter the technical library after screening but cannot enter the curated gallery.

## Mapping and machine checks

The [representation mapping contract](MAPPINGS.md) explains how stable scene element IDs are mapped onto renderer-specific nodes without asserting capability parity. Its [formal schema](schemas/representation-map-v1.schema.json) and [declarative fixture](examples/static-2d.mapping.json) are checked for source identity, one-to-one bindings and dimensional conventions.

The JSON Schemas establish field names, enumerations, basic types and conditional structure. `scripts/check-ontology.mjs` additionally enforces cross-field invariants: IDs/references, dimensional consistency, hierarchy cycles, rendering order, timeline bounds and shape restrictions. **This lightweight checker is not a full Draft 2020-12 JSON Schema implementation**; a separate standards-conformant schema engine should be used by downstream consumers when available. The included positive and negative fixtures check the exact scope supported here.

The public examples are standalone synthetic data; they do not contain historical private ontology, source paths, captured reviews or third-party art. When real source migrations begin, compare their semantics against v1 explicitly and evolve the vocabulary rather than pretending that private materials were already reconciled.

## Examples

- [Static 2D scene](examples/static-2d.scene.json)
- [2D motion](examples/animated-2d.scene.json)
- [Static 3D scene](examples/static-3d.scene.json)
- [2D interactive scene](examples/interactive-2d.scene.json)
- [Failure record](examples/failed-experiment.json)
- [Reusable entity](examples/reusable-entity.json)
- [2D rendering map](examples/static-2d.mapping.json)
