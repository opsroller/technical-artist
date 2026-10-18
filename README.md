# Technical Artist

Technical artist: creates original 3D models, materials, textures and shaders, preferably by script, and runs the asset pipeline into the engine.

This plugin is a **job function**, not a project. It says how the job is done; the project it works on says with which tools, in its `CLAUDE.md` and project profile.

## Skills

| Skill | Use when |
|---|---|
| `procedural-assets` | Use when creating a model or texture, especially by script. |
| `materials-shaders` | Use when creating or tuning a material or shader. |
| `asset-pipeline` | Use when adding, renaming or budgeting assets, or wiring them into the game. |

## Workflows

Multi-agent workflows (Claude Code Workflow scripts in `workflows/`).

| Workflow | Does |
|---|---|
| `/technical-artist:asset-batch` | Generate a set of original assets in parallel by script, then check readability, budgets and provenance |

## Agent

`agents/technical-artist.md` defines the role as a subagent.

## Install

```
/plugin marketplace add opsroller/claude-plugins
/plugin install technical-artist@opsroller
```

Versioned on its own with semver tags (`v0.1.0`). Changes follow Conventional Commits.
