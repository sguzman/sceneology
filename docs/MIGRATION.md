# 🛡️ Source admission and publication policy

This is the procedure for **future** migration into Sceneology. A candidate is not approved simply because it exists elsewhere. A technically useful failure can qualify just as a finished scene can.

## Eligibility

Review candidates individually, including embedded resources and generated outputs.

1. **Relevant:** the candidate contributes to scenes, objects, animation, visual composition, spatial relationships, lighting, audio, effects, rendering, interaction, or scene ontology.
2. **Safe to publish:** exclude nonpublic correspondence, personal narratives, sensitive identifying information, access secrets, local-only infrastructure details, and unpublished locations. Screen content, comments, file properties, archived exports, and output bundles; filename checks alone are insufficient.
3. **Rights cleared:** original materials or explicitly redistributable components, with required notices and attribution. Unknown rights are a hold, not implied permission.
4. **Dependencies resolved:** every required runtime or media resource is available publicly and legally, without inaccessible services, accounts, or internal resources.
5. **Truthful technical evidence:** describe exactly what runs, what failed, and which platforms, renderers and interactions were tested. Do not upgrade visual observations into performance or implementation claims.

**An unresolved hard gate means hold the candidate outside this public repository.**

## Research value scoring

After all hard gates pass, score each criterion from 0 to 3: domain relevance, reusable learning, reproducibility, distinctiveness, and maintainability.

- **9 to 15:** strong migration candidate.
- **6 to 8:** hold for a defined improvement.
- **0 to 5:** normally retain only at the source.
- **Exception:** a valuable negative result or unique historical study can be admitted with a documented rationale. Artistic success is not a scoring prerequisite.

Scoring is a selection aid, not a release authorization.

## Where review information belongs

The complete per-file source inventory, source references, internal reviews, and rejected or unresolved cases **stay in nonpublic working records**. Do not add those records to this repository.

A selected artifact receives a new, independent public identity and, where relevant, a public-safe attribution/provenance statement. Do not transplant another repository's commit history. Review each proposed public diff and commit message before pushing, including scripts, comments, media metadata, tests and generated website output.

Reconcile duplicates and authoritative semantics before copying. Use selective rewrites when direct transfer is unsuitable. Never conceal a remaining private dependency.

## Public technical library versus gallery

A safe, real implementation or study can enter `catalog/library.json` with an accurate status, rights declaration and usable public path. Failed and inconclusive work is allowed. A generated still does not prove a working rig or animation; a software-rendered screenshot does not prove a hardware GPU result.

**Only the owner can approve a particular gallery item.** Selection is recorded as its ID in `catalog/showcase.json` after the real public viewer and thumbnail are verified. No successful test, earlier review elsewhere, or migration decision implies gallery approval. The gallery can remain empty while the technical repository grows.

## Migration sequence

1. Create a nonpublic inventory of all relevant source families and variants.
2. Identify duplicate implementations and select coherent, reproducible units.
3. Screen every candidate and dependency for domain fit, publication safety, rights and technical evidence.
4. Preserve decisions and unresolved cases in nonpublic records.
5. Stage only cleared content as new public files; audit the proposed diff and output.
6. Commit directly to `main` only after this check, add accurate technical catalog entries, and run CI/browser verification.
7. Request explicit owner selection **only when** a real piece is being considered for the exhibition.

See [the weighted roadmap](ROADMAP.md) and [machine-readable tasks](roadmap.json).
