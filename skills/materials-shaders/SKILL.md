---
name: materials-shaders
description: Use when creating or tuning a material or shader.
---

# Materials and shaders

- Use the engine's standard material with procedural textures first;
  write a custom shader only for effects it can't do (glows, flashes,
  rim lights).
- Test on every renderer the project targets (mobile and desktop)
  before marking done.
- Textures at or under the profile's maximum size, with mipmaps.
