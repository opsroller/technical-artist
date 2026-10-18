# lods-optimization

*Reference, for users of the technical-artist plugin looking up the `lods-optimization` skill.*

| Field | Value |
|---|---|
| Name | `lods-optimization` |
| Source | [`skills/lods-optimization/SKILL.md`](../../skills/lods-optimization/SKILL.md) |
| Use when | Creating LODs, impostors or collision meshes, or reducing art cost after profiling shows a problem. |
| Produces | LOD chains by class, collision meshes, reduced draw calls, overdraw and texture memory; before/after numbers. |
| Docs owed | LOD classes or thresholds: reference + explanation. Repeated fix procedure: how-to. |

## Method steps

1. Decide if it needs LODs
2. LOD classes, not per-asset settings
3. Reduce by visual error, not percentage
4. Preserve silhouette
5. Reduce materials and textures with distance
6. Tune transitions
7. Per-tier minimum LOD
8. Measure

## Supporting files

None.
