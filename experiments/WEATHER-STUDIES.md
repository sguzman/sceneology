# Archival precipitation and wind effects

These two self-contained WebGL2 experiments were screened from previously public scene-effects work. They preserve historical 181-part geometry and are **technical library entries only**; neither has owner approval to appear in the curated exhibition.

The [rain and wind experiment](backyard-rain-wind-archival.html) includes precipitation amount, speed, wind, drop length, visibility, atmospheric controls and several weather presets. The [snow experiment](backyard-snow-archival.html) includes snow density, drift, flake size, ground accumulation, haze and lighting controls. Each preserves embedded authored geometry and effects shaders.

## Public-source lineage

- Rain/wind: [original public study](https://github.com/sguzman/renderarium/blob/main/experiments/interactive-weather/backyard-rain-wind-2026-10-13.html), Git blob `2bac25b77ddcc30aeb405a70d0c841600f83eda7`.
- Snow: [original public study](https://github.com/sguzman/renderarium/blob/main/experiments/interactive-weather/backyard-snow-2026-10-14.html), Git blob `4312a9a8ddbddda5bee3b3604fde1104bef1b4fd`.

Content review found no external scripts, images, fonts, network APIs or copied nonpublic discussions. Visible wording was updated to prevent a historical geometry snapshot from being mistaken for an approved current release. All future candidates require independent file-level review; this screening applies only to these two artifacts.

## Evidence and limits

A successful browser first draw and captured framebuffer do not establish physical GPU performance, artistic desirability, all-control correctness, benchmark parity or current canonical geometry. The browser test is tracked in [the release evidence log](../docs/RELEASE-EVIDENCE.md). Both experiments remain outside `catalog/showcase.json`.
