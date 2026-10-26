# 🔎 Source inventory coverage (nonpublic working census)

**Census checkpoint: 2026-10-26.** This public note records only aggregate progress. The full file-level ledgers, filenames, source references, authorship uncertainties and private review decisions remain outside this public repository.

## Scoped coverage

| Source category | Tracked file records | Review state |
| --- | ---: | --- |
| Canonical scene research and definitions | 435 | Inventoried, unreviewed for public release |
| Scene implementation and experiments | 1,014 | Inventoried, unreviewed for public release |
| Existing public renderer and tests | 260 | Inventoried, re-admission still unreviewed |
| Related visual, media, design and derivative research | 704 | Inventoried, selective review only |
| **Combined file records** | **2,413** | **None automatically admitted** |

The earlier three-way census and the new adjacent-scope census have been reconciled by source and path: **2,413 distinct records**, each tied to a Git blob identifier. The added subset is also pinned to source tree identifiers. These are **file records, not unique scenes**.

The already-public implementation cohort has **203 matching paths** in the primary implementation source: **194 matching blob identities, nine divergent identities**. Fifty-seven additional public paths lack a same-path source counterpart. A matching filename is not evidence of technical or semantic equivalence; a differing hash is not permission to prefer the newer-looking version.

Inventory entries identify source/cohort, revision or blob identity, size, and initial file class. Individual authorship, transitive dependencies, privacy safety, redistribution rights, and artistic outcomes remain unknown until investigated. **No content-level release audit, admission decision, migration, or artistic endorsement is implied.**

## Completed versus outstanding

**Completed:** bounded file-tree discovery, deduplicated source/path census, pinned revision identifiers, legacy/public overlap detection, private holding ledgers, and explicit unknown-state bookkeeping.

**Not completed:** reading each candidate's contents, rights evidence, exact dependency closure, authoritative variant reconciliation, screening verdicts, and selection for migration. These are separate roadmap tasks A02/A03 and P01-P03, not prerequisites for being honest about the inventory itself.

Publication rule: do not add private inventory entries, raw source paths, internal review notes, or unreviewed assets to Sceneology. Technical failures may qualify after safety and rights review, but are not automatic gallery features.

See the [admission decisions](ADMISSION-DECISIONS.md), [roadmap](ROADMAP.md), [source variant reconciliation](VARIANTS.md), and [migration gates](MIGRATION.md).
