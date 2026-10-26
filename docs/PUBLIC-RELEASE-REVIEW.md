# 🛡️ Public-release screening record

**Checkpoint:** October 26, 2026. This public document contains only process evidence and aggregate findings. Full source candidate inventories and rejected private review records remain in a separate nonpublic workspace.

## Current public surface

At the initial whole-repository screening checkpoint, **68 tracked text files** were scanned. Additional source, manifest and review files have since been committed; the whole-tree safety check runs against the updated checkout on every validation and Pages deployment. The release validation [run 40348573119](https://github.com/sguzman/sceneology/actions/runs/40348573119) passed a whole-repository text scan, including hidden GitHub workflows, scripts, catalog, ontology, scene source, experiments, public docs, and root project files.

The checks reject common credential shapes, explicit local user directories and private network host patterns. The scanner is not exhaustive: it cannot detect every private utterance, licensed asset, image metadata, or semantic risk. Human file review remains mandatory for every newly selected source transfer.

## Actual admission review performed

Six archived technical artifacts have public catalog records. Five were selectively copied from previously published, self-contained WebGL2 experiments with pinned Git source blobs and narrowly documented display-label edits. The sixth, an editable 2D SVG motion study, was individually reconstructed from owner-authored source, with a third-party animation-CDN dependency replaced by a small original local runtime and private source commentary excluded.

The six public catalog records each include explicit source/rights declarations and dependency-closure assertions. No private source Git history was imported. Technical outcomes are recorded without treating unsuccessful artistic results as successful exhibits.

## Outgoing release boundary

On `main`, the release pipeline:

1. Parses and validates every public catalog record against the versioned schema, including public provenance, rights basis and self-contained dependency declarations.
2. Checks ontology fixtures and cross-reference/timeline validity, including negative and synthetic migration cases.
3. Rejects failed technical experiments being selected for the curated showcase.
4. Scans all repository text files for high-confidence publication hazards.
5. Deploys a static site from the checked revision, then verifies exact bytes of key public resources, gallery behavior in desktop/mobile Chrome, keyboard skip navigation and viewport overflow.
6. Tests sampled archived 2D and WebGL2 renderers separately. Results are technical smoke evidence, never artistic approval.

The reviewer must inspect the precise staged content and commit message before each public push; post-push CI catches regressions but cannot undo exposure. Unknown rights or confidentiality leads to a hold outside Sceneology, not automatic publication. The currently empty showcase allowlist is intentional.

## What this closes - and what it does not

This record supports roadmap **P03** for the current public release and its outgoing validation surface. It **does not** close **P01/P02** for all future candidate material, certify historical author provenance without caveat, or prove that unpublished assets are safe or redistributable. The source-census and version-variant review deliberately leave unresolved candidates outside this repository.

No production build or browser test may imply owner approval of visual beauty. Future gallery admission requires a separate specific selection.

## Machine-checked dependency and rights declarations

The [public source/provenance manifest](PROVENANCE-MANIFEST.json) enumerates all six admitted technical catalog entries, exact released Git blob hashes, embedded asset classifications, review-scoped rights assertions, and every declared local runtime file. The [provenance checker](../scripts/check-provenance.mjs) recomputes Git blob digests, requires a manifest entry for every technical record, rejects missing or altered local dependencies, rejects unexplained linked scripts/media, and rejects undeclared network-loaded resources. [GitHub Actions validation run 40349243751](https://github.com/sguzman/sceneology/actions/runs/40349243751) passed those release checks.

This closes the transitive dependency and attribution review **for the currently admitted six artifacts** under roadmap P02. The rights basis is the owner's authorship and control of the original work; the public source links support provenance but do not constitute an independent court-tested copyright determination. The unreviewed private corpus remains on hold. Any later inclusion adds new dependencies and requires a new rights/content audit.
