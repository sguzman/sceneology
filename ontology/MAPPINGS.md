# 🔁 Scene representations and renderer mappings

Sceneology separates a **semantic scene** from the techniques used to realize it. A scene's spatial relationships, character/object identities, timing and behavior do not become true merely because a renderer displays a pleasant still. Conversely, a failed renderer does not erase the underlying scene description.

The versioned [representation-map schema](schemas/representation-map-v1.schema.json) provides a public source-to-target mapping:

| Mapping field | Meaning |
| --- | --- |
| `scene_id`, `scene_dimension` | Stable source scene identity and dimensionality; both must match the referenced scene |
| `target` | Display/reconstruction backend: SVG, Canvas 2D, DOM/CSS, WebGL, Three.js or a static raster |
| `coordinate_conversion` | Explicit placement transform regime; 2D top-left pixels and 3D clip-space are different |
| `bindings` | One source element to one named renderer object; IDs must not dangle or collide |
| `unsupported_features` | Capabilities lost at the target boundary; omission is not evidence of parity |
| `status` | `declared`: contract only; `implemented`: real output path exists; `verified`: independently tested and evidence-attached |

The [synthetic SVG mapping](examples/static-2d.mapping.json) names nodes for a declarative static scene. It is **not a rendered SVG**. It is deliberately `declared`.

A usable implementation must also preserve identity and record correspondence for appearance, layering, timing, animation, input, lighting, effects and sound *where applicable*. If a renderer lacks one of these, disclose the limitation in `unsupported_features` and the technical library; do not pretend parity. The schema is a mapping manifest, not a magical converter.

Two-dimensional animation can use authored sprite frames, vector objects, layered compositions or procedural effects without any skeletal rig. Three-dimensional scenes can use constructive geometry or other mesh representations. Both can share high-level entity and experiment semantics, but no 2D technique is required to imitate a 3D implementation strategy.

Publication and human approval are independent. An implemented mapping without a human visual verdict cannot enter the showcase on that basis alone. See [Sceneology's exhibition policy](../docs/PUBLICATION.md).
