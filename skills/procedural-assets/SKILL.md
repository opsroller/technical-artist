---
name: procedural-assets
description: Use when creating models, textures, materials or placements by script or node graph (a generator) instead of by hand, or when turning a repeated manual asset task into a generator.
---

# Procedural assets

A generator is a program that produces assets from parameters. Done well, it
gives artists control at a higher level and makes variants, fixes and rebuilds
cheap. Done badly, it is an opaque box that only its author can run. "Nothing
is magic": every generator exists to serve an art goal and an artist.

## When to go procedural

- Many variants of one idea (rocks, crates, trims, foliage, modular kits).
- Rules you can state (window spacing, road profiles, scatter by slope).
- An asset that must be rebuilt often (budget changes, style tweaks).
- A project rule that assets be reproducible from committed sources.

Stay authored (`realtime-asset-authoring`) for one-off hero pieces where
hand control matters more than reuse. Mixed is normal: hand-made hero
locations, procedural fill around them.

## Method

1. **Define the output contract.** What the generator produces (meshes,
   textures, material instances, placements), in what format, names, units,
   pivot and budget class, and where outputs go. Same conventions as authored
   assets.
2. **One tool per job.** Small generators with clear inputs and outputs that can
   call each other (a fence generator calls the post generator), not one
   meta-tool.
3. **Expose art-level parameters.** Height, wear, density, style preset; not
   internal constants. Give defaults that produce a good result. Document each
   parameter's range and effect.
4. **Deterministic.** Same inputs + same seed + same tool version = identical
   output, on every machine. Seed every random call explicitly; never use time
   or unordered iteration as a source of variation. Record the seed and
   parameters with the asset.
5. **Headless and scripted.** The generator runs from the command line (or the
   project's build step) without a GUI session, so CI or another agent can
   regenerate everything. The DCC or tool is whatever the profile names (e.g. a
   DCC in background mode, a node-graph tool, or plain code writing a mesh
   format).
6. **Bake to real-time output.** Generate at authoring time; ship baked meshes and
   textures unless the project explicitly does runtime generation. Produce LODs,
   collision and masks in the same run (`lods-optimization`).
7. **Validate in the generator.** Assert triangle counts, texture sizes,
   bounds, manifold geometry and names against the budget before writing; fail
   loudly with an actionable message.
8. **Lock before hand edits.** If artists hand-edit generated output, mark it as
   locked/baked so regeneration cannot silently overwrite their work, or move
   the edit into a parameter.
9. **Check the family.** View all variants side by side in the look-dev scene
   and in game. Variation should read as intentional; nothing should break the
   style or the budget at parameter extremes.
10. **Record.** Commit the generator, the parameter file and the seed; manifest
    entries; provenance record naming the generator and its version
    (`asset-provenance`).

## Decision rules

- Prefer parameters over code forks; prefer presets over long parameter lists.
- Prefer noise and rules the art director can see and tune over clever maths no
  one can steer.
- If generated output needs the same hand fix twice, put the fix in the
  generator.
- Runtime procedural generation is a gameplay/engine decision; agree it with
  the graphics-programmer and gameplay-programmer, and budget its CPU cost.

## Quality bar

- A clean checkout plus one documented command regenerates every output
  bit-for-bit (or within a stated tolerance for float formats).
- Outputs pass the same validation and budgets as authored assets.
- Another artist can produce a new variant from the how-to alone.

## Docs this work owes

A new generator → reference (parameters, outputs, command) and a how-to for
making a variant; an explanation if you chose procedural over authored for a
non-obvious reason. Updated parameters → update the reference.

## Failure modes

- Unseeded randomness; output differs between machines or runs.
- Tool knowledge held by one person; no how-to.
- Generator that only runs inside an interactive session.
- Regeneration wiping manual edits.
- Variants that drift off-style at parameter extremes, or that look like
  obvious copies (same silhouette, rotated).
- Over-engineering: building a framework before one asset ships.
