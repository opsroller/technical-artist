# Build your first game-ready prop with the technical artist

*Tutorial, for someone new to this plugin who wants to see the technical-artist role produce one asset end to end.*

In this tutorial we will ask the technical artist to make one simple prop, a
wooden crate, by generator script, and take it all the way to a validated,
budgeted, documented asset in a project. We use one fixed path: procedural, one
asset, the `technical-artist` agent.

## Before we start

We need:

- Claude Code with this plugin and `engineering-practices` installed
  (see the [README](../../README.md)).
- A game project whose `CLAUDE.md` or profile names a 3D tool that can run
  headless, an asset folder, a manifest and a provenance log. If your project has
  none of these yet, the agent will say so in step 1; that is expected output
  too.

## 1. Let the role onboard

Ask Claude:

> Use the technical-artist agent. Read the project profile and tell me the
> conventions and budgets you would use for a small prop.

The agent first loads `engineering-practices` and runs `project-onboarding`.
The answer should list scale and up axis, pivot rule, naming pattern, texel
density, export format, the asset folder, the manifest and provenance log
paths, and a budget class for small props.

Notice that if budgets are missing it proposes some and marks them as a
**proposal**. Accept them for now; we will see them land as reference docs.

## 2. Ask for the crate

> Make `SM_Crate_01`: a wooden crate, about 1 m cube, breakable, must read as a
> container from the gameplay camera. Make it with a generator so we can make
> variants later.

The agent follows `procedural-assets` and `realtime-asset-authoring`. Expect
it to report, in this order:

1. A blockout check in the gameplay view (silhouette and size).
2. A generator script, e.g. `GEN_Crate`, with parameters such as size, plank
   count and wear, and a fixed seed.
3. The exported mesh, its texture set (`T_Crate_01_BC`, `_N`, `_ORM`) and a
   material instance.

## 3. Read the numbers

The agent's report should include measured numbers like:

```
SM_Crate_01  LOD0 312 tris  LOD1 160  LOD2 64
texture set  1024 px, ~2.7 MB resident with mips
materials    1 (instance of the shared prop material)
budget       small prop: within
```

Your numbers will differ. Notice that every number is measured, and compared
with the budget class from step 1.

## 4. Watch validation and provenance

The agent runs the project validator and adds two things in the same change:

- a manifest entry with the logical name `SM_Crate_01`,
- a provenance record naming `GEN_Crate`, its version, parameters and seed.

Let's check: open the provenance log and find the crate's record. It should
say `origin: generated`.

## 5. See the docs it wrote

The last step of every job is documentation. Expect at least:

- a **reference** page for the generator (parameters, command, outputs),
- a **how-to** for making a crate variant,
- if budgets were new, a **reference** budget table and an **explanation** of
  how they were chosen.

## 6. Make a variant

> Make `SM_Crate_Broken` from the same generator.

This should take one short step: new parameters, new seed, new manifest and
provenance lines. That is the payoff of building the first one as a generator.

## What we did

We took one prop from brief to a validated, measured, recorded and documented
asset, and made a variant cheaply. Next:

- For a whole set at once, see [How to make a set of game assets](../how-to/how-to-make-a-set-of-game-assets.md).
- For why the role works this way, read [About the technical artist role](../explanation/about-the-role.md).
