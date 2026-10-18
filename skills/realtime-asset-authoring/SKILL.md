---
name: realtime-asset-authoring
description: Use when modelling, UV-unwrapping, baking, texturing or exporting a 3D asset for a real-time game by hand in a DCC tool, or reviewing one before import.
---

# Real-time asset authoring

A game asset is a mesh, its UVs, its texture set and its material, built so that
it reads from the gameplay camera, fits its budget, and imports without fixes.
This skill is the authored (hand-made) path; for generator scripts see
`procedural-assets`. The same conventions apply to both.

## Inputs to collect first

- Brief: what the object is, what it must communicate (from the game-designer),
  where it appears, how close the camera gets.
- Art direction references and the style guide.
- Budget class for this asset (`art-budgets-profiling`): triangles for LOD0,
  texture set size, material count.
- Project conventions: unit scale, up axis, pivot rule, naming, texel density
  target, export format, normal-map convention (from the profile).

## Method

1. **Reference and scale.** Gather references; block the object at real-world
   scale (1 unit = 1 m unless the project says otherwise) next to a scale figure
   or existing asset.
2. **Blockout in the game view.** Put a rough primitive version in the real game
   with the real camera. Check silhouette, size and read at the smallest
   supported screen before any detail. Distinct gameplay objects must differ in
   silhouette *and* value, not only hue.
3. **Model the low-poly.** Spend triangles on the silhouette and on shapes that
   catch light; bake small detail into normals instead. Keep the quad source,
   triangulate only on export (or let the exporter do it consistently).
   Avoid n-gons, high-valence poles, non-manifold edges, open holes, zero-area
   faces. Chamfer/bevel hard edges that would read as razor-thin.
4. **Pivot and transforms.** Pivot per project rule (commonly bottom-centre at
   origin for props; hinge points for moving parts). Apply/freeze transforms;
   clear history and modifier stacks before export; scale = 1.
5. **Smoothing and normals.** Set hard edges only at UV seams (a hard edge needs
   a seam; not every seam needs a hard edge). Use the same tangent basis as the
   engine (commonly MikkTSpace) for bake and import so normal maps match.
6. **UVs.** Unwrap everything; no overlaps unless deliberately mirrored or
   stacked (and then offset out of the bake). Seams in hidden or natural breaks.
   Straighten shells where possible for packing and compression. Leave padding
   for mip levels (shell spacing grows with the lowest mip used). Use a second
   UV set only if the project needs one (e.g. lightmaps).
7. **Texel density.** Scale shells to the project target (px/m), checked with a
   checker texture or a density tool. Hero/close-up surfaces may go higher, hidden
   or distant surfaces lower, by a documented rule, not by accident.
   Neighbouring assets must not show visibly mismatched density.
8. **Bake.** High-to-low bake (normal, AO, curvature, ID as needed) with a cage or
   tuned ray distance; fix skewing and ray misses; bake in the engine's normal
   convention. Exploded bakes for intersecting parts.
9. **Texture.** Follow `materials-shaders` for PBR values, colour spaces and
   channel packing. Use tiling materials and trim sheets for large surfaces;
   unique textures where the asset needs them.
10. **Export.** Project format and settings; one asset per file unless the
    project groups them; names per `asset-pipeline`. Include LODs and collision
    meshes as the project requires (`lods-optimization`).
11. **Check in engine.** Import with the project's settings, view under the
    look-dev scene and in the game, run the validator, measure against budget.
12. **Record.** Manifest entry, provenance record (`asset-provenance`), source
    file committed or stored where the profile says.

## Decision rules

- Detail that changes the silhouette at gameplay distance: geometry. Detail that
  only changes shading: normal map. Detail below a pixel at gameplay distance:
  drop it.
- Unique texture vs tiling/trim: unique for small hero props; tiling + trims for
  architecture and large surfaces; decals for local variation.
- Mirror UVs to save space only where the mirror will not be noticed and the
  engine handles mirrored tangents.
- If a fix needs hand-editing exported files, fix the source or the exporter
  settings instead.

## Docs this work needs

New asset standard (pivot rule, texel density, export settings) → reference in
the project's art standards plus explanation of why. A repeatable artist
procedure → how-to. See the agent's documentation step.

## Failure modes

- Polishing before the blockout was checked in the real camera.
- Inconsistent scale or texel density across a set; seams with visible
  shading breaks; normal map inverted green channel.
- Lighting or AO painted into base colour.
- Exported with unapplied transforms, wrong up axis or leftover history.
- Asset that only its author can re-export.

Full pre-import checklist: [asset-checklist.md](asset-checklist.md).
