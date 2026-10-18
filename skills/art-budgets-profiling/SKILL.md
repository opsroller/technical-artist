---
name: art-budgets-profiling
description: Use when setting, revising or checking art budgets (triangles/vertices, texture memory, materials, draw calls, overdraw, file size), or when profiling what art actually costs in a running build.
---

# Art budgets and profiling

There is no universal number. Budgets come from the target hardware, the
frame-time goal, the camera and the game's density, and they are proven by
measuring, not by forum figures. A budget is a contract between art and
engineering: artists know what they may spend; engineers know what to expect.

## Units that matter

| Cost | What drives it | Measured as |
|---|---|---|
| Geometry | vertices after splits (each UV seam, hard edge and material boundary splits vertices), triangles, vertex attributes | verts/tris per asset and per frame |
| Tiny triangles | dense meshes covering few pixels | triangles per pixel, wireframe/quad-overdraw views |
| Texture memory | resolution, format/compression, mips (~+33 %), number of unique textures | MB resident per scene/level, per asset |
| Draw calls / state changes | unique mesh × material combinations visible; batching and instancing | draw calls and material/shader switches per frame |
| Pixel cost | shader complexity × pixels covered; overdraw from transparency and particles | GPU time per pass, overdraw view |
| Streaming/load | file size, number of files, dependencies | MB on disk, load time |
| Build | shader permutations, import time | variants count, minutes |

## Setting budgets (method)

1. **Get the frame.** From the graphics-programmer and project profile: target
   tiers, resolution, frame-time target (e.g. 16.6 ms or 33.3 ms), and how much
   of it is reserved for content vs engine, UI, post.
2. **Measure a reference.** Profile a comparable scene (the project's own
   prototype or a similar game) with a frame capture tool; average several
   captures, not one.
3. **Split per scene, then per class.** Per-frame totals (triangles, draw calls,
   texture memory) for a typical and a worst-case view, divided among classes
   such as: characters, hero props, small props, environment kit, effects, UI.
   One way to cap geometry: density per square metre of bounds per size class.
4. **Write them down** with the budget template: [budget-template.md](budget-template.md).
   Include texel density target, texture size caps per class, LOD rules,
   material count per asset, and the measurement method.
5. **Prove them** with a stress scene on the lowest tier at worst-case density.
6. **Revisit** at milestones; budgets move as the game is optimised. Record why
   a number changed.

## Checking an asset or scene

1. Read the asset's numbers from the validator or import report: tris per LOD,
   verts, materials, texture memory, file size. Compare with its class budget.
2. In a build on the lowest tier, capture a frame (a GPU frame debugger or the
   engine's profiler, whatever the profile names). Find: draw calls and which
   meshes/materials cause them; most expensive passes; overdraw hotspots;
   texture memory by asset; triangle density views.
3. **Attribute cost** to assets and materials. Rank offenders by cost × count
   (a cheap prop placed 2 000 times can outrank one hero asset).
4. Fix with `lods-optimization`, or hand engine-side causes to the
   graphics-programmer with the capture.
5. Report: before/after numbers, tier, scene, method.

## Decision rules

- Optimise the scene total, not each asset in isolation; one asset over budget
  is fine if the scene meets its goal and the exception is recorded.
- Measure on the lowest supported tier; desktop numbers prove nothing about
  mobile.
- When CPU-bound on submission, cut draw calls; when GPU-bound on pixels, cut
  overdraw and shader cost; when memory-bound, cut texture resolution or unique
  textures. Find which bound first.
- Budgets with no automated check erode; ask the devops-engineer to run the
  validator in CI.

## Docs this work owes

Budgets are **reference** (tables per class and tier) plus an **explanation**
of how they were derived and what trade-offs they encode. A profiling
procedure the team repeats → how-to.

## Failure modes

- Budgets copied from another game or a forum post without measuring.
- Counting DCC triangles and ignoring vertex splits, materials and attributes.
- Budgets that arrive after most assets are made.
- Optimising the wrong bound (cutting triangles in a pixel-bound scene).
- One capture, one camera angle, a dev machine.
