# procedural-assets

*Reference, for users of the technical-artist plugin looking up the `procedural-assets` skill.*

| Field | Value |
|---|---|
| Name | `procedural-assets` |
| Source | [`skills/procedural-assets/SKILL.md`](../../skills/procedural-assets/SKILL.md) |
| Use when | Creating models, textures, materials or placements by script or node graph, or turning a repeated manual task into a generator. |
| Produces | A committed generator, parameter file and seed; generated assets with LODs and collision; manifest entries; provenance records naming generator and version. |
| Docs owed | New generator: reference + how-to; explanation if procedural was a non-obvious choice. |

## Method steps

1. Define the output contract
2. One tool per job
3. Expose art-level parameters
4. Deterministic (explicit seeds)
5. Headless and scripted
6. Bake to real-time output
7. Validate in the generator
8. Lock before hand edits
9. Check the family
10. Record

## Supporting files

None.
