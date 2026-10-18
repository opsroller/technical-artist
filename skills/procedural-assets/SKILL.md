---
name: procedural-assets
description: Use when creating a model or texture, especially by script.
---

# Procedural assets

- Prefer a script in the project's tools folder that regenerates the
  asset headless with the DCC tool the profile names (for example
  Blender in background mode), exporting an engine-friendly format.
- Design for the camera: the silhouette must read from the gameplay
  view at the smallest screen.
- Bevel edges so forms catch light; keep normals and scale consistent
  across a set.
- Log each asset and its generator in the provenance log.
