# Archived Backyard day/night WebGL2 study

**Kind:** reproducible interactive renderer experiment  
**Technical status:** archived historical geometry snapshot  
**Curated showcase:** not selected; no gallery approval is implied

## What the public artifact contains

The single HTML file [backyard-daynight-legacy-webgl2.html](backyard-daynight-legacy-webgl2.html) embeds its own WebGL2 shaders, time-slider controls, camera behavior and compressed geometric payload. It requires a browser with WebGL2 but no external JavaScript, font, media asset, account, CDN or network call.

**Historical geometry:** 181 parts. A subsequent 179-part fence-clearance correction exists in the separately maintained public renderer project and is not silently substituted here. This file is a *historical experiment*, not the current canonical production scene.

Source is an already-public, owner-controlled rendering study: [public source file](https://github.com/sguzman/renderarium/blob/main/experiments/interactive-weather/backyard-daynight-2026-10-14.html), Git blob `dbebe23f8de97b398dd49013bca6358ac10d2284`. The Sceneology file preserves that code and packed geometry except for one user-facing label clarifying the archival state (new blob `2fece03257bd210e4aa2db7155d9a976bc746300`). No private Git history was imported.

## How to inspect

Open the HTML file through a local web server or its public Sceneology URL in a browser supporting WebGL2. Move the time slider and orbit the camera to observe the intended day/night effects. A browser may report a visible failure if no WebGL2 context exists.

## Evidence boundaries

- The embedded transport and geometry checksum guards remain present.
- Source inspection confirmed no external resource references or network APIs in this HTML and no copied private discussion text in inspected source.
- File-byte comparison against the published public source passed, with the single documented label edit.
- Independent browser/runtime QA is a separate release gate and must be reported only when actually executed.
- A working artifact, a legacy visual review or a technical catalog entry does not confer contemporary artistic approval or selection for the public gallery.
