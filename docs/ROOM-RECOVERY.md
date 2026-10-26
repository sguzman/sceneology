# Room composition source-dependency recovery

This is an active reconstruction investigation, **not** a gallery exhibit or a completed rendering.

Four historically accepted semantic room compositions are in `scenes/composition-sources/`: cozy bedroom, study corner, sleep room and reading corner. Their author-selected object roles and instance transforms are preserved, but their `accepted:block-chibi-room::...` asset references are **semantic aliases**, not paths to bundled render-ready media.

## Concrete source census (October 26, 2026)

A revision-pinned comparison against the existing public Renderarium constructive-model tree found:

| Current alias state | Distinct aliases | Next requirement |
| --- | ---: | --- |
| One possible file | 7 | Verify that exact revision matches the originally accepted asset and supports the intended composition |
| Multiple possible files | 16 | Resolve the exact accepted model *and* variation; don't arbitrarily use the latest or most attractive name |
| No matching requested version | 1 | Recover or independently reconstruct the requested bed-cover blanket v1.3 without substituting the available v1 |
| **Total** | **24** | **37 instance placements across 4 scenes** |

Every candidate currently exposes a public source path and original Git blob SHA in [the machine-readable alias census](../catalog/room-alias-candidates.json). All entries remain **unbound and unapproved for new migration**, including those with only one candidate. The file records publication-safe source facts, not private artistic feedback.

The missing blanket version is significant: the original composition explicitly requests the later cover correction, and showing an earlier cover as if accepted would repeat the mistakes this project is intended to avoid.

## Rendering gate

A faithful reconstruction must preserve scene-layout transforms, furniture geometry, parented decorations, materials, and room-shell relationships. The initial source files are semantic descriptions; their `status: accepted` value establishes earlier composition acceptance, **not automatic approval of any newly written renderer or new asset substitutions**.

Only after each selected asset file and its transitive implementation needs pass privacy, redistribution and visual compatibility review can a scene be rendered, compared, and proposed for the public gallery. Until then these four compositions remain research/source archives with no invented screenshots.

This report is tied to exact scene bytes and a public asset-tree revision. If either changes, re-run `scripts/check-room-aliases.mjs` and re-triage before a migration.

## Source-pinned spatial diagnostics (not reconstructed scene renderings)

