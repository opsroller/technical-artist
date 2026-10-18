# technical-artist

*Landing page, for anyone who wants to know what this role plugin does and where to start.*

The technical artist is the bridge between art and engineering for in-game 3D.
This Claude Code plugin gives you that role as an agent, ten skills and six
workflows: it makes authored and procedural assets, PBR materials and shaders,
supports look-dev with headless
before/after captures, turns readability criteria into calibrated checks, owns the asset pipeline (naming, import, validation,
manifest), sets and measures art budgets (triangles, texture memory, draw calls),
builds LODs, profiles what art costs, builds tools for artists, and records the
provenance of every asset. It is tool-agnostic: your project's `CLAUDE.md` and
profile say which engine and tools to use.

## Install

```
/plugin marketplace add opsroller/claude-plugins
/plugin install engineering-practices@opsroller
/plugin install technical-artist@opsroller
```

It builds on the `engineering-practices` plugin, so install both.

## Documentation

- **Start here.** [Build your first game-ready prop](docs/tutorials/first-task.md)
  walks through one asset from brief to validated, documented result.
- **Get a job done.** How-to guides for the common tasks:
  [make a set of game assets](docs/how-to/how-to-make-a-set-of-game-assets.md),
  [author a shader](docs/how-to/how-to-author-a-shader.md),
  [capture look-dev frames before and after a change](docs/how-to/how-to-capture-look-dev-frames-before-and-after.md),
  [calibrate visual acceptance checks](docs/how-to/how-to-calibrate-visual-acceptance-checks.md),
  [cut art cost in a slow scene](docs/how-to/how-to-cut-art-cost-in-a-slow-scene.md),
  [automate a repetitive art task](docs/how-to/how-to-automate-a-repetitive-art-task.md),
  [set art budgets](docs/how-to/how-to-set-art-budgets.md),
  [define a visual target and quality tiers](docs/how-to/how-to-define-a-visual-target-and-quality-tiers.md),
  [bring in a third-party asset](docs/how-to/how-to-bring-in-a-third-party-asset.md).
- **Look something up.** The [reference index](docs/reference/index.md) covers
  the agent, every skill and workflow (args, phases, outputs) and the plugin
  manifest. Research sources are in [SOURCES.md](SOURCES.md).
- **Understand the role.** [About the technical artist role](docs/explanation/about-the-role.md)
  explains the job, its boundaries with neighbouring roles, and why it measures,
  prefers generators and records provenance.

## License

Copyright (C) 2026 Charles (opsroller) and contributors. Licensed under the GNU General Public License v2.0 or later (`GPL-2.0-or-later`); see `LICENSE`.
