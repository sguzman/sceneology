# Sceneology

Sceneology is an independent, public laboratory for the **construction, description, implementation, study and presentation of scenes**.

Its domain spans 2D, 3D and hybrid scenes: composition, objects, spatial relationships, constructive geometry, characters, assets, animation, materials, lighting, sound, effects, renderers and interaction.

## One repository, two different visibility decisions

**Technical repository:** Sceneology contains working implementation, prototypes, experiments, successes, failures, diagnostic reports, engineering queues, technical evaluations, tests, schemas and revision history. Failure is a legitimate research outcome; it does not disqualify material from the repository.

**Curated website:** The public gallery at [sguzman.github.io/sceneology](https://sguzman.github.io/sceneology/) shows **only works explicitly selected and approved by the project owner**. A working implementation, passed test, or completed experiment is not approval for showcase inclusion. The gallery includes 21 previously reviewed works as of October 26, 2026, while unapproved and failed variants remain outside the exhibition.

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

The repository began as a clean public foundation. Subsequent scene and experiment transfers undergo individual review and public reconstruction; source histories and unpublished reference material are never imported wholesale.

## Migration roadmap and progress

- [🗺️ Evidence-weighted roadmap](docs/ROADMAP.md) — bounded completion gates, source-cohort priorities, migration waves and end-of-session reporting.
- [🛡️ Source-admission policy](docs/MIGRATION.md) — file-by-file screening, confidentiality, licensing, provenance, failure retention and separation from artistic approval.
- [Private intake decision schema](docs/migration-intake.schema.json) — structural contract for unpublished screening records; do not commit populated private records.
- [Machine-readable progress ledger](docs/roadmap.json) — weighted tasks, supporting file evidence, measured baseline and current score.
- [Browser and deployment evidence](docs/RELEASE-EVIDENCE.md) — scoped software-renderer, schema, gallery safety and live-site verification results.

Source inventories remain in nonpublic review records. **The technical catalog now contains independently screened historical experiments and an archived editable 2D SVG motion study**; their real technical states are preserved and none is automatically shown on the curated website. Approval for gallery placement must be explicit.

## Development

Requires Node.js 22 or newer for validation; the website itself works as static HTML/CSS/JavaScript.

```sh
node scripts/validate.mjs
```

GitHub Actions validates and deploys the static website from `main`; deployed files, desktop/mobile gallery rendering, approved-card thumbnails, keyboard navigation, category filters, and independent model viewers are verified after deployment. Current selected works remain distinct from research and failed experiments.

## License

MIT; see [LICENSE](LICENSE). Third-party works, when admitted later, require their own provenance and license review. This repository's MIT license does not automatically relicense outside materials.

## Current collection (October 26, 2026)

The [live exhibition](https://sguzman.github.io/sceneology/) currently features **21 source-backed works**: seven previously accepted block-chibi environments, thirteen positive-review mechanical/PC models, and the accepted static Quest Girl v7 character. The interactive [model browser](https://sguzman.github.io/sceneology/site/models.html) also indexes **127 source versions grouped into 90 model families** for research; being indexed there is not gallery approval.

Four additional historically accepted room compositions have been migrated as **source-only YAML** into `scenes/composition-sources/`. Their asset references are not yet rebuilt into standalone website viewers, so none is falsely exhibited. Failed studies remain preserved in the technical catalog but not featured.

The [weighted roadmap](docs/roadmap.json) closes the *bounded public foundation and functioning-exhibition milestone*, **not every possible historical asset migration**. Ongoing source and visual-quality decisions continue independently.
