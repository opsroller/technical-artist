# asset-batch

*Reference, for users of the technical-artist plugin looking up the `asset-batch` workflow.*

| Field | Value |
|---|---|
| Name | `asset-batch` |
| Source | [`workflows/asset-batch.js`](../../workflows/asset-batch.js) |
| Does | Plan, make in parallel (authored or procedural), validate and document a set of in-game 3D assets. |
| How-to | [How to make a set of game assets](../how-to/how-to-make-a-set-of-game-assets.md) |

## Args

| Arg | Type | Required | Meaning |
|---|---|---|---|
| `assets` | array of `{ name, brief }` | yes | Logical asset names and what each must communicate. |
| `family` | string | no | What ties the set together; used in reviews and docs. |

Missing required args return a usage string.

Example:

```
asset-batch  args: { family: "dockside props", assets: [{ name: "SM_Crate_01", brief: "wooden crate, breakable, reads as a container" }] }
```

## Phases

| Phase | What happens |
|---|---|
| Plan | Conventions, budget class and numbers per asset, authored vs procedural, a separate output directory per asset, doc kinds via the compass. |
| Make | One agent per asset. Writes only its own output directory; returns manifest lines and a provenance record. Never edits shared files. |
| Check | An `apply` step writes all manifest and provenance lines in one edit each; then a read-only family and per-asset review against budgets and the asset checklist (including those entries); up to 3 review rounds with a single fix agent between them. Unchecked assets stay "unverified". |
| Docs | Do: write the planned Diataxis pages. Check: one kind per page, title patterns, links. |

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | Assets, manifest, provenance and docs complete. Returns `results`, `docs`. |
| `blocked` | Returns `stage` and `open` (or `blockers`) items; nothing should merge. |
| `done-docs-unverified` | Assets done; docs check returned nothing. |

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `plan`, `make:<asset>` (one per asset), `apply`, `check:<round>`, `fix:<round>`, `docs:do`, `docs:check`, `docs:fix` and `docs:recheck` (only when the docs check finds problems).

Independent steps: `check:<round>`, `docs:check`, `docs:recheck`; each is read-only. They review work this run produced, so in inline mode send each to a reviewer with no part in the work and name them in `run.reviewers`; a step you answer yourself is reported in `self_reviewed`.
