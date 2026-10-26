# Archived 2D vector character-motion study

**Technical state:** failed visual-quality experiment, functional behavior under re-verification. **Curated exhibition:** not approved.

This public research artifact contains a structured, fully editable SVG composition with a bedroom, reflected character rig and independently named articulation groups. The loop includes small posture shifts, head-follow, delayed hair and garment movement, a blink, and background motes. The mirror image is a reflected clone of the same rig; it is not an independent simulation.

## Migration scope

The scene is a carefully screened reconstruction of earlier owner-authored work. The embedded artwork consists of SVG geometry, gradients, masks, and CSS; no third-party images, fonts, audio or external media are included. The source was rebuilt into a standalone publication file, rather than transplanting earlier commit history or notes.

A network-loaded animation dependency was replaced by the [small public timeline sampler](../runtime/timeline-lite.js). This implementation supports the numeric x/y translation, rotation, vertical scale, opacity and easing used by the scene. It has a deterministic `seek(seconds)` API, and it runs an approximately eight-second loop when motion reduction is not requested. It does **not** implement or claim complete feature or numerical parity with the previous animation engine.

## What failed, and what remains uncertain

Earlier evaluations found the articulated mechanics partially workable but the resulting visual fidelity and organic character motion unsatisfactory. Preserving the attempt does not convert that verdict into success. The current adaptation must be browser-tested for an actual render, changing transforms over time, no broken dependencies, and basic responsive fit; those tests cannot prove that the art looks good.

### Inspect

Open [the standalone SVG motion viewer](mirror-vector-motion-study.html) in a browser. Its animation controller is exposed as `window.sceneologyTimeline`: `seek(2)` samples the second two. `pause()` stops playback, and `play(0)` restarts the loop. The source is inspectable text: every vector element remains editable rather than being flattened to a raster image.

This is a technical artifact inside the repository, not a curated gallery exhibit. A later replacement can coexist with this negative research result without erasing it.
