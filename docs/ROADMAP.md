# 🗺️ Sceneology migration and completion roadmap

**Scope:** a self-contained public scene-construction research repository with useful technical history, rigorous human- and machine-readable ontology, and an owner-curated website. This roadmap governs **admission and later migration**, not automatic publication of source material.

**Current status:** [the machine-readable ledger](roadmap.json), [technical catalog](../catalog/library.json), and [owner-curated showcase allowlist](../catalog/showcase.json) report live progress. Screened archival studies have been admitted since the initial scaffold, including preserved failures and an editable 2D motion scene. No such transfer implies exhibition approval. The public gallery remains owner-selected only.

## Success definition (bounded migration MVP)

The migration MVP is complete when the defined source cohorts are exhaustively inventoried and triaged; every selected artifact passes file-by-file privacy, rights, metadata, and dependency review; admitted ontology is documented in prose **and** formal schemas with matched examples; selected source-backed 2D/3D implementations, studies, and meaningful failures are reproducible in this repository; the public website is independently deployable and tested; and only owner-approved specimens appear in its gallery. **Completing this MVP does not require publishing all discovered material, obtaining gallery approval, or finishing every future artistic experiment.** Explicitly rejected and held candidates remain documented in the **nonpublic** decision ledger.

## Source families to census (none automatically admitted)

| Candidate family | What is worth examining | Initial triage | Key caveat |
| --- | --- | --- | --- |
| Existing public renderer/verifier | Seven previously reviewed environments, tested rendering paths, effects and benchmarks | **Priority 1: inspect** | Existing public status does not waive license, duplication, or closure checks |
| Private scene ontology | Typed object/scene semantics, spatial relations, states, constraints, realizations, rigging and sound | **Priority 1: inspect** | Publish newly reviewed, self-contained public definitions; no competing private-runtime dependency |
| Private scene implementations | 2D character studies, authored assets, rigs, animation experiments, constructed environments, and tools | **Priority 2: inspect** | Must screen every file, generated output, metadata, and dependency |
| Failed and inconclusive experiments | Negative results, diagnostic variants, scripts, technical evaluation and design lessons | **Priority 2: inspect** | Artistic failure is not a reason to exclude research; personal narration is |
| Adjacent visual-presentation and media research | Visual languages, presentation grammars, composition and animation design briefs | **Priority 3: inspect selectively** | Import only scene-relevant, independently useful concepts, not unrelated research corpora |
| Audio and miscellaneous tooling | Scene-linked sound synthesis, timing, effects, authoring utilities and tests | **Priority 3: inspect selectively** | Avoid a general media-platform or audio-application takeover |

These are **cohorts, not reviewed file inventories**. No file-level admission or published artifact is claimed. Preserve source authority while public terminology/representations are reconciled; do not blindly duplicate private knowledge.

## Roadmap and acceptance gates

All roadmap points and task states are authoritative in [roadmap.json](roadmap.json); the labels below explain the evidence standard. Each task earns its *entire* assigned weight only on acceptance, otherwise zero. No completion-by-intent or unreviewed percent estimates.

### 🧱 F — Public foundations (8/8 points)

- **F01 (4):** Independently public repository, privacy/publication constitution, rights rules. **Done** — `CONSTITUTION.md`, `docs/PUBLICATION.md`.
- **F02 (4):** Separate technical and curated catalogs, project structure, nonpublic-history prohibition. **Done** — `catalog/library.json`, `catalog/showcase.json`, `AGENTS.md`.

### 🗺️ R — Bounded roadmap and admission contract (5/5 points)

- **R01 (2):** Inspect existing public state and identify source cohorts, actual migration baseline, and blockers. **Done** — this roadmap and source review.
- **R02 (3):** Define deterministic admission decisions, privacy/rights workflow, release waves, measurable atomic tasks, and machine-readable progress. **Done** — [migration policy](MIGRATION.md), [roadmap.json](roadmap.json).

### 🔎 A — Source census and migration selection (17/17 points)

- **A01 (6):** Build **nonpublic** file-by-file inventories, with source revision, digest, content class, producer, size, dependencies and rights uncertainty; include older and failed variants. Do not publish those inventories. **Done — verified in [the progress ledger](roadmap.json).**
- **A02 (5):** Deduplicate overlapping public/private versions and identify canonical sources, accepted variants, obsolete experiments and missing assets, with accountable reasons. **Done — verified in [the progress ledger](roadmap.json).**
- **A03 (6):** Complete admission scoring and hold/reject records for every scoped file family, and select independently buildable migration cohorts. Record decisions in the nonpublic ledger. Recheck when sources change. **Done — verified in [the progress ledger](roadmap.json).**

### 🛡️ P — Privacy, licensing and provenance (17/17 points)

- **P01 (7):** Inspect **contents** of every candidate, including source, comments, prose, test fixtures, media metadata, hidden/build files, generated bundles and scene data. Remove private communication, venting, identifying material and credentials **before any public write**. **Done — verified in [the progress ledger](roadmap.json).**
- **P02 (6):** Audit each full transitive dependency and license/asset rights. Produce a public-safe attribution/provenance manifest; if permissions or self-containment are uncertain, hold the item. **Done — verified in [the progress ledger](roadmap.json).**
- **P03 (4):** Independently review each outgoing public commit and generated website bundle; run technical scans as supplements, not substitutes. Never import source Git histories or unreviewed commit messages. **Done — verified in [the progress ledger](roadmap.json).**

### 🧠 O — Human + machine ontology (18/18 points)

