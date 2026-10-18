# asset-batch

*Reference, for users of the technical-artist plugin looking up the `asset-batch` workflow.*

| Field | Value |
|---|---|
| Name | `asset-batch` |
| Source | [`workflows/asset-batch.js`](../../workflows/asset-batch.js) |
| Does | Plan, make (one asset or one generator run per make unit), check, look-dev before and after, document and hand off a set of in-game 3D assets: models, texture sets, materials. |
| How-to | [How to make a set of game assets](../how-to/how-to-make-a-set-of-game-assets.md) |
| Skills | realtime-asset-authoring, procedural-assets, materials-shaders, [lookdev-capture](skill-lookdev-capture.md), lods-optimization, art-budgets-profiling, asset-pipeline, asset-provenance |

## Args

| Arg | Type | Required | Meaning |
|---|---|---|---|
| `assets` | array of `{ name, brief, kind? }` | yes | Logical asset names and what each must communicate. `kind`: `mesh`, `texture-set`, `material` or `shader-material`. |
| `family` | string | no | What ties the set together; used in reviews and docs. |
| `generator` | string | no | An existing generator script that makes the batch; planned as one generator-run unit. |
| `capture` | boolean | no | `false` skips the look-dev captures. Default: capture when the project can render headless. |
| `wp` | string | no | Work package id; puts `Refs:` in the PR and points `next` at deliver-package. |
| `branch` | string | no | Existing branch to work on. |
| `pr` | string | no | Existing PR to work on (its head branch). |

Missing required args return a usage string.

Example:

```
asset-batch  args: { family: "temple board", wp: "WP-48",
  generator: "tools/assets/gen_theme_textures.py",
  assets: [
    { name: "T_Stone", brief: "carved stone tiles, matte, must sit behind the pieces", kind: "texture-set" },
    { name: "MI_Gold", brief: "gold piece, must read as gold in greyscale too", kind: "material" }
  ] }
```

## Make units

The plan splits the batch into make units, one agent each:

| `method` | Unit | Writes |
|---|---|---|
| `authored` | One hand-made asset | Its own output paths |
| `procedural` | One generated asset | Its generator, inputs and outputs |
| `generator-run` | One generator run that writes several assets (texture sets, materials) | The generator, its inputs and every output it writes |

No two units may write the same path; overlapping `writes` stop the run in
Plan. Every asset in `assets` must belong to a unit.

## Plan fields

| Field | Meaning |
|---|---|
| `units[]` | `id`, `method`, `assets`, `kind`, `budget`, `writes`, `command` (regenerates every output), `tierVariants`, `notes` |
| `tiers` | Quality tiers from the project's visual target, lowest first; empty if none |
| `generatedOutputs` | `commit`: generated files are committed. `build`: only the generator and inputs are committed; the build makes the outputs and version control ignores them. From the project rule, else `build` for large or binary outputs. |
| `lookdev` | `possible`, `frames` (scene / camera / renderer or tier), `command`, `outDir`, `why` |
| `docKinds`, `blockers`, `caveats` | Doc plan; what stops the work; risks that do not |

## Phases

| Phase | What happens |
|---|---|
| Plan | Conventions, make units with disjoint owned paths, budgets, tiers and tier variants, generated-output policy, look-dev frames, doc kinds. |
| Before | Captures the look-dev frames on the current state, with greyscale copies. Skipped when capture is off or not possible. |
| Make | One agent per make unit. Writes only its own paths; generated units run their command twice and report whether outputs are byte-identical. Returns manifest lines, provenance records and non-original items. |
| Check | `apply` writes all manifest and provenance lines once. Then an independent, read-only check per round: budgets, asset checklist, family consistency, the texture and material rules below, regeneration and the generated-output policy. Up to 3 rounds with a fix step between. |
| After | Captures the same frames again; an independent `look` review compares before and after against the briefs and readability criteria. One `look-fix` and re-capture round when it finds problems. |
| Docs | Do: write the planned Diataxis pages. Independent check: one kind per page, title patterns, links; a fix and recheck when it finds problems. |
| Handoff | Commits by the generated-output policy, pushes, opens or reuses a draft PR, runs tests and the validator on the pushed head. |

## Texture and material rules

Applied by every make unit and every check round:

| Rule | Check |
|---|---|
| Colour space | Base colour and emissive sRGB; normal, roughness, metallic, AO, height and packed maps linear; read from import settings or the material. |
| PBR values | Measured by script over the outputs: dielectric base colour in range, raw metal bright, metallic binary, roughness not constant, no baked light or AO in base colour, engine normal convention, constant maps replaced by parameters. |
| Tier variants | Every higher-tier variant has a base variant every target loads; lower-tier exports leave higher-tier files out; texture memory per tier within budget. |

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | Returns `results`, `tiers`, `generatedOutputs`, `before`, `after`, `docs`, `undocumented`, `caveats`, `notes`, `handoff` and `next`. |
| `done-docs-unverified` | As `done`, but the docs check returned nothing. |
| `blocked` | Returns `stage` (`plan`, `make`, `check`, `after`, `docs` or `handoff`) and `open` (or `blockers`). |

`notes` collects what is informational: frames not captured and why,
a generator that did not regenerate byte-identically, look review notes.

## Handoff

`handoff` is the engineering-practices deliver-package `prior` object:

| Field | Value |
|---|---|
| `from` | `technical-artist:asset-batch` |
| `branch`, `pr`, `head_sha` | The pushed branch, its PR and head commit |
| `tests_pass` | `true` (the run stops as `blocked` otherwise) |
| `docs`, `undocumented` | Pages written; changes left undocumented and why |
| `non_original` | Third-party items the make units used |
| `notes` | Caveats and notes, never blocking |

`next` says what to run: deliver-package with `prior` set to this result
when `wp` is given, else land-pr.

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `plan`, `capture:before`, `make:<unit id>` (one per make unit), `apply`, `check:<round>`, `fix:<round>`, `capture:after:<round>`, `look:<round>`, `look-fix:<round>`, `docs:do`, `docs:check`, `docs:fix` and `docs:recheck` (when the check finds problems), `handoff`.

Independent steps: `check:<round>`, `look:<round>`, `docs:check`, `docs:recheck`. They review work this run produced, so in inline mode send each to a reviewer with no part in the work and name them in `run.reviewers`; a step you answer yourself is reported in `self_reviewed`.
