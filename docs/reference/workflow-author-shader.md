# author-shader

*Reference, for users of the technical-artist plugin looking up the `author-shader` workflow.*

| Field | Value |
|---|---|
| Name | `author-shader` |
| Source | [`workflows/author-shader.js`](../../workflows/author-shader.js) |
| Does | Author or rework one shader and the materials that use it, from an effect brief to a pushed, documented handoff, with look-dev frames before and after and independent reviews. |
| How-to | [How to author a shader](../how-to/how-to-author-a-shader.md) |
| Skills | [materials-shaders](skill-materials-shaders.md), [lookdev-capture](skill-lookdev-capture.md), art-budgets-profiling, asset-provenance |

## Args

| Arg | Type | Required | Meaning |
|---|---|---|---|
| `shader` | string | yes | Shader name, by the project's naming pattern. |
| `brief` | string | yes | What it must look like, where it is used, what it must communicate. |
| `replaces` | string | no | An existing shader or material it replaces or reworks. |
| `wp` | string | no | Work package id; puts `Refs:` in the PR and points `next` at deliver-package. |
| `branch` | string | no | Existing branch to work on. |
| `pr` | string | no | Existing PR to work on (its head branch). |
| `ci_pending` | string[] | no | Resume after CI: the `pending_ci` list from an earlier result (`"<target>: pending-ci <CI job>"`). Needs `pr` or `branch`; `brief` is then optional. Runs only the CI phase. |
| `wp` with `ci_pending` | string | no | Carried from the first run's `next`: the resume's `done` then names deliver-package. |
| `docs`, `undocumented`, `notes`, `non_original` | string[] | no | Resume only, carried from the first run's `next`; they go into the resume's `handoff`. Without `docs`, `ci:read` takes the pages the PR body lists. |

Missing required args (`shader`, and `brief` unless `ci_pending` is given; `pr` or `branch` with `ci_pending`) return a usage string.

## Plan fields

