# Block-Chibi Lamp Family v1.2

**Status:** passed / user-approved

v1.2 is a focused repair pass. It does not redesign the accepted lamp forms.

## What changed

### 1. Stain-like shading

The tapered constructive solids now use hard/flat face shading.

The previous dark blotches came from smooth normal interpolation across hard tapered-box faces, not
from dirt textures.

### 2. Task-lamp direction

The task-lamp head is rotated so its wide opening faces downward toward the work surface.

Its emitter is mounted at that opening and its task light is directional along the same local axis.

### 3. True power-off state

The power toggle now switches both:

- local lamp light contribution;
- emitter emissive intensity / emitter color state.

When off, the emitter should look like ordinary muted cream material rather than a still-glowing
panel.

## Review gate

1. Are the dark stain-like patches gone?
2. Does the task lamp now point where its light actually lands?
3. Does "light off" actually look off?
4. Is the on-state still strong enough?
5. Did these fixes preserve the good geometry from v1.1?


## Human review — pass

v1.2 is accepted as the first usable block-chibi lamp family.

Confirmed:

- the fixtures now read as actual lamps;
- the stain-like shading artifacts are gone;
- the middle and right lamps produce clear warm light halos;
- the task lamp reads as a coherent adjustable lamp;
- powering the lamps off removes the visible powered-emitter read;
- the family is visually accepted.

Disposition:

```text
lamp v1   = failed
lamp v1.1 = partial-success repair
lamp v1.2 = accepted baseline
```
