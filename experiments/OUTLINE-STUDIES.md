# Historical outline shader experiments

These are two **archival, standalone WebGL2 experiments** moved from an existing public renderer project into Sceneology. They preserve a historical 181-part embedded geometry snapshot. They are **not** the subsequently corrected production geometry and have **no gallery approval**.

## Failed version: inverted-hull outlines

The [inverted-hull variant](backyard-outline-inverted-hull-rejected.html) extrudes a shell along vertex normals and renders dark backfaces around the scene. This technique was rejected as a visual outline solution in the source campaign. The renderer can still execute; **artistic failure and runtime failure are different outcomes**. Preserve the complete failed attempt to compare the shell-based technique against screen-space edge detection.

Source: [public historical WebGL2 prototype](https://github.com/sguzman/renderarium/blob/main/experiments/interactive-shaders/backyard-glsl-v1-rejected-inverted-hull-outline-2026-10-14.html). Git blob: `216ebee8a0f26e944e8db4e433657d5757b0820f`.

## Follow-up version: screen-space detection

The [screen-space variant](backyard-outline-screen-space-v2.html) uses depth/normal-buffer comparisons rather than geometric shell expansion. It is a **research alternative**, not an automatically approved production shader or gallery exhibit. Do not infer measured visual superiority or speed from the difference in algorithms alone.

Source: [public second iteration](https://github.com/sguzman/renderarium/blob/main/experiments/interactive-shaders/backyard-glsl-v2-screen-space-outlines-2026-10-14.html). Git blob: `0e90e32b5af871f14090f2f31d4a9c6dd0263937`.

## Scope and reproducibility

Both public HTML files inline their shaders, controls and compressed geometry. Content review found no external scripts, media, fonts, CDNs, network requests, or external runtime dependencies. Their single visible status label was rewritten to mark the historical geometry and experiment scope; all other source bytes remain the same, subject to Git read-back comparison.

Browser smoke results must be linked separately and evaluated for each version. Rendering under a software WebGL implementation does not prove physical GPU performance; a successful first draw does not establish aesthetic acceptance, benchmark parity or correct behavior of every control.

No private source history, evaluation quotations, screenshots or unpublished assets were migrated. These records belong in the technical catalog only. The owner-approved gallery allowlist remains unchanged.
