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

[Pages deployment run 40341884999](https://github.com/sguzman/sceneology/actions/runs/40341884999) completed successfully. **External HTTP reachability, live catalog fetch, responsive appearance and keyboard behavior have not been independently tested here yet.** Deployment workflow success alone does not close the full website QA gate.

## Excluded from gallery

All three experiments are recorded in `catalog/library.json` with technical statuses and references. The gallery is controlled solely by `catalog/showcase.json`, and its approved IDs remain empty. A failed study remains a valuable technical record without becoming a featured artwork.

## Publication provenance and limits

The first-draw tests do not establish that every viewer control or input works. HTML viewers were sourced from already-public implementations with documented original blob identifiers and narrowly modified on-screen archival labels. Their source code contains self-contained shader/geometry payloads, and release review found no referenced external media/CDNs or copied nonpublic discussion. Automated screening is a supplement to manual source review.

**Next release evidence:** verify the live Pages URL, asset fetches, curated empty state, keyboard reachability and mobile viewport. The user alone chooses future gallery exhibits.
