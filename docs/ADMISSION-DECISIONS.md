# 🔎 Bounded migration admission decisions

**Checkpoint: October 26, 2026.** The complete file-level decision register is private. This is an aggregate publication-safe report. No unpublished source path, private review text or hold-only media is included here.

## Exhaustive decisions for pinned intake snapshot

| Decision | File records | Public-release consequence |
| --- | ---: | --- |
| Admitted, fully scored after all hard gates | 6 | Already migrated and independently verified technical artifacts |
| Held with unresolved content, rights, media or dependency gates | 1,851 | Must not be published; scoring deliberately deferred |
| Declined for this release scope | 556 | Out of domain or explicitly retained in private origin |
| **Total** | **2,413** | All census records assigned a disposition |

Records were grouped into **630 source families** for domain and variant triage. Every file in the pinned census has a recorded decision, source identity and reason. That does **not** mean every held file was content-inspected or judged safe. A hold is a deliberate refusal to infer release clearance from a filename or repository description.

## Evaluation after hard gates

The migration policy scores five independent criteria from 0 to 3 **only after** relevance, privacy, rights, transitive dependencies and technical evidence have all passed. Unknown gate results receive a recorded hold and a null score; fabricating a numerical score for them would contradict the admission contract.

The six admitted candidates' reproducible research scores are:

| Technical artifact | Research value / 15 | Technical disposition |
| --- | ---: | --- |
| Historical day/night renderer | 13 | Admitted, archived |
| Inverted-hull outlines | 14 | Admitted, failed visual approach |
| Screen-space outline alternative | 14 | Admitted, experimental |
| Rain and wind effect | 12 | Admitted, experimental |
| Snow effect | 12 | Admitted, experimental |
| Editable 2D vector-motion study | 14 | Admitted, failed visual approach |

**These are not aesthetic ratings.** High scores reward technical relevance, reusable negative knowledge, reproducibility, nonredundancy and maintainability. They do not imply beauty or permission to feature a work.

## Scope boundary and drift control

The completed source decision pass is frozen to recorded blob/tree revisions. New commits, changed assets, new source families and changed permissions are not grandfathered in. The private ledger preserves decisions and review uncertainties for each source family. Two especially important hold categories are backend-served scene assets and original visual studies with unresolved embedded-media or third-party-runtime provenance.

The independent public repository currently contains exactly six admitted technical artifacts, each with pinned released bytes and source-provenance evidence. The editorial gallery approval register remains empty. A future source migration always requires an individual recheck of rights, privacy, executable dependencies and technical truth.

This closes the roadmap's **A03 bounded admission-decision gate**, not the separate owner-only gallery approval gate. See [source census](SOURCE-CENSUS.md), [version reconciliation](VARIANTS.md), [privacy audit](CONTENT-AUDIT.md), and [machine-readable progress](roadmap.json).
