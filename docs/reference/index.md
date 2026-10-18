# Technical artist reference

*Reference landing page, for users of the technical-artist plugin who need exact facts about its parts.*

The plugin has one agent, ten skills and six workflows. Each page below
uses the same layout so you can find fields in the same place.

## The agent

- [technical-artist](agent.md): responsibilities, working steps, the "Never" list and boundaries.

## Skills that make assets

- [realtime-asset-authoring](skill-realtime-asset-authoring.md): hand-made models to real-time standards.
- [procedural-assets](skill-procedural-assets.md): generators and reproducible variants.
- [materials-shaders](skill-materials-shaders.md): PBR materials, shaders and look-dev.
- [lookdev-capture](skill-lookdev-capture.md): headless before/after frames per renderer or tier.
- [visual-acceptance-checks](skill-visual-acceptance-checks.md): readability criteria as calibrated checks on frames.

## Skills that keep art affordable

- [art-budgets-profiling](skill-art-budgets-profiling.md): setting budgets and measuring cost.
- [lods-optimization](skill-lods-optimization.md): LODs and cost reduction.

## Skills that keep the pipeline sound

- [asset-pipeline](skill-asset-pipeline.md): naming, import, validation, manifest.
- [artist-tools](skill-artist-tools.md): tools that remove slow or error-prone steps.
- [asset-provenance](skill-asset-provenance.md): origin, licence and recipe of every asset.

## Workflows

- [asset-batch](workflow-asset-batch.md): make, check, look-dev and hand off a set of assets, texture sets or materials.
- [author-shader](workflow-author-shader.md): build, review and hand off one shader and its materials.
- [calibrate-visual-checks](workflow-calibrate-visual-checks.md): calibrate readability, contrast and colour-blind checks on captures.
- [art-performance-audit](workflow-art-performance-audit.md): find and cut art cost in a scene.
- [artist-tool](workflow-artist-tool.md): turn a pain point into a tested, documented tool.
- [visual-target](workflow-visual-target.md): set the visual target, quality tiers and readability criteria before production.

## Plugin manifest

`.claude-plugin/plugin.json` fields:

| Field | Value |
|---|---|
| `name` | `technical-artist` |
| `version` | `0.8.0` |
| `description` | One-sentence role summary |
| `author.name` | `opsroller` |
| `repository` | `https://github.com/opsroller/technical-artist` |
| `license` | `GPL-2.0-or-later` |
| `keywords` | `role`, `job-function`, and topic keywords |

## Sources

The research behind the plugin is listed in [SOURCES.md](../../SOURCES.md).
