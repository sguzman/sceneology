# Seven historically accepted model families — new visual review

**Source status:** 21 exact, revision-pinned, public constructive-3D model sources from seven historically owner-accepted families. Each original file is copied byte-for-byte from the pinned source tree and checked by its original Git blob SHA.

**New rendering status:** source-derived SVGs and Chrome screenshot captures are technical reconstructions, not proven equivalents of the original accepted viewer.

**Exhibition status:** all 21 remain **outside** the curated Sceneology gallery until their new appearances are independently judged and explicitly selected.

[Open the 21-model comparison page](https://sguzman.github.io/sceneology/site/family-review.html). Filter by category to compare source variants. This is a research review, not automatic artistic endorsement.

| Family | 3 accepted source members | Reconstructed-preview review questions |
| --- | --- | --- |
| Beds | Simple Study, Wide Cute, Compact Cozy | Mattress, supports, bedding proportions, and source-defined orientation |
| Bookshelves | Low Wide, Narrow, Tall | Shelf separation, book legibility, and shelf/body proportions |
| Lamps | Cozy Table, Tall Floor, Task | Silhouette, glow/emitter orientation, and source-defined parent transform |
| Chairs | Compact, Study, Wide Cute | Seat/back direction, four legs, and wide-chair cushion legibility |
| Desks | Compact Hutch, Simple Study, Wide Writing | Leg support, work-surface clearance, and hutch/drawer silhouette |
| Rugs | Runner, Small Bedside, Wide Area | Thinness, inset border or stripe, and floor contact (not physically simulated) |
| Windows | Square Four-Pane, Tall Two-Pane, Wide Three-Pane | Pane divisions, frame depth, glazing, and required wall context |

A renderer bug previously omitted the underside of box shapes; that face is now included so the rotated task-lamp light emitter can be represented. **This repairs the technical omission only:** the task-lamp composition still requires visual review. For flat rugs, a valid source-derived image can contain only a few visible polygons; a low polygon count alone is not a visual-quality verdict.

The [source manifest](../catalog/accepted-family-sources.json) records each source path, pinned blob, prior approval scope and **false** new-renderer approval state. The [generator](../scripts/build-family-previews.mjs) verifies every source blob and makes self-contained SVG files; the [screenshot workflow](../.github/workflows/family-review.yml) runs real Chrome for all 21. The [live browser check](../scripts/test-live-family-review.mjs) independently verifies page cards and deployed image byte equality.

## Non-negotiable boundaries

1. **Historical acceptance:** the older source family was liked; this does not automatically approve a new renderer.
2. **Representation:** isometric/orthographic constructive SVGs can differ from the original perspective material/shadow viewer, especially for thin rugs, glazing, and light emitters.
3. **Curation:** owner approval applies to a *specific current visible exhibit*, not merely a specimen name or file path.
4. **Publication:** these review assets are technical and public, but do not modify `catalog/showcase.json`. Rejected plant-morphology attempts, broken clocks and rejected character revisions are not smuggled into this accepted-family list.

The approved exhibition remains independent: [current collection](CURRENT-COLLECTION.md).