| Field | Meaning |
|---|---|
| `effect` | The effect written down: reference, response to light and view, what it communicates |
| `coverage` | Where it is used, maximum screen coverage, opaque, alpha-tested or blended |
| `standard` | Why the shared material cannot do it, or which shared shader or include it extends |
| `ci_only` | Targets this machine cannot compile for (a platform-only toolchain, e.g. Metal from a Linux host), each with the CI job that compiles it |
| `targets`, `tiers`, `fallbacks` | Renderers and platforms; technique per tier (from the renderer decision, which the graphics-programmer owns); what renders where the full effect does not |
| `permutations` | Static switches and compiled variant count |
| `parameters` | Artist parameters with name, range and default |
| `budget` | Cost limit on the lowest tier that uses it, how it is measured, the frame or scene budget it is a share of, and that budget's owner |
| `files`, `lookdev`, `ambiguous`, `docKinds`, `blockers`, `caveats` | Files it may write; frames; `lookdev.command` and `lookdev.commandFound` (whether the project already has a capture command; when not, the Before step builds one from the lookdev-capture generic recipe, and `possible: false` marks the capture pending when none can be built); `lookdev.overlays`, `lookdev.hook` (the project's capture hook for capture mode: flag, environment variable or override file) and `lookdev.hookProposal` (with no hook, the small separate change that adds one and who owns that code; shipping configuration is never hand-edited); defaults taken; doc plan; what stops it; risks |

## Phases

| Phase | What happens |
|---|---|
| Plan | Writes the effect down and plans everything above. A missing renderer or tier decision is a blocker. |
| Before | Captures the look-dev frames on the current state, in capture mode through the project's capture hook; frames that still show an overlay are left out and named in `notes`. With no project capture command, builds one from the lookdev-capture generic recipe and returns it as `command` for the After step. Skipped, with the capture noted as pending and why, when capture is not possible. |
| Build | Shader, material instances, tier techniques and fallbacks; compiles on every target it can reach; measures cost and the same measurement on the base commit (`baseline`); counts variants; commits. Each target reports `ok`, `error <message>` or `pending-ci <CI job>`. An error stops the run. A target only CI can compile, with a named job that does, is `pending-ci` and the run goes on. A target with no CI job to prove it is an error. |
| After | Captures the same frames with the new shader, with the Before step's command. |
| Review | Four parallel independent, read-only reviews: `look` (frames against the effect and readability), `cost` (budget, pixel work, variants; over budget only because the baseline already was, with the shader's delta within its share, is a note, not a problem), `platforms` (targets, tiers, fallbacks), `params` (artist parameters across their range, material conventions). |
| Fix | Runs only when a review found problems: one agent fixes them, recompiles, re-measures and re-captures. Anything still failing blocks. A cost finding where the baseline (before) measurement already exceeds the budget and the shader's own delta is within its share is returned in `baseline_over`, not as failing: it becomes a known risk owned by the budget owner. |
| Docs | Do: reference (parameters, permutations, tiers, fallbacks, cost) and the planned pages. Independent check, then fix and recheck when needed. |
| Handoff | Pushes, opens or reuses a draft PR, runs tests and the validator on the pushed head. With pending targets, the PR gets a "Pending CI" section saying they are confirmed only when those jobs pass, before merge. |
| CI | Only with `ci_pending`. `ci:read` reads each named job's latest run on the head: `pass`, `fail` (with the compiler errors) or `not-run`. `ci:fix` runs when a target failed: fixes from the log, commits and pushes. |

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | From a full run, returns `shader`, `measured`, `variants`, `ambiguous`, `findingsFixed`, `before`, `after`, `docs`, `undocumented`, `caveats`, `knownRisks` (budgets already over before this shader, owned by the budget owner; also in the PR's "Known risks" section and the handoff `notes`), `captureHookProposal` (the proposed capture hook change, or empty), `notes`, `handoff` and `next`. |
| `pending_ci` | As `done`, plus `pending_ci` (targets only CI proves), but with **no `handoff`**: nothing ships until CI confirms them. `next` is the `ci_pending` resume, with `pr` or `branch`, `wp`, `docs`, `undocumented`, `notes` and `non_original` carried in its args. From the CI phase: `pending_ci` still to prove (not run yet, or fixed and needing a new run on the new head), `confirmed`, `fixed`, `head_sha`, `notes`, `next` (the resume again), and no `handoff`. |
| `unverified` | As `done`, but a review (`unverifiedReviews`) or the docs check returned nothing. |
| `blocked` | Returns `stage` and `open` (`stage: "ci"` when a CI fix failed or CI could not be read). |
| `done` (CI phase) | Every pending target passed on the head `ci:read` read: `confirmed`, `head_sha`, `notes`, a fresh `handoff` for that head, and `next` (deliver-package with `prior` when `wp` is carried, else land-pr). |
| Usage string | `shader` or `brief` missing. |

## Handoff

`handoff` is the engineering-practices deliver-package `prior` object:
`from` (`technical-artist:author-shader`), `branch`, `pr`, `head_sha`,
`tests_pass` (`true`), `docs`, `undocumented`, `non_original` and `notes`.
`next` names deliver-package with `prior` when `wp` is given, else land-pr.
A `pending_ci` result has no `handoff`. The CI phase's `done` builds one on
the head it read (`ci:read`'s `head_sha`; after a `ci:fix` push the run
returns `pending_ci` for the new head), from the carried `docs`,
`undocumented`, `non_original` and `notes`, plus a "confirmed in CI" note.

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `plan`, `capture:before`, `build`, `capture:after`, `review:look`, `review:cost`, `review:platforms`, `review:params`, `fix`, `docs:do`, `docs:check`, `docs:fix` and `docs:recheck` (when the check finds problems), `handoff`; with `ci_pending`, `ci:read` and `ci:fix` (when a target failed).

Independent steps: the four `review:` steps, `docs:check`, `docs:recheck`. They review work this run produced, so in inline mode send each to a reviewer with no part in the work and name them in `run.reviewers`; a step you answer yourself is reported in `self_reviewed`.