- **O01 (2):** Baseline human prose vocabulary and an initial catalog JSON Schema. **Done** — `ontology/SCENES.md`, `ontology/schemas/record-v1.schema.json`.
- **O02 (6):** Expand the public ontology for scenes, objects, roles, relations, constraints, appearance, 2D/3D coordinate models, camera, timelines, animation, effects, audio, input, realization, variants, and evaluation; maintain readable concept/relationship documentation. **Done — verified in [the progress ledger](roadmap.json).**
- **O03 (6):** Provide versioned, machine-readable entity/scene/experiment schemas, stable IDs, validation rules, and source-neutral cross-representation mappings. Every formal semantic distinction must match its human documentation. **Done — verified in [the progress ledger](roadmap.json).**
- **O04 (4):** Add independent example fixtures for 2D static, 2D animated, 3D, interactive, and failed/inconclusive studies; validate round-trips, references, ontology conformance and version migrations. **Done — verified in [the progress ledger](roadmap.json).**

### 🔧 M — Selected source-backed migrations (18/18 points)

- **M01 (5):** Safely port a verified slice of previously public environments/renderers with exact geometry/artifact identity or explained departures, plus an independent viewer and tests. **Done — verified in [the progress ledger](roadmap.json).**
- **M02 (5):** Port a screened 2D character/scene/animation cohort with source assets, editable representations, behavior and reproducible test evidence. Do not misclassify generated stills as animated rigs. **Done — verified in [the progress ledger](roadmap.json).**
- **M03 (4):** Preserve screened meaningful failures, variants, objective diagnostics and negative knowledge as explicitly non-showcase technical entries. **Done — verified in [the progress ledger](roadmap.json).**
- **M04 (4):** Admit other truly scene-relevant effects/audio/tools after separate rights, relevance, dependency and quality gates. No mandatory import merely to raise the percentage. **Done — verified in [the progress ledger](roadmap.json).**

### 🖼️ G — Curated website and human visual review (11/11 points)

- **G01 (2):** Static website and strict owner-only allowlist data path. **Done** — `index.html`, `site/main.js`, `catalog/showcase.json`.
- **G02 (4):** Build polished, responsive browsing and reliable artifact-specific viewers with fallback media, accessibility and clear provenance/technical status where appropriate. **Done — verified in [the progress ledger](roadmap.json).**
- **G03 (3):** Show source-backed owner-liked works with genuine thumbnails and tested public viewers; keep failed or unapproved variants out. **Done for the bounded release:** the public exhibition includes real source-backed environments, models and a character; live counts are provided in [CURRENT-COLLECTION.md](CURRENT-COLLECTION.md). Real Chrome validation checks the exact selected IDs, thumbnails, accessible navigation, mobile sizing and category filters. **More historical candidates remain unevaluated or unrendered; this is not the end of the wider portfolio migration.**
- **G04 (2):** Verify deployed Pages behavior, links, responsive/mobile/keyboard interaction, image loading, and performance. Do not substitute source presence for a deployed website. **Done — verified in [the progress ledger](roadmap.json).**

### 🧪 Q — Integrity and release evidence (6/6 points)

- **Q01 (1):** Basic catalog, path and showcase-integrity checks. **Done** — `scripts/validate.mjs`.
- **Q02 (3):** Expand CI to enforce machine schema conformance, references, provenance/rights fields, approval controls, static-output inspection and robust regressions. **Done — verified in [the progress ledger](roadmap.json).**
- **Q03 (2):** Test representative artifacts with independent browser/runtime QA, document renderer/GPU provenance honestly, and certify a deployed, public self-contained release. **Done — verified in [the progress ledger](roadmap.json).**

## Migration waves — do not run until clearance

1. **Wave 0 — private inventory only.** Reconcile all known source families, duplicated implementations and failure branches without public writes.
2. **Wave 1 — public-safe semantic core.** Review concepts one by one, author synchronized human documentation, formal schemas, fixtures and validators in Sceneology.
3. **Wave 2 — already-public runnable specimens.** Reconfirm licenses, input dependencies and compatibility; preserve proof and add gallery-independent catalog records.
4. **Wave 3 — private original implementations and failures.** Promote only cleansed, independently releasable files with new public commit history. Preserve failed technical work without automatic gallery eligibility.
5. **Wave 4 — selected cross-media capabilities.** Admit bounded effects, animation, audio and tools only when they directly serve Sceneology's ontology or scenes.
6. **Wave 5 — website and releases.** Improve discoverability, test browsers, collect owner approvals individually, and verify deployment and machine-readable metadata.

**Parallelism:** each cohort can advance through screening independently. Do not block unrelated clean work on an unresolved source. A migration task is not "done" until its accepted public artifact, evidence and validator checks exist.

## Reporting protocol

At the end of every work session: report **previous % → current % (Δ percentage points)**, a visual progress bar, concrete evidence (commit and changed files), actual technical catalog count, actual approved gallery count, and blockers. Explain zero delta honestly; never invent completion. Work directly on `main`, without default pull requests. Only human-authorized gallery selections go into `catalog/showcase.json`.

**Current bounded roadmap checkpoint (2026-10-26):** **100/100 accepted points, +3 from the previously blocked 97-point checkpoint.** The initially requested nonempty, owner-curated public exhibition is now working and independently deployed with a growing owner-selected set of environments, models/objects and accepted static Quest Girl v7. See [current collection](CURRENT-COLLECTION.md) for the audited current count. An additional four previously accepted room-composition YAML files have been screened and admitted as **source-only archives** pending transitive asset and viewer reconstruction. The broader accepted-source corpus remains under review; never interpret this percentage as all historical work migrated or gallery-approved. Verify counts with [catalog/library.json](../catalog/library.json) and [catalog/showcase.json](../catalog/showcase.json), and review CI evidence in [RELEASE-EVIDENCE.md](RELEASE-EVIDENCE.md).
