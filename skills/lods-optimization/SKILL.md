---
name: lods-optimization
description: Use when creating LODs, impostors or collision meshes, or when reducing an asset's or scene's art cost - draw calls, overdraw, texture memory, triangle density - after profiling shows a problem.
---

# LODs and art optimisation

Optimise what a measurement points at (`art-budgets-profiling`), keep the art
looking intentional, and prove the gain with before/after numbers.

## LOD method

1. **Decide if it needs LODs.** Assets with very few triangles, or always seen
   close, may not; LODs cost memory and can break batching. Large objects
   (buildings, terrain pieces) need different rules from small props.
2. **Use LOD classes, not per-asset settings.** A few classes (e.g. character,
   medium prop, large prop, architecture), each with switch thresholds and
   reduction targets, so the strategy can change globally.
3. **Reduce by visual error, not by percentage.** Target a max screen-space
   deviation (commonly ~1 pixel at the switch point; 2-4 px acceptable for
   distant LODs) or a screen-size switch. Fixed ratios (e.g. "50 % per LOD")
   are a starting point only; a 12-triangle crate cannot lose half.
   Typical starting shape: LOD1 ≈ 50 %, LOD2 ≈ 25 % of LOD0 triangles, each
   switch roughly twice as far as the previous.
4. **Preserve the silhouette** and the shapes that carry gameplay meaning;
   remove interior and small-scale detail first. Keep UV seams and material
   boundaries stable to avoid shading pops.
5. **Reduce materials and textures with distance.** Merge material slots in
   lower LODs where possible; lower LODs can use smaller texture sets or an
   atlas. Furthest: impostor/billboard or cull.
6. **Transitions.** Tune thresholds by watching transitions in game at normal
   play speed; use the project's cross-fade/dither if it has one. Shadows and
   collision can use lower LODs.
7. **Per tier.** Lower tiers may start from a coarser LOD (minimum LOD per
   platform).
8. **Measure** memory and frame cost after adding LODs.

## Reduction toolbox

| Problem | Fixes (in rough order of preference) |
|---|---|
| Too many draw calls | share materials; texture atlases / trim sheets; instancing for repeated meshes; merge static meshes that are always seen together (watch culling granularity); fewer material slots per mesh |
| Overdraw | trim transparent cards tight to their opaque area; fewer stacked particles; opaque where possible; smaller effect footprints at distance |
| Pixel shader cost | simpler material for distant LODs; move work to vertex or bake; quality-tier switches |
| Texture memory | right-size to on-screen use; correct compression per map; share and tile; atlas small textures; drop unique maps that are constant |
| Tiny triangles | LODs; remove sub-pixel detail; impostors at distance |
| Vertex count | fewer hard edges and UV islands (each splits vertices); weld; drop unused attributes/UV sets |
| File size / load | compression, remove unused data, share dependencies |

## Collision

Simple collision shapes or a low LOD, never the render mesh unless the
project requires it. Agree accuracy needs with the gameplay-programmer.

## Quality bar

- Gain measured on the lowest tier, in the scene where the problem was found.
- No visible pop at normal play distance; silhouette and readability intact.
- LOD and optimisation settings recorded so a re-export reproduces them.

## Docs this work owes

New LOD classes or thresholds → reference; why they were chosen →
explanation; a fix procedure others will repeat → how-to.

## Failure modes

- Optimising without a capture; "optimisations" that move nothing.
- Uniform percentage reduction destroying small assets.
- Too many LODs breaking batching; too few leaving tiny triangles.
- Merging meshes so large that culling stops working.
- Atlases with insufficient padding causing mip bleeding.
