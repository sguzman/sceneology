# 🖼️ Sceneology — owner curation review

This page presents **real, playable technical candidates for your visual judgment**. It is *not* the public exhibition. Nothing on this page selects an item for the homepage gallery. The authoritative allowlist is still [showcase.json](../catalog/showcase.json), which has no approved IDs.

## Technically available, not aesthetically endorsed

| Candidate | Current result | Live interactive viewer |
| --- | --- | --- |
| Day/night lighting | Archived historical 3D geometry, software-WebGL smoke passed | [Open day/night study](https://sguzman.github.io/sceneology/experiments/backyard-daynight-legacy-webgl2.html) |
| Screen-space outlines | Experimental depth/normal approach, software-WebGL smoke passed | [Open outline study](https://sguzman.github.io/sceneology/experiments/backyard-outline-screen-space-v2.html) |
| Rain and wind | Interactive scene effects, software-WebGL smoke passed | [Open rain/wind study](https://sguzman.github.io/sceneology/experiments/backyard-rain-wind-archival.html) |
| Snow | Interactive precipitation study, software-WebGL smoke passed | [Open snow study](https://sguzman.github.io/sceneology/experiments/backyard-snow-archival.html) |

**Not nominated:** the inverted-hull outline variant and the editable SVG character-motion study. Both retain their historical failed visual-quality outcome in the technical repository and must **not** be placed in the curated exhibition merely because a browser smoke test passed.

## Actual browser screenshot contact sheet

The [owner-review workflow run](https://github.com/sguzman/sceneology/actions/runs/40351750015) produced a GitHub Actions artifact named **sceneology-owner-review-contact-sheet**, with four real browser PNG captures, a responsive `index.html` comparison sheet, and a machine-readable review manifest. Download and open the artifact to compare the current results visually; it is a review bundle and **is not published in the Sceneology gallery**.

The screenshots were rendered in automated Chrome software WebGL and verified by first-draw status. They do not replace using the interactive viewers or provide human approval. The gallery remains empty until an explicit owner selection, a genuine thumbnail, and a final approved card are established.

## Selection procedure

1. The owner inspects any real viewer and explicitly identifies a particular artifact ID for the exhibition. No approval can be inferred from a technical test, an older project's acceptance, or appearance on this review list.
2. The selected artifact needs a genuine output-derived thumbnail, a confirmed live viewer, known rights, and explicit context identifying historical geometry or experimental limitations.
3. The owner reviews the resulting representation and approves the exact card before its ID is appended to `catalog/showcase.json`.
4. Only that allowlisted work appears on the homepage. A declined piece remains in the technical repository, with no public gallery card.

**Current decisions:** zero approvals, zero cards. This is a valid outcome until the owner chooses. Viewer availability and gallery allowlist behavior are automated test gates, not substitutes for visual judgment.

## Current verification

The six real HTML viewer files and the 2D runtime are checked for byte-exact HTTPS deployment in the Pages workflow. Four nonfailed candidates are linked above. Real WebGL2 browser screenshot smoke and test logs are recorded in [release evidence](RELEASE-EVIDENCE.md).

There is deliberately no fictional placeholder artwork and no automatic thumbnail copied into the gallery. A genuine curated thumbnail is only necessary for an explicitly approved exhibit; the gallery remains empty until then.
