# Asset checklist (before import / before PR)

Tick every line or write why it does not apply.

## Read and scale
- [ ] Checked in the real game with the gameplay camera at the smallest supported screen.
- [ ] Silhouette and value distinguish it from other gameplay objects (also in greyscale).
- [ ] Real-world scale; matches neighbours and a scale reference.

## Geometry
- [ ] LOD0 triangle count within its budget class; number stated.
- [ ] No n-gons, non-manifold edges, holes, zero-area faces, stray vertices, duplicate faces.
- [ ] Pivot follows the project rule; transforms applied; scale 1; history cleared.
- [ ] Hard edges only on UV seams; normals and tangent basis match the engine.
- [ ] Opaque and transparent parts are separate materials/meshes.
- [ ] LODs and collision provided as the project requires.

## UVs and textures
- [ ] Fully unwrapped; no unintended overlaps; padding sufficient for the lowest mip used.
- [ ] Texel density at project target (or a documented exception).
- [ ] Texture sizes per project rule (commonly power of two); no texture larger than its screen use needs.
- [ ] Base colour and emissive in sRGB; all data maps (normal, roughness, metallic, AO, masks) linear.
- [ ] PBR values within the ranges in `materials-shaders/pbr-reference.md`.
- [ ] Channel packing matches the project's packed-map convention.
- [ ] Constant-value maps replaced with material parameters.
- [ ] Engine import settings written next to each texture (mipmaps, compression, colour space or sRGB flag, normal-map flag) and matching its role; none left to engine defaults.

## Material
- [ ] Uses a shared/master material or instance where one exists; material count within budget.
- [ ] Shader cost known (`materials-shaders`); no custom shader where the standard one works.

## Pipeline
- [ ] Names and folders per `asset-pipeline`; only a-z, A-Z, 0-9, `_` (and `-` if allowed).
- [ ] Imports with project settings without manual fixes; validator passes.
- [ ] Manifest entry added; no hard-coded paths in code.
- [ ] Source file or generator committed/stored per the profile; re-export reproduces the asset.
- [ ] Provenance record complete (`asset-provenance`), naming the tool actually used if the named DCC was substituted.
- [ ] Measured numbers (triangles per LOD, texture memory, materials/draw calls, file size) in the PR.
