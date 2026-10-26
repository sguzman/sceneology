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
