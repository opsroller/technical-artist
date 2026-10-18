---
name: asset-pipeline
description: Use when adding, renaming, importing or reorganising assets, setting naming or folder conventions, configuring import settings, writing import automation or asset validation, or wiring assets into the game through a manifest.
---

# Asset pipeline

The pipeline is everything between an artist's source file and the asset in
the build: naming, folders, export, import settings, validation, the manifest
and the build step. Its job is that a correct asset goes in with no manual
steps and a broken one is stopped with a message the artist can act on.

## Conventions to own

- **Naming.** One pattern for the whole project, e.g.
  `Prefix_BaseName_Variant_Suffix`: type prefix, a group name, a variant
  (`_01` or a descriptive word), and a map-type suffix for textures.
  Characters limited to letters, digits and underscore (no spaces, no
  Unicode). Details and an example table: [naming-reference.md](naming-reference.md).
  If the project already has a convention, it wins; extend it, don't fork it.
- **Folders** by feature or content (`Props/Crates/`), not by file type;
  project assets under one root; experimental work outside production folders;
  no empty folders.
- **Source vs runtime.** Where DCC sources, generators, exported files and
  imported runtime assets live; which are committed and which are generated.
- **Import settings** per asset class (texture compression and colour space
  per map type, mipmaps, mesh normals/tangents, scale, LOD and collision
  import). Set them by rule or preset, not by hand per asset.
- **Logical names in code.** Game code refers to assets by logical name through
  the project's manifest or registry, never by file path. Adding an asset is a
  manifest entry; moving a file never breaks code.

## Import automation and validation (method)

1. **Write the rules down** from the conventions, budgets and PBR rules:
   name pattern, folder, triangle and texture caps, power-of-two sizes,
   colour space per suffix, material count, missing LODs/collision, manifold
   geometry, scale and pivot, provenance record present.
2. **Automate import** so settings follow from name/folder (e.g. `_N` suffix →
   normal-map compression, linear).
3. **Validate on import and in CI.** A validator command that checks every rule,
   prints file, rule and fix, and exits non-zero on errors. Warnings for
   soft limits. The devops-engineer runs it in CI; you own the rules.
4. **Make the error actionable.** "T_Crate_01_N.png: normal map imported as
   sRGB; rename with _N suffix or set colour space to linear" beats "invalid
   texture".
5. **Test the validator** with known-good and known-bad sample assets.
6. **Roll out** new rules as warnings first, fix existing assets, then promote
   to errors. Announce changes to every role that produces assets.

## Build stability

- Never commit an asset that fails validation.
- Batch renames and moves update the manifest and all references in one
  change; run the validator and a build before merging.
- Keep import deterministic: same source + settings = same imported asset.

## Decision rules

- A rule that a human must remember will be broken; automate it or drop it.
- Prefer fixing the exporter or import preset over fixing assets one by one.
- Breaking change to a convention needs a migration script and a docs update in
  the same PR.

## Docs this work owes

Naming, folders, import settings, validator rules → **reference** (the rules
as tables). Why the conventions are what they are → **explanation**. "How to
add a new asset", "how to fix a validation error" → **how-to**. The new
artist's first import → tutorial update.

## Failure modes

- Paths hard-coded in game code; renames break the build.
- Import settings tweaked by hand per asset and lost on reimport.
- Validator that says "failed" with no rule or fix.
- Convention changed silently; half the assets follow the old one.
- Shared manifest edited by several people or agents at once; conflicting
  entries. One owner applies manifest changes.
