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


## Live keyboard, mobile layout and gallery link checks

[Live Pages run 40345913473](https://github.com/sguzman/sceneology/actions/runs/40345913473) passed the real Chrome DevTools protocol test after the published site was fetched from its HTTPS URL. The first Tab focused the `Skip to main content` link, Enter moved focus to `main-content`, and the 390-pixel mobile viewport had exactly 390 pixels of document scroll width (no horizontal overflow). A live mobile framebuffer was captured. Desktop and mobile smoke, six exact-content deployed resources, synthetic-gallery image success/fallback, curated empty-state behavior, and published source paths were independently exercised in prior passing workflows.

These checks **do not** measure real-user web performance or prove subjective layout quality, screen-reader effectiveness, or actual future exhibit-image availability. Every newly approved gallery image and viewer still needs release-specific testing before exhibition.

## Archival weather effects migration

[WebGL browser run 40348013218](https://github.com/sguzman/sceneology/actions/runs/40348013218) passed automated headless Chrome/SwiftShader smoke checks for five archived renderers, including the two newly screened rain/wind and snow experiments. The weather viewers exposed an initialized 181-part archival scene with 2,172 reported mesh triangles each and no runtime error at the sampled point; the browser captured valid PNG screenshots. The original source files were already public and all scene content was reviewed for external runtime dependencies before migration; only contextual acceptance wording was changed. Each technical catalog entry records origin, source blob, rights basis and independent status.

These results do **not** prove correctness of every precipitation slider or preset, artist approval, physical GPU performance, current corrected geometry or benchmark parity. The new effects remain excluded from the gallery. See [weather-study provenance](../experiments/WEATHER-STUDIES.md).

## Selected environment, model and character exhibition (October 26, 2026)

The [validated public deployment at commit 590582f](https://github.com/sguzman/sceneology/actions/runs/40372004225) passed deployed-page byte checks, keyboard/mobile CDP, selected-card/thumbnail loading and category filters, as well as independent model-source index browsing. The release contains **21 selected works**: 7 accepted environments with source-derived SVG previews, 13 previously liked mechanical and PC models with real headless Chrome software-rendered PNG previews, and a source-derived static illustration of accepted Quest Girl v7. The character's 44-part static geometry is published separately; its earlier motion-v0.2 *functional* acceptance does not claim aesthetic acceptance of animation.

The currently admitted technical catalog includes four further exact-source environment composition manifests, not in the public showcase: their named SC3D asset dependencies require separate reconstruction and visual QA. Software-rendered previews and historical selected-work provenance cannot establish pixel identity with every original source engine, physical hardware performance, or blanket owner approval of other versions. The grandfather clock's browser output remained black, so it was not admitted as a gallery exhibit.
