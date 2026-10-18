# realtime-asset-authoring

*Reference, for users of the technical-artist plugin looking up the `realtime-asset-authoring` skill.*

| Field | Value |
|---|---|
| Name | `realtime-asset-authoring` |
| Source | [`skills/realtime-asset-authoring/SKILL.md`](../../skills/realtime-asset-authoring/SKILL.md) |
| Use when | Modelling, UV-unwrapping, baking, texturing or exporting a 3D asset by hand, or reviewing one before import. |
| Produces | A real-time-ready mesh, UVs, texture set and material instance; manifest entry; provenance record; measured numbers. |
| Docs owed | New asset standard: reference + explanation. Repeatable procedure: how-to. |

## Method steps

1. Reference and real-world scale
2. Blockout in the game view
3. Low-poly model (silhouette first, detail baked)
4. Pivot and transforms
5. Smoothing and tangent basis
6. UVs and padding
7. Texel density
8. Bake
9. Texture (PBR rules)
10. Export
11. Check in engine
12. Record

The skill also covers what to do when the DCC tool cannot run headless:
detect it early with the tool's batch command, fall back to procedural or
scripted generation in a tool that runs, and record the substitution in
the handoff and the provenance record.

## Supporting files

- `asset-checklist.md`: pre-import checklist (read and scale, geometry, UVs and textures including engine import settings, material, pipeline)
