# visual-target

*Reference, for users of the technical-artist plugin looking up the `visual-target` workflow.*

| Field | Value |
|---|---|
| Name | `visual-target` |
| Source | [`workflows/visual-target.js`](../../workflows/visual-target.js) |
| Does | Define the visual target before production: research engine and hardware, get the renderer decision from the graphics-programmer, set tiers, art budgets and readability criteria, review, propose work packages, document. |
| How-to | [How to define a visual target and quality tiers](../how-to/how-to-define-a-visual-target-and-quality-tiers.md) |

## Args

| Arg | Type | Required | Meaning |
|---|---|---|---|
| `scope` | string | yes | What the target is for: the whole game, a mode, a level set. |
| `look` | string | no | Art direction and references, or where they are. Found in the project when omitted. |
| `tiers` | string | no | Wanted tiers and devices, or where they are. Taken from the project profile when omitted. |
| `renderer` | string or object | no | An existing renderer decision, or the docs page that holds it. Skips the hand-off. |

Missing `scope` returns a usage string.

Example:

```
visual-target  args: { scope: "the whole game", look: "docs/explanation/art-direction.md", tiers: "desktop high, mobile, web" }
```

## Phases

| Phase | Agents | Edits files | What happens |
|---|---|---|---|
| Plan | 1 | no | Inputs (art direction, camera, smallest screen, platforms, readability needs), what already exists, engine, doc kinds. |
| Research | 3, parallel | no | `engine`: rendering paths and features per platform, from the engine's docs. `hardware`: weakest devices and a tier proposal. `look`: pillars, features the look needs, what must read. Failed areas are listed in `unresearched`. |
| Renderer | 1 | no | Hand-off. Runs `/graphics-programmer:renderer-decision` when available, otherwise asks the graphics-programmer and stops with `waiting-on-graphics-programmer`. With `renderer` given, reads that decision instead. Never decides the renderer itself. |
| Tiers | 1 | no | Per tier: weakest device, fps, frame budget (ms, CPU/GPU split, headroom), resolution and render scale, look. Feature matrix from the decision, always with a 3D render scale row (UI stays at output resolution) and a decals row (count and fade distance); a row the decision does not cover is marked not decided. Art budgets per tier, including decal counts; unmeasured numbers labelled as estimates. |
| Readability | 1 | no | Acceptance criteria, each with `id`, tiers, a check and a pass threshold; frame-time criteria per tier. |
| Review | 1 to 3 | no | `review:1` checks the matrix against the decision and for the render scale and decals rows, budgets against frame budgets, fallbacks, testable criteria. Problems get one `revise:1` and a `review:2`. |
| Packages | 1 | the work-package plan, if the profile allows | Follow-up packages with role and testable done-when; written to the plan or sent to the project-manager. |
| Docs | 2 | yes | Do: reference ("Visual target and quality tiers"), explanation ("About the visual target"), a how-to if the check will be repeated. Check: one kind per page. |

## Renderer hand-off shape

The Renderer step answers in the same shape as the graphics-programmer
`renderer-decision` workflow's `decision`, so its result can be passed
straight back as the `renderer` arg.

| Field | Type | Meaning |
|---|---|---|
| `status` | `"decided"` or `"pending"` | `pending` while the graphics-programmer has not decided |
| `renderer` | string | Rendering path or backend per tier |
| `features[]` | array | `feature`, `perTier`, `costMs`, `evidence`, `fallback` |
| `constraints` | string[] | What art must respect |
| `openQuestions` | string[] | What was asked, when pending |

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | Returns `tiers`, `matrix`, `artBudgets`, `criteria`, `renderer`, `packages`, `packagesWhere`, `unresearched` (empty), `docProblems` (empty), and `next`. |
| `waiting-on-graphics-programmer` | Returns `question`, `openQuestions` and `resume`: run again with `renderer` set to their decision; `run.results` from this run may be passed too. |
| `blocked` | Plan blockers, a step returned nothing, review problems after one revision (`open`), or doc problems. |
| `unverified` | Done, but a research area returned nothing (`unresearched`), or the review returned nothing. |
| `done-docs-unverified` | Docs check returned nothing. |

The workflow writes docs and plan rows to the working tree but does not commit, push or open a PR. The final result carries `next`, saying to ship them with `/engineering-practices:deliver-package` or `/engineering-practices:small-change`.

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `plan`, `research:<area>` (`research:engine`, `research:hardware`, `research:look`), `renderer` (`renderer:given` when the `renderer` arg is passed, so a stored pending answer is not reused), `tiers`, `readability`, `review:1`, `revise:1`, `review:2`, `packages`, `docs:do`, `docs:check`, `docs:fix` and `docs:recheck` (when the check finds problems).

Independent steps: `review:1`, `review:2`, `docs:check`, `docs:recheck`. They review work this run produced, so in inline mode send each to a reviewer with no part in the work and name them in `run.reviewers`; a step you answer yourself is reported in `self_reviewed`.
