---
name: asset-pipeline
description: Use when adding, renaming or budgeting assets, or wiring them into the game.
---

# Asset pipeline

- Code refers to assets by logical name in the project's manifest,
  never by path. Adding an asset is a manifest line.
- Name logically (`piece_0`, `board`, `fx_match`), not by file.
- Respect the profile's budgets (triangles, texture size, file size);
  state measured numbers in the PR.
