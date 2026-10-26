# 🔎 Version reconciliation and migration holds

**Checkpoint: October 26, 2026.** This is a public-safe aggregate of private intake decisions; the file-level reconciliation and underlying source identifiers remain in a private workspace. It is **not** approval to release the underlying files.

## Snapshot and duplicate resolution

A revision-pinned comparison of the main implementation source and existing public renderer found:

| File classification | Count | Canonical handling |
| --- | ---: | --- |
| Identical public/private paths and Git blobs | 194 pairs | One public source reference; do not re-import copies |
| Same-path divergent files | 9 pairs | Keep independent versions and their distinct source authorities |
| Public-only files | 57 | Already-public reference candidates; not automatically repackaged |
| Nonpublic-only files | 811 | Hold outside Sceneology until individual admission gates |
| Naming-derived version families | 59 | Preserve historical alternatives; never select solely by version number |

The nine divergent paths were each assigned a private, recorded resolution. Public release-specific CI, package definitions, servers, browser tests and documentation retain the existing public source as the reference. Divergent private implementations are retained as independent historical inputs, not silently overwritten or rebranded. A small documentation difference and a large viewer/QA divergence are **not equivalent** cases merely because both have different hashes.

Existing source identities were kept stable; no source branch was rewritten, renamed or merged. Different historical versions, failed experiments and visual variants remain discoverable in private intake even when not admitted to Sceneology. A filename or archive order never confers aesthetic approval.

## Dependency closure: selected entrypoint inspection

An initial focused review of public and nonpublic scene entrypoints confirmed two important hold classes:

- Some preview interfaces depend on live asset-information endpoints or scene-list servers. A standalone HTML viewer without its companion service would **not** be a reproducible migration.
- Some older 2D character viewers reference external animation CDNs and embedded images. Those versions cannot be copied directly into a self-contained, source-cleared public release. The admitted vector-motion study replaced its old runtime and was tested independently; that one reconstruction does not clear related versions.

Other inspected experiments embed the shader and geometry data required for the historical first draw. These are candidates for further content and rights screening, not automatically certified.

**Unresolved assets:** dynamic resource closure, unknown licenses, embedded media origin and future historical branches stay marked as holds. The inventory identifies these missing *requirements* rather than inventing assets or claiming all references work. Admission always requires byte-level inspection and executable QA of the actual selected bundle.

## Progress boundary

This closes the *version-reconciliation* task A02: 203 overlapping same-path pairs have a defined public/private authority rule, public-only and nonpublic-only source paths are partitioned, and named version families retain explicit no-auto-promotion treatment. It does **not** close the larger admission-scoring task A03, the detailed privacy and rights audits P01/P02/P03, or ongoing source drift review.

See [private-first migration policy](MIGRATION.md), [source census](SOURCE-CENSUS.md), and [weighted roadmap](roadmap.json).
