---
name: materials-shaders
description: Use when creating or tuning a material, texture set or shader, checking PBR values, setting up a look-dev scene, or supporting lighting and readability of in-game 3D art.
---

# Materials, shaders and look-dev

Materials decide how surfaces respond to light. In a physically based (PBR)
workflow they stay correct under any lighting, so art made by different people
matches. Shaders are code; they cost GPU time on every pixel they cover.

## Material method

1. **Start from the shared material.** Use the project's master/standard
   material and make an instance with parameters. A new material type needs a
   reason (an effect the standard one cannot do).
2. **Pick the workflow the project uses** (most commonly metal/roughness) and
   follow its value rules: [pbr-reference.md](pbr-reference.md).
3. **Texture set.** Base colour (sRGB) without lighting or AO; metallic mostly
   0 or 1; roughness carries most of the surface story; normal in the engine's
   convention; AO as its own channel. Pack linear masks per the project
   convention (e.g. occlusion/roughness/metallic in R/G/B).
4. **Colour spaces.** Colour data sRGB; everything else linear. A wrong flag
   is the most common reason "the material looks washed out / too dark".
5. **Validate values.** Check base colour ranges and metal values with a PBR
   validation view or a script; check in neutral lighting first, then in game
   lighting.
6. **Variants by parameter, not by copy.** Tint, wear, dirt and trim selection
   as instance parameters or masks.
7. **Quality-tier variants.** When the visual target gives higher tiers more
   (larger textures, parallax, refraction, subsurface), keep one base variant
   every target can load and add higher-tier variants beside it. Lower-tier
   exports leave the higher-tier files out; each tier's texture memory stays
   within its budget.

## Texture sets from a generator

When one script produces many texture sets or materials, treat the run as
one unit of work (the `asset-batch` workflow plans it that way):

- The generator and its inputs are the source; fix them and regenerate,
  never edit an output by hand.
- Run it twice and compare outputs byte for byte; a generator that is not
  deterministic cannot be reviewed or cached.
- Follow the project rule on committing generated files. Without one,
  large or binary outputs are built, not committed: commit the generator
  and inputs, ignore the outputs, and make the build run the generator
  before anything that reads them (validator, import, export).
- Check colour space and value ranges with a script over the outputs, not
  by opening a few files.

## Shader method

The `author-shader` workflow runs these steps with independent reviews.

1. **Write the effect down**: what it must look like, where it is used, how
   much screen it covers, which platforms.
2. **Prototype** in the project's shader tool (node graph or code).
3. **Measure cost** on the lowest target tier: instruction/ALU count, texture
   samples, whether it is opaque, alpha-tested or blended, how many pixels it
   covers. Full-screen or large blended surfaces deserve the most care.
4. **Reduce:** move work from pixel to vertex or to baked textures; pack
   samples; drop features by quality tier with static switches, but watch the
   permutation count (each switch can double compiled variants and build time).
5. **Expose artist parameters** with sensible ranges and names; hide the rest.
6. **Test on every renderer and platform tier** the project targets, including
   fallbacks. A target this machine cannot compile for at all (a
   platform-only shader compiler, e.g. Metal from a Linux host) is
   "pending CI", never "ok": name the CI job that compiles it, list it in
   the PR, and confirm it from that job's result before merge.

## Look-dev and lighting support

- Keep a **look-dev scene** in the project: neutral grey and colour-checker
  references, a neutral image-based light, a key/fill setup matching the game's
  typical lighting, and the gameplay camera. Assets are judged there first,
  then in real levels.
- Compare against reference photos or the art target side by side; judge in
  greyscale to check value and readability. Render the frames headless,
  before and after each change, with the `lookdev-capture` skill.
- Gameplay readability: important objects must stand out by value, silhouette
  and saturation from the gameplay camera under every lighting condition the
  game uses. Agree what must read with the game-designer. Turn the criteria
  into automated checks with the `visual-acceptance-checks` skill.
- Lighting setups and bake settings belong to the project's lighting owner;
  you supply calibrated materials and flag problems (light leaks, lightmap
  density, too-dark or blown-out materials) with captures.

## Decision rules

- If an issue looks like lighting, check material values first (PBR scenes
  often point to the wrong cause).
- Alpha-tested foliage vs blended: measure; on many mobile GPUs alpha test
  defeats hidden-surface optimisations, while large blended areas cause
  overdraw. Choose per platform with numbers.
- Custom shading models (toon, stylised) are fine; document their rules as
  strictly as PBR's so assets stay consistent.

## Docs this work owes

New master material or shader → reference (parameters, permutations, cost,
platforms) and explanation of design choices. New look-dev procedure → how-to.
Changed material conventions → update reference and tell every role that
authors materials.

## Failure modes

- Baked lighting/AO in base colour; metal values in dirt or paint.
- sRGB flag on data maps; inverted normal green channel.
- One-off materials per asset; material count and draw calls explode.
- Shader variants multiplying build time and memory unnoticed.
- Judging a material only in one flattering light.
