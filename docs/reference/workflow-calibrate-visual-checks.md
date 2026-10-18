# calibrate-visual-checks

*Reference, for users of the technical-artist plugin looking up the `calibrate-visual-checks` workflow.*

| Field | Value |
|---|---|
| Name | `calibrate-visual-checks` |
| Source | [`workflows/calibrate-visual-checks.js`](../../workflows/calibrate-visual-checks.js) |
| Does | Turn readability criteria into automated checks on rendered frames, calibrate each threshold on known-good and known-bad captures, confirm it on a holdout, and hand it off pushed and documented. |
| How-to | [How to calibrate visual acceptance checks](../how-to/how-to-calibrate-visual-acceptance-checks.md) |
| Skills | [visual-acceptance-checks](skill-visual-acceptance-checks.md), [lookdev-capture](skill-lookdev-capture.md), asset-provenance |

## Args

| Arg | Type | Required | Meaning |
|---|---|---|---|
| `criteria` | string | yes | Criteria ids or text, or where the visual target writes them. |
| `subjects` | string | yes | What must tell apart, e.g. the seven piece kinds on the board. |
| `existing` | string | no | An existing check script to re-calibrate. |
| `wp` | string | no | Work package id; puts `Refs:` in the PR and points `next` at deliver-package. |
| `branch` | string | no | Existing branch to work on. |
| `pr` | string | no | Existing PR to work on (its head branch). |

Missing required args return a usage string.

## Plan fields

| Field | Meaning |
|---|---|
| `checks[]` | `id`, `criterion`, `metric`, `mask`, `cvd` (colour-vision-deficiency model, or `none`) |
| `good`, `bad` | Labelled cases: accepted frames, and frames made from them with one fault each |
| `holdout` | One good and one bad case kept out of calibration |
| `tiers`, `capture`, `files`, `ci` | Tiers to run on; capture command; files; the CI command and who owns the pipeline change |
| `docKinds`, `blockers`, `caveats` | Doc plan; what stops the work (no criteria, no way to render); risks |

The run stops in Plan without criteria, without at least one good and one
bad case, without a two-case holdout, or when frames cannot be rendered.

## Phases

| Phase | What happens |
|---|---|
| Plan | Checks, labelled set, holdout, tiers, files, CI command, doc kinds. |
| Capture | Renders the good cases, makes the bad ones by script or changed setting, renders or derives the masks, verifies every frame. |
| Calibrate | Measures every case outside the holdout, sets each threshold between worst good and best bad with a margin (none where they overlap), writes the check, its threshold data and tests, runs the holdout and every tier. |
| Review | Independent, read-only attack: re-runs the check on every case and the holdout and tries the skill's failure modes. |
| Fix | Runs when Calibrate reported overlap, a wrong holdout or red tests, or the review found problems. Changes the mask, statistic or metric rather than the threshold alone. Anything still failing blocks. |
| Docs | Do: reference with every threshold and the numbers it came from, explanation, how-to. Independent check, then fix and recheck when needed. |
| Handoff | Pushes, opens or reuses a draft PR, runs the tests on the pushed head. |

Current art failing a calibrated check is reported in `notes` as a finding
for the art, never by moving the threshold.

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | Returns `checks`, `thresholds`, `holdout`, `perTier`, `command`, `ci`, `docs`, `undocumented`, `caveats`, `notes`, `handoff` and `next`. |
| `unverified` | As `done`, but the review or the docs check returned nothing. |
| `blocked` | Returns `stage` and `open`. |
| Usage string | `criteria` or `subjects` missing. |

## Handoff

`handoff` is the engineering-practices deliver-package `prior` object:
`from` (`technical-artist:calibrate-visual-checks`), `branch`, `pr`,
`head_sha`, `tests_pass` (`true`), `docs`, `undocumented`, `non_original`
and `notes`. `next` names deliver-package with `prior` when `wp` is given,
else land-pr.

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `plan`, `capture`, `calibrate`, `review`, `fix`, `docs:do`, `docs:check`, `docs:fix` and `docs:recheck` (when the check finds problems), `handoff`.

Independent steps: `review`, `docs:check`, `docs:recheck`. They review work this run produced, so in inline mode send each to a reviewer with no part in the work and name them in `run.reviewers`; a step you answer yourself is reported in `self_reviewed`.
