# lookdev-capture

*Reference, for users of the technical-artist plugin looking up the `lookdev-capture` skill.*

| Field | Value |
|---|---|
| Name | `lookdev-capture` |
| Source | [`skills/lookdev-capture/SKILL.md`](../../skills/lookdev-capture/SKILL.md) |
| Use when | Seeing art or a shader in the engine without a person at the screen: before/after frames, frames per tier or renderer, greyscale readability checks, screenshots for docs and reviews. |
| Produces | Verified frames named `<scene>-<camera>-<renderer or tier>-<before\|after>`, greyscale copies, side-by-side and difference images, a judgement per frame. |
| Docs owed | New capture command or capture hook: reference + how-to. Frames in docs: captioned with renderer or tier and driver. |
| Used by | [asset-batch](workflow-asset-batch.md), [author-shader](workflow-author-shader.md), [calibrate-visual-checks](workflow-calibrate-visual-checks.md) |
| How-to | [How to capture look-dev frames before and after a change](../how-to/how-to-capture-look-dev-frames-before-and-after.md) |

## Method steps

1. Pick the frames: look-dev scene and gameplay camera, one per renderer or tier
2. Make the frame deterministic: fixed timestep and seed, warm-up frames, one named frame
3. Isolate the scene: capture mode, through a capture hook the project provides (flag, environment variable or override file); with none, propose one as a small separate change for the overlay code's owner, never hand-edit shipping configuration
4. Find or build the capture command: the project's own, or one built from the generic recipe; otherwise mark the capture pending with the reason
5. Render with the engine's offline mode; virtual display and software driver when there is no GPU
6. Verify every frame: size, not black or blank, the right frame, no overlay
7. Capture "before" first, from the base commit, with the same setup
8. Derive greyscale, side-by-side and difference images by script
9. Judge against the brief, art direction and readability criteria
10. Store by the project's rule; no large frames in the repository

The skill also holds a generic capture command recipe: the parts a capture script sets (engine, scene and camera, capture mode, size, renderer, time, output, display).

## Supporting files

- `engine-recipes.md`: virtual display and software GPU on Linux (Xvfb, Mesa lavapipe and llvmpipe), capture commands for Godot 4, Unreal Engine and Unity, capture hooks for overlays per engine, and Pillow and ImageMagick commands for derived images.
