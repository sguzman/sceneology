# Sceneology

Sceneology is an independent, public laboratory for the **construction, description, implementation, study and presentation of scenes**.

Its domain spans 2D, 3D and hybrid scenes: composition, objects, spatial relationships, constructive geometry, characters, assets, animation, materials, lighting, sound, effects, renderers and interaction.

## One repository, two different visibility decisions

**Technical repository:** Sceneology contains working implementation, prototypes, experiments, successes, failures, diagnostic reports, engineering queues, technical evaluations, tests, schemas and revision history. Failure is a legitimate research outcome; it does not disqualify material from the repository.

**Curated website:** The public gallery at [sguzman.github.io/sceneology](https://sguzman.github.io/sceneology/) shows **only works explicitly selected and approved by the project owner**. A working implementation, passed test, or completed experiment is not approval for showcase inclusion. The gallery starts empty until selections are made.

This project is self-contained: public code, ontology, metadata, viewers and published exhibits must not require access to any nonpublic repository.

## Structure

- `ontology/` — domain definitions, reusable semantics and machine-readable schemas.
- `scenes/` — complete scene implementations and studies, including work in progress.
- `experiments/` — reproducible technical experiments and failures.
- `catalog/library.json` — registry of technical work, independent of artistic approval.
- `catalog/showcase.json` — explicit allowlist for the website gallery.
- `site/` and `index.html` — static, no-build GitHub Pages site.
- `scripts/` and `tests/` — validation and integrity checks.
- `docs/` — public-facing project methodology and publication policy.

The project is bootstrapped without importing any existing private project material. Existing art, source, ontology and historical technical records will be considered separately before migration.

## Migration roadmap and progress

- [🗺️ Evidence-weighted roadmap](docs/ROADMAP.md) — bounded completion gates, source-cohort priorities, migration waves and end-of-session reporting.
- [🛡️ Source-admission policy](docs/MIGRATION.md) — file-by-file screening, confidentiality, licensing, provenance, failure retention and separation from artistic approval.
- [Machine-readable progress ledger](docs/roadmap.json) — weighted tasks, supporting file evidence, measured baseline and current score.

Initial source-family reconnaissance is complete, but **no historical artifact has been admitted or copied**. Detailed source inventories and rejected or unresolved material remain outside this public repository. Gallery approvals are never inferred from technical admission; unsuccessful scenes are not featured.

## Development

Requires Node.js 22 or newer for validation; the website itself works as static HTML/CSS/JavaScript.

```sh
node scripts/validate.mjs
```

GitHub Pages publishes `index.html` when the Pages source points to the `main` branch root. The site starts with no approved exhibits, not fictional examples.

## License

MIT; see [LICENSE](LICENSE). Third-party works, when admitted later, require their own provenance and license review. This repository's MIT license does not automatically relicense outside materials.
