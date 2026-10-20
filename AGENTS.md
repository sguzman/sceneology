# Sceneology contributor and agent notes

Sceneology is a complete public scene-construction and research project, **not** a gallery-only repository.

- Work on the existing `main` branch unless specifically directed otherwise; do not rewrite history or import commit ancestry from source projects.
- Keep technical experiments, including failed or inconclusive ones. Give them accurate status and reproducible evidence.
- Never add anything to `catalog/showcase.json` without explicit owner approval of the specimen and its scope.
- When transferring material from another source, review actual file contents and the whole dependency closure. Remove private conversation text, venting, personal stories, internal addresses and sensitive metadata without discarding useful technical facts.
- Raw source evaluations, queues and incident reports are **not** inherently disallowed; clean personal/private passages while preserving technical decisions and failure information.
- Do not invent or link private runtime dependencies, embed tokens, copy unlicensed external media, or publish sample work disguised as real approved Sceneology art.
- Review each outgoing public commit, including paths, code comments, documentation, image metadata, generated assets and deployment output. Automated checks only supplement substantive review.
- Keep the ontology both understandable by humans and machine-readable. Validate examples and references.
- The website is a curated projection of `catalog/showcase.json`, not an automatic catalog of all repository entries.
- Prefer small, static and reproducible tools. `node scripts/validate.mjs` is the basic verification entrypoint.
