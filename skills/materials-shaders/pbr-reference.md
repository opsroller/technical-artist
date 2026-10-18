# PBR value reference (metal/roughness)

Guideline ranges from established practice (Adobe/Allegorithmic PBR Guide;
GDC 2016 "End-to-End Approach to PBR"). The project's own calibrated values win
where they exist.

| Map | Colour space | Rule |
|---|---|---|
| Base colour, dielectric | sRGB | No lighting or AO. Darkest ≥ 30 sRGB (strict: ≥ 50); brightest ≤ 240 sRGB. Lower contrast than an old diffuse map. |
| Base colour, raw metal | sRGB | Reflectance colour, ~180-255 sRGB (70-100 % reflectance). |
| Metallic | linear | Binary in principle: 0 = dielectric, 1 = raw metal. Raw metal 235-255. Greys only for blends (dirt over metal, transitions). Rust, paint, oxide = dielectric (0). |
| Roughness | linear | 0 smooth, 1 rough. Mostly artistic; carries wear and surface story. Glossiness = 1 - roughness. |
| Normal | linear | Tangent space, convention matching the engine (OpenGL +Y or DirectX -Y). Same tangent basis for bake and import (commonly MikkTSpace). |
| Ambient occlusion | linear | Separate channel; affects diffuse/indirect only. Never multiplied into base colour. |
| Emissive | sRGB | Colour; intensity as a material parameter. |
| Masks/packed | linear | Per project packing convention. |

Dielectric F0 is fixed at ~4 % (0.04 linear) in most metal/roughness shaders.
Common dielectrics range 2-5 %; gemstones higher. Specular/gloss workflow:
metals black in diffuse, F0 in an RGB specular map (dielectrics ~40-75 sRGB).

Energy conservation: a surface never reflects more light than it receives.
Low texel density at metal/dielectric borders produces white fringing in
metal/roughness; keep density adequate where they meet.

Texture format notes: colour data may tolerate lossy compression; normal maps
are sensitive to it (use the project's normal-map compression format). Replace
constant-value maps with material parameters.
