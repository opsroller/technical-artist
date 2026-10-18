---
name: lookdev-capture
description: Use when you need to see what art or a shader looks like in the engine without a person at the screen - before/after frames for a material, texture or shader change, frames per quality tier or renderer, greyscale readability checks, or screenshots for docs and reviews - rendered headless or on a virtual display, with or without a GPU.
---

# Look-dev capture

A change to materials, textures, shaders or lighting is only judged once
someone has looked at it in the engine, under the game's lighting, from
the gameplay camera. This skill makes that look repeatable: the same
scene, camera, size, frame and renderer before and after, rendered by a
command anyone (or CI) can run, so the comparison shows the change and
nothing else.

Engine-specific commands are in [engine-recipes.md](engine-recipes.md).
Setting up a container to render at all (engine binary, drivers, what
frame times there mean) is the graphics-programmer's `headless-rendering`
skill; use it when that plugin is installed.
The project profile names the engine, the look-dev scenes and where
frames go; it wins over this skill.

## Method

1. **Pick the frames.** For each change: the project's look-dev scene
   (neutral light and references, materials-shaders skill) and the
   gameplay camera in a real level or board. One frame per renderer or
   quality tier the project ships, because a higher tier can hide a
   problem the base tier shows. Write the list down: scene, camera,
   renderer or tier, size.
2. **Make the frame deterministic.** Fixed timestep, fixed random seed,
   animations and particles paused or at a set time, no time-of-day or
   auto-exposure drift. Render enough warm-up frames for loading,
   temporal anti-aliasing, global illumination and exposure to settle,
   then keep one named frame (e.g. frame 30 at 30 fps). The same frame
   number is used before and after.
3. **Render with the engine's offline mode.** Use the engine's
   fixed-step movie or screenshot mode, not a screen grab. A truly
   headless run often uses a dummy renderer and writes nothing; render
   to a virtual display instead (Xvfb on Linux) and, without a GPU, use
   a software driver (Mesa lavapipe for Vulkan, llvmpipe for OpenGL).
   Pin the driver and say which one rendered each frame.
4. **Verify every frame.** Check its pixel size (a resolution flag can be
   ignored; set the window or viewport size override the engine offers
   and check again), that it is not black, blank or a loading screen,
   and that it is the frame you asked for. Re-capture any that fail. A
   frame that was not checked is not evidence.
5. **Capture "before" first.** Render the before frames from the base
   commit (a separate worktree or checkout of the default branch) with
   the same command, size, frame and driver, before changing anything.
   Name files `<scene>-<camera>-<renderer or tier>-<before|after>.<ext>`.
6. **Derive comparison images.** For each frame: a greyscale copy (value
   and readability), a side-by-side before | after, and optionally a
   numeric difference (mean or RMS per channel) to prove a change did or
   did not move pixels. Use a scripted tool (Pillow, ImageMagick) so the
   derived images are reproducible.
7. **Judge.** Look at every frame and its greyscale copy. Compare with
   the brief, the art direction and the readability criteria from the
   visual target: gameplay objects tell apart by value in greyscale, by
   silhouette and by colour; nothing washed out, too dark, blown out,
   noisy or aliased; higher tiers add to the base look rather than change
   what reads. Name each failure with its frame.
8. **Store by the project's rule.** Small compressed frames (JPEG or WebP)
   in the docs when a page shows them; full-size frames as CI or build
   artifacts, not in the repository. Never commit large binary frames
   by default.

## What a software renderer can and cannot tell you

A software rasterizer renders the same shaders and material values, so
it judges colour, value, roughness response, readability and layout. It
may lack or approximate hardware ray tracing, some global illumination
and some post effects, and it is slow. Label such frames ("lavapipe"),
judge values and readability from them, and leave final judgement of
GPU-only features to a capture on real hardware (a GPU runner, a
teammate's machine) when the change depends on them.

## Docs this work owes

A new capture command or script → reference (command, scenes, sizes,
driver) and a how-to for running it. Frames shown in docs → keep them
next to the page that explains the look, captioned with renderer or
tier and driver.

## Failure modes

- Black or grey frames: headless dummy renderer, or no GPU and no
  software driver.
- Wrong size: the resolution flag ignored; the window override not set.
- The first frame captured before loading, TAA or exposure settled.
- Before and after rendered with different drivers, sizes or frames, so
  the difference is the setup, not the change.
- Particles, animation or random seeds differing between runs.
- Judging only in colour, only one tier, or only the flattering scene.
- Large frames committed to the repository.
