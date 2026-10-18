# Art budget template

Copy into the project's docs as reference; fill per target tier. Example
numbers are placeholders to show shape, not recommendations.

## Frame and platform

| Field | Value |
|---|---|
| Tier | e.g. low mobile / mid / high desktop |
| Resolution / frame target | e.g. 1080p / 33.3 ms |
| Content share of GPU frame | e.g. 60 % |
| Per-frame triangles (typical / worst) | |
| Per-frame draw calls (typical / worst) | |
| Resident texture memory per level | |
| Measurement method | tool category, scene, number of captures |

## Per class

| Class | LOD0 tris | LOD count / reduction | Texture set (max size) | Materials per asset | Texel density px/m | Notes |
|---|---|---|---|---|---|---|
| Character | | | | | | |
| Hero prop | | | | | | |
| Small prop | | | | | | |
| Environment kit piece | | | | | | |
| Effect | | | | | | overdraw limit |

## Rules

- Texture sizes: power of two (unless the project allows otherwise); mipmaps on
  for 3D textures.
- Compression formats per map type and platform.
- Exceptions: who approves, where recorded.
- Validator command that enforces this table.

## Change log

| Date | Change | Reason | Measured evidence |
|---|---|---|---|
