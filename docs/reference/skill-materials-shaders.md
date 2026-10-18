# materials-shaders

*Reference, for users of the technical-artist plugin looking up the `materials-shaders` skill.*

| Field | Value |
|---|---|
| Name | `materials-shaders` |
| Source | [`skills/materials-shaders/SKILL.md`](../../skills/materials-shaders/SKILL.md) |
| Use when | Creating or tuning a material, texture set or shader, checking PBR values, setting up look-dev, or supporting lighting and readability. |
| Produces | Material instances or new master materials, shaders with known cost, a look-dev scene, readability findings. |
| Docs owed | New master material or shader: reference + explanation. Look-dev procedure: how-to. |

## Method steps

1. Material: start from the shared material; workflow value rules; texture set; colour spaces; validate values; variants by parameter
2. Shader: write the effect down; prototype; measure cost; reduce; expose parameters; test every platform tier
3. Look-dev: neutral scene, reference comparison, greyscale readability check, lighting hand-offs

## Supporting files

- `pbr-reference.md`: metal/roughness value ranges, colour spaces, F0, packing notes
