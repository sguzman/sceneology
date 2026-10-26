# 🧪 Release evidence: archival WebGL2 specimens

**Evidence recorded:** 2026-10-26. **Category:** real headless browser smoke with software-backed WebGL2. This document is a technical test summary, **not an artistic endorsement**.

## Independently executed checks

[GitHub Actions browser run 40341655703](https://github.com/sguzman/sceneology/actions/runs/40341655703) completed successfully and uploaded DOM captures, stderr logs, PNG screenshots and a machine-readable test report. The run executed three self-contained archival studies:

| Technical specimen | Browser status | Evidence boundary |
| --- | --- | --- |
| Historical Backyard day/night | passed first draw | 181-part pre-correction geometry; real first render, not current scene |
| Rejected inverted-hull outlines | passed first draw | Runtime was functional, but the visual outline approach remains **rejected** |
| Experimental screen-space outlines | passed first draw | Technical alternative, not accepted effect or comparison benchmark |

The smoke script uses Chrome headless with SwiftShader flags and checks first-draw status and framebuffer screenshot PNG integrity. It does **not** prove hardware RTX rendering, shader comparison performance, visual beauty, interaction completeness, or animation correctness. It does not confer gallery approval.

[Validation run 40341885061](https://github.com/sguzman/sceneology/actions/runs/40341885061) passed the ontology, technical record schema, source path, provenance and approval-boundary checks after both outline entries were given public source and dependency declarations.

[Pages deployment and live verification run 40342524477](https://github.com/sguzman/sceneology/actions/runs/40342524477) completed successfully. The post-deployment test fetched six public resources and verified they matched the checked-out repository byte-for-byte. Chrome completed the gallery's empty-state rendering at desktop (1280×900) and mobile (390×844) window sizes and captured PNG evidence. **Keyboard focus navigation, mobile visual quality and broader accessibility still require dedicated tests; screenshots existing is not a human visual evaluation.**

## Excluded from gallery

All three experiments are recorded in `catalog/library.json` with technical statuses and references. The gallery is controlled solely by `catalog/showcase.json`, and its approved IDs remain empty. A failed study remains a valuable technical record without becoming a featured artwork.

## Publication provenance and limits

The first-draw tests do not establish that every viewer control or input works. HTML viewers were sourced from already-public implementations with documented original blob identifiers and narrowly modified on-screen archival labels. Their source code contains self-contained shader/geometry payloads, and release review found no referenced external media/CDNs or copied nonpublic discussion. Automated screening is a supplement to manual source review.

**Next release evidence:** exercise keyboard navigation and reader-facing links, inspect responsive output rather than relying only on PNG existence, and maintain source-to-deployment parity after subsequent content changes. The user alone chooses future gallery exhibits.

## Curated gallery browser integration

[Gallery integration and Pages run 40343658219](https://github.com/sguzman/sceneology/actions/runs/40343658219) passed a real Chrome integration test using **synthetic, ephemeral approval records served only inside the test**. It confirmed two selected works render, a missing image falls back without substituting fictional artwork, technical status and public-safe source metadata are displayed, an empty allowlist remains empty, and a failed technical record is rejected when maliciously placed into an approval list. Real `catalog/showcase.json` stays unchanged.

## Reconstructed 2D vector-motion study

[2D Chrome run 40345170051](https://github.com/sguzman/sceneology/actions/runs/40345170051) passed with the screened standalone SVG study and locally authored timeline sampler. The test checks actual DOM scene/clone construction, sampled articulation changes, a blink keyframe, a stage bounding box within the mobile viewport, and a captured PNG. This establishes a technically functioning animated vector specimen, **not successful natural movement, pixel parity with an earlier engine, or gallery approval**. The source remains a documented visual-quality failure.

