# Block-Chibi Lamp Family v1.1

**Status:** partial pass / v1.2 required

v1.1 repairs the failed lamp proof.

## Corrections

### Task lamp

The task lamp is now constructed as a real parented chain:

```text
base -> joint -> lower arm -> elbow -> upper arm -> head joint -> head -> emitter
```

The head can no longer be merely "near" the arm; it belongs to that chain.

### Palette

The floor lamp now uses a light rose shade instead of the arbitrary cream/white shade split.

### Shading

The review renderer now uses cleaner shadow settings and prevents lamp fixtures from receiving their
own harsh self-shadow acne. They still cast shadows onto the environment.

### Emission

The warm emitter materials are substantially stronger and each lamp has a stronger local point light.

## Review gate

1. Is the task lamp obviously one connected object now?
2. Is its head/top present and attached?
3. Are the dirty/stained-looking shade artifacts gone?
4. Is the warm light now clearly visible instead of barely perceptible?
5. Does the family palette feel coherent?


## Human review — partial pass

v1.1 is a substantial improvement but is not the accepted baseline yet.

Accepted improvements:

- the family is much better overall;
- the task lamp finally reads like an adjustable / Pixar-like desk lamp;
- light output is visibly stronger.

Remaining failures:

1. **stain-like shade shading**
   - middle and right shades still show dark dirty-looking patches;
   - this remains visually unacceptable even if caused by shading rather than texture.

2. **task-lamp direction mismatch**
   - the head visually points upward/away while the emitted light reads downward;
   - head orientation and emission direction must agree.

3. **false off-state**
   - toggling lamp light off removes local illumination but the emitter still looks shiny/luminous;
   - the power control must disable emissive contribution as well as light objects.

v1.2 must fix these three issues without redesigning the accepted geometry.