The [four-room technical review](https://sguzman.github.io/sceneology/site/room-recovery.html) draws only original source zones, explicitly authored object anchors and parent-relation labels. The builder validates source Git blobs first. Where the source omits room dimensions, diagram boundaries are fitted to zones and anchors; **that frame is not a fabricated room wall**.

The diagnostics aid exact placement recovery but do **not** establish object geometry, model dimensions, render fidelity, visual approval, or completed room migration. All 24 aliases remain unbound, including those with only one current source candidate. The generated diagrams are checked in CI and tested after live deployment.

## Exact-source staging coverage

The model-family recovery catalog now stages at least one verified, unchanged candidate for **22 of 24** room asset aliases. This is an *inventory coverage* measure, not a reconstruction or an approved asset binding: aliases can still have multiple plausible model variants, no selected binding, unresolved orientation, and unverified visual compatibility.

The two source-staging gaps are both blanket aliases: the existing bed-cover v1 candidate has not been admitted as an accepted visual family, and the explicitly requested bed-cover v1.3 still has no matching public source version. All **24/24 asset aliases remain unbound**. A machine check now computes staged coverage from exact source blob identities and rejects accidentally misattributed candidate paths.

## Accepted blanket v1.3 recovery contract

The accepted Sleep Room source specifically requests bed-cover v1.3, **preserving the lighter top fold** and **forbidding the confusing extra dark foot piece**. Its original accepted layout also requires a coherent blanket-on-bed arrangement rather than a clipping or unsupported drape. Those are evidence-backed acceptance constraints, **not an exact original geometry file**.

A public, previously authored bed-cover v1 file is known, but that is an earlier specimen, not the accepted v1.3 output. It must not be used as a stand-in or silently renamed. The machine-readable [reconstruction target](../catalog/room-blanket-target.json) and [gate](../scripts/check-room-blanket-target.mjs) preserve the precise distinction; new geometry is unapproved until the original can be recovered or a separately evaluated proposal is accepted. Source coverage remains 22/24 aliases; none are bound.

## Unapproved blanket v1 source archived separately

The original publicly authored **bed-cover blanket v1** is now copied byte-for-byte into `models/source-archives/block-chibi-bed-cover-blanket-v1.sc3d.yml` with its original Git blob identity and explicit metadata in `catalog/room-technical-source-staging.json`. Its source evaluation remains *awaiting family review*: it is **not** the later accepted blanket v1.3, and cannot be bound into a finished room or promoted into the showcase. This is technical preservation of an earlier reference only.

With this separate archival specimen, **23 of 24 aliases now have at least one exact-byte staged source candidate**, but only **22** have an accepted-family candidate. The remaining alias specifically requests **bed-cover v1.3**; neither Renderarium nor the current Scenarium source tree exposes an exact matching file. All **24 aliases remain unbound**, and the four rooms are still source-only.

## Bed-cover reconstruction proposal — visual review only

The missing accepted v1.3 has a separate [two-source visual comparison](https://sguzman.github.io/sceneology/site/blanket-review.html) and machine manifest at `catalog/blanket-reconstruction-review.json`. The new file `models/proposals/sceneology-bed-cover-proposal-001.sc3d.yml` changes the earlier v1's confusing dark foot-drop material to the main rose while retaining the lighter top fold. **This is a newly authored proposal, not recovered v1.3 geometry or an accepted variant.** The comparison cannot prove bed contact, visual equivalence or original approval; neither item enters `catalog/showcase.json`.

## Partial Reading Corner 3D assembly — research only

The [partial Reading Corner viewer](https://sguzman.github.io/sceneology/site/reading-corner-study.html) reconstructs the **six** object instances that have original explicit world coordinates. Its geometry uses six exact, source-pinned publicly available representative variants also named by a later **unapproved occupancy experiment**. It deliberately omits the lumbar pillow and shelf books because their parent-relative placement lacks a faithful realization. Walls, floor shell, source lighting, object contacts, original renderer parity and source-approved binding identity also remain unresolved. This is not an accepted room viewer or a gallery entry. CI validates the six source transforms and the two missing attachments; Chrome independently tests multiple cameras after deployment.

## Additional room coordinate studies (unapproved proxies)

[Cozy Bedroom, Study Corner and Sleep Room research viewer](https://sguzman.github.io/sceneology/site/room-proxy-review.html) now projects **18 additional explicitly authored 3D placements** using source-pinned model-family proxy choices. The controls expose all SHA-matched, staged, source-derived variants for each alias, with an alphabetical default chosen *solely for initial inspection*. No variant is certified as the original accepted-room binding. The 11 dependent items without source world transforms (including the corrected accepted blanket v1.3) remain withheld. All original 29 instance declarations and three room-source Git hashes are tested against the generated manifest. Alongside Reading Corner's six, the independent research viewers now expose **24 of 37 authored world positions**, not completed rooms. Original room shells, lights, contact/collision checks, parented object positions, and aesthetic approval are unresolved.

## Parent-relationship recovery without invented placements

For the three technical room studies, every omitted parent-relative object now retains an explicit, source-checked link to an actually positioned furniture parent (for example, `on_desk → desk`). This adds **11 verified semantic attachment edges** without manufacturing coordinates, model collision solutions, pillow orientation, book distribution, lamp-light parenting, or blanket v1.3 geometry. The review UI lists each withheld attachment. Reading Corner independently retains its two parent-relative items, bringing the four-room total to **13 known but still unpositioned attachment relationships**.

## Conservative per-instance geometry screening (research only)

The research viewers now compute transformed axis-aligned bounds from actual source-derived part vertices for each currently selected representative model. The machine-readable, reproducibly generated [four-room bounds report](https://sguzman.github.io/sceneology/site/room-clearance-audit.json) covers **24 explicitly positioned proxy instances**, while all **13 original parent-linked attachments** remain withheld from 3D placement. Original scene coordinates and model blob identities are checked before the report is constructed.

Possible overlaps are a **broad-phase warning**: intersecting world-space boxes and even overlapping individual part bounding boxes do *not* prove that two polygonal objects truly intersect. Conversely, clean proxy boxes do not establish clearance for alternative historical assets, rooms with walls, parented decorations, exact floor contact, light sources, or the actual accepted renderer. The report records source-placement Y extents relative to `y=0`, not a verified floor-contact result. No objects are adjusted automatically, and none of this evidence changes `catalog/showcase.json` or certifies original model bindings.

Both the three-room variant viewer and the Reading Corner viewer display these candidate warnings alongside their unfinished-room disclaimers. The QA includes explicit synthetic separated, touching, overlapping and rotated-box cases and verifies the published report's exact bytes after deployment.

## Reading Corner character occupancy candidate (explicitly unapproved)

The previously public [Reading Corner occupancy source](../scenes/composition-sources/reading-corner-occupancy-candidate.scene.yml) is reproduced with exactly the original Git blob `c0a7fa68e804eddba895d5875ac9c735343de9d9`. It was and remains a **human-review-candidate**, not an approved completed scene. It specified a static Quest Girl v7 placement of `[0.25, 0.0, -1.02]` at `-8°`; the independent [Reading Corner research viewer](https://sguzman.github.io/sceneology/site/reading-corner-study.html?occupancy=1) can now display this source-authored character position as an optional overlay.

The overlay reconstructs the already accepted **static** 44-part character hierarchy without altering any original accepted component. Wedge primitives follow the existing public static preview's documented cuboid approximation. The proof preserves the authored stage and records proxy character/rug vertical extents, but the numeric difference is **not a foot-contact verdict**. Actual support relation, room-shell collisions, natural scale and aesthetic acceptance still require exact-source renderer comparison and review. The character is not included in the 37 historical furniture/decor placements (it belongs to a separate, later occupancy proof), and no new gallery approval is asserted.

## Evidence-driven proxy variant alternatives

The default three-room proxy geometry screen found **two possible box-overlap pairs**: Desk/Bookshelf in Cozy Bedroom and Bookshelf/Plant in Study Corner. Both involve the alphabetically selected research models, not certified original artwork. A new source-pinned [single-change alternative report](https://sguzman.github.io/sceneology/site/room-variant-reduction.json) evaluates every staged candidate in isolation and identifies **five** alternatives with fewer broad-phase warnings: replacing the wide low bookshelf with a narrow or tall bookcase in either room, and using the small snake plant in Study Corner. The [interactive room comparison](https://sguzman.github.io/sceneology/site/room-proxy-review.html) links directly to those specific research configurations.

These comparisons narrow technical debugging, not provenance. **No alternative is promoted to the accepted room or the showcase**, and even a zero-overlap result cannot prove exact mesh contact, all physical clearances or that the selected specimen was the original accepted asset.

## Quest Girl / rug shoe-support alignment (research option, not original)

Source-derived foot corners of the two approved static Quest Girl v7 shoes sit at **y = −0.945** under the authored occupancy transform, while the rug's *central field* top is at **y = +0.045**. Both shoe sole quadrilaterals are contained within that field footprint at the authored X/Z placement and −8° yaw. This yields a **+0.990 source-unit vertical offset** required for an idealized shoe-bottom-to-field-top alignment in the current technical proxy renderer. The raised pose is available by opting into [show occupant and test alignment](https://sguzman.github.io/sceneology/site/reading-corner-study.html?occupancy=1&support=1).

This does **not** modify the exact original authored character translation `[0.25,0,-1.02]`, assert an original-renderer bug, reproduce the original support solver, or prove contact with the actual geometry. Rugs can have distinct center-field versus border heights, and true contact, ground interaction, original shell clearance and artistic quality remain unchecked. The [machine support evidence](https://sguzman.github.io/sceneology/site/reading-corner-occupancy-data.json) contains the foot corners, source field top and numerical research offset; automated tests prevent false approval.

### Alignment broad-phase limitations

The two modeled poses yield different *source-part* bounding-box warnings: the original authored character pose has **seven** candidate shoe/body-or-rug part-box pairs, while the vertical alignment proposal has **zero**. Both still have one possible *whole-object* AABB overlap, because the rug border is 0.008 source units taller than the central field. The corrected foot corners lie over the **central field**, not the border. These are non-physical proxies, so the numbers do **not** establish exact mesh collision, successful original support resolution or artistic approval. They simply narrow the original static occupancy's contact discrepancy.

## Source-constrained lumbar pillow seat/backrest proposal

The [Reading Corner viewer](https://sguzman.github.io/sceneology/site/reading-corner-study.html?pillow=1) can now optionally place the *exact public source* lumbar-pillow geometry using a derived parent-local transform on the representative wide-cute-chair. The proposal rotates the originally flat pillow by −90° about local X so its decorative panel faces outward, places the body bottom at the chair's cushion top **y=0.66**, and puts its unadorned back surface against the backrest's front **z=0.16**. These positions derive from the public constructive chair and pillow face vertices, not arbitrary hand-placed coordinates.

**Unresolved fit issue:** the source pillow width is 1.10 units and the selected chair cushion width is 0.70, leaving **0.20 units of lateral overhang on each side**. The proposal intentionally does not rescale, change source primitives, or claim the body has sufficient original seat support; this compatibility issue requires visual review or source discovery. The accepted room only specifies `on_chair`, upright, accent outward, seat support, backrest contact and no penetration; it does not specify this derived exact transform. The additional model is a seventh *experimental* representation, not a newly recovered authored position. Historical explicitly placed instances remain 24/37, and the accepted showcase remains unchanged.

## Shelf-books dependency: existing book geometry versus separate instance

Each of the four historically accepted room descriptions still declares an `on_bookshelf` **shelf-books** relation without a standalone transform. Crucially, the three publicly staged, source-pinned corrected bookshelf family variants already contain **embedded book shapes** (three books in the low-wide or narrow variant; four in the tall variant). Simply adding an independent shelf-book model at guessed coordinates could duplicate books or intersect the built-in geometry.

The [machine-generated embedded-content audit](https://sguzman.github.io/sceneology/site/room-shelf-content-audit.json) cross-checks all four exact original room blobs, all three candidate bookshelf blobs and the rendered part IDs. It identifies potential duplicate content, not an exact historical binding or proof that an embedded model fulfills the original external `shelf-books` semantics. All four original relations therefore remain unresolved until original attachment interpretation or a separately reviewed replacement is available.

## Source zones inside research 3D views (not a wall or floor)

Both room research viewers now offer source-authored 2D X/Z planning-zone guides directly over the furniture proxies. Four rooms declare 17 total zone rectangles: five Cozy Bedroom zones and four each for Study Corner, Sleep Room and Reading Corner. Only Cozy Bedroom explicitly declares a 6 × 5 original architectural footprint, so the visual guide shows that outline there and *no inferred walls or footprint* for the other three rooms.

The optional [three-room zones](https://sguzman.github.io/sceneology/site/room-proxy-review.html?zones=1) and [Reading Corner zones](https://sguzman.github.io/sceneology/site/reading-corner-study.html?zones=1) are planning diagnostics, not physical walkable-floor geometry, collision clearance, exact renderer fidelity, or gallery approval.

## Conservative reserved-area X/Z overlap screening

The [source zone plan-view audit](https://sguzman.github.io/sceneology/site/room-zone-footprint-audit.json) compares the transformed axis-aligned X/Z bounding rectangles of **24 placed research proxy models** against the **five source-authored character-stage, bedside-stage, and circulation zones** across four accepted room specifications. The intentional area rug and wall-mounted windows are excluded from *potential obstructing furniture mass* counts, not silently repositioned. An intersection is classified as a broad-phase candidate only; it does not establish an actual visual clutter, walkable-space obstruction, original-renderer penetration, or failed human-reviewed room. The default variants are unapproved and can differ from the originals.

The audited zones and the only explicit Cozy Bedroom footprint are also independently available as optional guides in the two 3D research viewers. No missing walls or parent attachment positions were manufactured.

## Provenance-gated reserved-space source variant sensitivity

The [source-variant sensitivity report](https://sguzman.github.io/sceneology/site/room-zone-variant-sensitivity.json) now enumerates staged exact-source alternative models that change the **five source-authored standing, bedside and circulation-zone** broad-phase findings. With alphabetical default representative families, only the Cozy Bedroom desk's transformed bounding box crosses a circulation-zone rectangle: **0.09 × 0.31 = 0.0279 square source units**, or 0.62% of the rectangle. This does **not** prove the historically accepted circulation was blocked.

Seven isolated changes to candidate source model identity alter the overlap estimate, and none improves it: two desk variants encroach farther; two alternative beds and one larger chair add another zone candidate in Cozy Bedroom; two beds add possible overlaps in Sleep Room. Study Corner and Reading Corner retain zero such default broad-phase candidates. The accepted original arrangement is not modified, alternate model identity is never auto-certified, and the audit does not substitute a collision/motion solver or an aesthetic verdict.

## Original bedding duplication and lumbar chair-width compatibility

The [source attachment-fit audit](https://sguzman.github.io/sceneology/site/room-attachment-fit-audit.json) checks **the original byte-exact staged family models**, not a newly chosen room binding. Both historically accepted Cozy Bedroom and Sleep Room compositions declare *external* `on_bed` pillow and blanket instances; separately, **every one of the three staged bed candidates already has built-in `pillow` and `blanket` mesh parts**. Blindly adding both external attachments over any of those staged models could create duplicated bedding and false geometry. We do not yet know whether the historical renderer suppressed embedded bedding. The missing accepted bed-cover v1.3 source remains missing.

The external accepted-family bed pillow is **0.98 source units wide**. The three staged mattress widths are 0.90, 1.12 and 1.38, so an unscaled centered external pillow would overhang the compact mattress by 0.04 each side but fit within the other two widths. This does not identify the actual historical variant, head position, support or visible attachment count.

The accepted-family lumbar pillow is **1.10 source units wide**. The three staged chair seat or cushion support surfaces are only **0.52, 0.60 and 0.70**, producing centered lateral overhangs of **0.29, 0.25 and 0.20 per side**. **None of these source chairs fully supports the unscaled lumbar pillow width.** This explains why the wide-cute-chair test looks oversized, but does not disprove the historically accepted Reading Corner: the original renderer may have used a distinct approved source binding, a separate placement/scale transform, or different attachment logic that has not been recovered. Do not rescale original files or select a visually convenient substitute silently.

The machine audit records every original staged model blob SHA and the four independent pillow/blanket relations from the two original accepted scenes, while retaining all source binding, artist approval, room visualization and original-renderer uncertainty flags. This is a source-compatibility blocker inventory, **not recovered room assembly**.
