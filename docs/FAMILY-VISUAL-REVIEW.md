# Source-accepted beds, bookshelves and lamps — visual review

**Source status:** nine exact, revision-pinned publicly sourced constructive-3D models from previously owner-accepted families.  
**New renderer status:** screenshots generated and source checksum verified; **new SVG presentations have not been individually artistically approved**.  
**Gallery status:** no automatic promotion.

[Open the public comparison page](https://sguzman.github.io/sceneology/site/family-review.html) to view all nine and filter by category. This technical review page is **separate** from the curated Sceneology home exhibition. It does not publish any new `catalog/showcase.json` approvals.

| Source family | Individual models | What the new screenshots visibly establish |
| --- | --- | --- |
| Beds | Simple Study Bed, Wide Cute Bed, Compact Cozy Bed | Three distinguishable bed compositions with consistent source-derived wood, mattress and bedding geometry |
| Bookshelves | Low Wide Bookshelf, Narrow Bookcase, Tall Bookcase | Three differing shelves and bookcase proportions, with some visible shelving and colored book geometry |
| Lamps | Cozy Table Lamp, Tall Floor Lamp, Task Lamp | Two clearly legible shade-and-stand designs; the task-lamp reconstruction is less legible and needs **additional visual comparison** before exhibition |

The screenshots are real automated Chrome captures of SVGs generated from nine exact source files, not invented stand-in product photos or renders. The [source record](../catalog/accepted-family-sources.json) lists each file, source Git blob hash, original acceptance scope and currently unapproved new renderer state.

The [build script](../scripts/build-family-previews.mjs) checks original source hashes, parses supported constructive primitives and writes self-contained `site/family-previews/*.svg` outputs. The [browser QA](../scripts/test-family-previews.mjs) captured all nine as PNGs in GitHub Actions. The [live deployment check](../scripts/test-live-family-review.mjs) also requires all nine matching public SVGs and cards on GitHub Pages. None of these technical checks is a substitute for the owner's visual judgment.

## Separate decisions

1. **Source provenance:** accepted historical model-family source, frozen at known bytes.
2. **Representation:** a new isometric/orthographic source-derived SVG interpretation, not guaranteed equivalent to the original renderer.
3. **Curation:** pending owner judgment of the *new visible output*. Historically accepted geometry does not automatically approve a visibly different presentation.
4. **Exhibition:** only after a confirmed desired card, source-backed thumbnail and deployed viewer are verified; a negative judgment leaves the family in technical research.

Rejected or unreviewed studies are not imported into the curated gallery. The existing selected exhibition remains intact.
