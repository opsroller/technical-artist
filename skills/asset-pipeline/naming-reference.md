# Naming reference (default pattern)

Use the project's convention when it has one. Otherwise this default, adapted
from widely used open style guides.

Pattern: `Prefix_BaseName_Variant_Suffix`

- **Prefix**: asset type.
- **BaseName**: logical group, PascalCase (`Crate`, `StreetLamp`, `OakTree`).
- **Variant**: `_01`, `_02` for generic variants; a word for specific ones
  (`_Broken`, `_Snow`). More than ~99 variants: reorganise.
- **Suffix**: map type for textures; `_LOD1` etc. for LOD meshes if exported
  separately; `_Col` for collision if the project uses separate files.
- Characters: `A-Z a-z 0-9 _` only. No spaces, symbols or Unicode. Start with
  a letter.

## Type prefixes (example set)

| Prefix | Type |
|---|---|
| `SM_` | static mesh |
| `SK_` | skinned mesh |
| `M_` | master material |
| `MI_` | material instance |
| `T_` | texture |
| `FX_` | effect |
| `SH_` | shader / shader function |
| `GEN_` | generator script or graph |

## Texture suffixes (example set)

| Suffix | Map |
|---|---|
| `_BC` (or `_D`) | base colour / albedo |
| `_N` | normal |
| `_R` | roughness |
| `_M` | metallic (pick one meaning for `_M` project-wide) |
| `_AO` (or `_O`) | ambient occlusion |
| `_E` | emissive |
| `_A` | opacity |
| `_H` | height |
| `_ORM` | packed: occlusion R, roughness G, metallic B |
| `_Mask` | generic mask |

## Examples

| Name | Meaning |
|---|---|
| `SM_Crate_01` | first generic crate mesh |
| `SM_Crate_Broken` | specific broken variant |
| `MI_Crate_Painted` | material instance for painted crates |
| `T_Crate_01_BC`, `T_Crate_01_N`, `T_Crate_01_ORM` | its texture set |
| `SM_StreetLamp_01_LOD1` | first LOD of a lamp |
| `GEN_Rock` | rock generator |
