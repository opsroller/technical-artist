# About the technical artist role

*Explanation, for anyone deciding when to call on the technical artist, or wondering why the role works the way it does.*

## A bridge, not a half-artist

Studios describe the technical artist the same way across very different games:
the person who sits between art and programming so that art content gets into
the game respecting both the artistic vision and the technical limits. Job
postings from large and small studios list the same core: shaders and
materials, the asset pipeline and its tools, performance and validation of
assets, and guidance to artists on production standards. Many add procedural
content, effects, rigging or look-dev; the role bends toward what a team lacks.

That last point matters. The GDC Technical Artist Bootcamps have said for over a
decade that the role varies by studio and that adaptability matters more than
covering everything. This plugin therefore keeps the core small and sharp
(assets, materials, budgets, pipeline, tools, provenance) and lets each project's
profile say which engine, tools and conventions apply.

## Why measure everything

Art cost is invisible until a build runs badly on the weakest device. Forum
threads full of reference figures (draw calls in one game, triangles in another)
end with the same advice: the right answer depends on your game, so measure on
target hardware and track it as assets arrive. The role's habit of reporting
measured numbers against a written budget is what turns "it feels slow" into a
decision someone can make. It also keeps the role honest: a fix that does not
move a measurement is not a fix.

Budgets are written per class of asset (characters, props, kit pieces) rather
than per asset because the scene total is what the frame pays for. One asset
over its number is acceptable if the scene meets its goal and the exception is
recorded; a hundred assets each "only slightly" over is how projects miss
their frame.

## Why physically based materials

PBR is less about realism than about consistency. When base colour carries no
lighting and values stay in plausible ranges, assets made by different people
(or different agents) match under every lighting condition, and lighting
problems can be told apart from material problems. Stylised games often keep the
same discipline with their own rules for the same reason. The value ranges in
the plugin come from widely taught guides; a project's calibrated values
override them.

## Why prefer generators and automation

A generator turns an asset into a recipe: change a parameter, rebuild the family.
It also makes provenance provable, because the recipe, its version and its seed
are the asset's history. The trade-off is real: generators take time to build,
create plateaus where nothing visible ships, and concentrate knowledge in their
author. Practitioners who built large procedural worlds advise small tools with
clear inputs and outputs, artist-facing parameters, and spreading the knowledge.
The plugin follows that advice and keeps hand-authoring for hero pieces.

The same logic drives pipeline automation: a rule a person must remember will be
broken, so naming, import settings and budgets are enforced by a validator with
messages an artist can act on.

## Why provenance is part of the craft

A game can be pulled from a store for one asset it had no right to ship. Recording
origin, author, licence and recipe when an asset is created costs minutes;
reconstructing it later can be impossible. Generated and AI-assisted content
makes this more important, not less, because the inputs are easy to forget.

## Boundaries with neighbouring roles

- **graphics-programmer**: owns rendering features and engine-side frame time.
  Quality tiers sit on the seam: the technical artist sets the visual target
  (the look per tier and what must stay readable), the graphics programmer
  decides which renderer and features deliver it within the frame budget.
  The `visual-target` workflow hands that question over in its own step,
  in the same shape the graphics programmer's `renderer-decision` workflow
  answers it, so the hand-off is explicit rather than assumed.
  The technical artist owns content cost and hands engine-side causes over
  with a capture.
- **game-designer**: decides what objects must communicate; the technical artist
  makes them read that way from the gameplay camera.
- **gameplay-programmer**: owns game logic; agrees collision accuracy and any
  runtime procedural generation.
- **graphic-designer**: owns 2D identity, icons, store and UI visuals; may ask
  for 3D renders.
- **devops-engineer**: runs the technical artist's validator in CI and owns licence
  compliance automation.
- **ui-developer** and **sound-designer**: separate crafts; the technical artist
  only supplies assets or data they request.

## How the role grows

- **Junior**: builds assets to the conventions, follows the checklists, fixes
  validation errors, writes small scripts.
- **Mid-level**: writes shaders and generators, profiles scenes, owns part of the
  pipeline, supports artists day to day.
- **Senior**: sets conventions and budgets, designs pipelines and tools as real
  software (reviewed, tested, supported), mentors, decides what to adopt.
- **Principal / technical art director**: sets standards for a whole team or
  studio, steers new technology and platforms, often works removed from making
  assets directly, and is judged by how well others' art ships.

## Trade-offs this plugin makes

- It prefers reproducibility over speed of a single asset: a few extra minutes
  to make an asset regenerable pays back at the first budget change.
- It keeps tool names out of the role. That costs some precision but means the
  same role works on any engine or DCC; the project profile supplies the names.
- It puts documentation inside every job. Docs written after the fact rarely
  get written; artists use tools whose how-to exists.

See the [reference index](../reference/index.md) for the agent, skills and
workflows, and [SOURCES.md](../../SOURCES.md) for the research behind this page.
