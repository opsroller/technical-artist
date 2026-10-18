# artist-tool

*Reference, for users of the technical-artist plugin looking up the `artist-tool` workflow.*

| Field | Value |
|---|---|
| Name | `artist-tool` |
| Source | [`workflows/artist-tool.js`](../../workflows/artist-tool.js) |
| Does | Turn a slow or error-prone art workflow step into a small, tested, documented tool, import rule or validator check. |
| How-to | [How to automate a repetitive art task](../how-to/how-to-automate-a-repetitive-art-task.md) |

## Args

| Arg | Type | Required | Meaning |
|---|---|---|---|
| `problem` | string | yes | What hurts, for whom. |
| `users` | string | no | Who uses the result. |
| `kind` | "tool" | "import-rule" | "validator-rule" | no | Default "tool". |

Missing required args return a usage string.

Example:

```
artist-tool  args: { problem: "normal maps keep getting imported as sRGB", users: "environment artists", kind: "validator-rule" }
```

## Phases

| Phase | What happens |
|---|---|
| Plan | Brief, approach, files, known-good and known-bad test assets, doc kinds via the compass. |
| Do | Build with tests. |
| Check | Code review plus artist trial on real assets; up to 3 rounds with fixes; open blockers return "blocked". Then one step applies the reviewer's small, plainly correct nits, re-runs the tests (reverting any nit that breaks them) and carries the rest. |
| Docs | Do: how-to (named for the goal) and reference (options, errors). Check: one kind per page, how-to followed literally. Up to three independent checks and two fixes; each re-check confirms the last check's problems and anything the fix left; a problem still open after the last check returns "blocked". |

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | Returns `trial`, `nits` (the ones not applied, with why), `needsOtherRole`. |
| `blocked` | Returns `stage` (`plan`, `do`, `check`, `nits`, `docs`) and `open`. |
| `done-docs-unverified` | Docs check returned nothing. |

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `brief`, `build`, `review:<round>`, `fix:<round>`, `docs:do`, `docs:check`, `docs:fix` and `docs:recheck` (when the check finds problems).

Independent steps: `review:<round>`, `docs:check`, `docs:recheck`. They review work this run produced, so in inline mode send each to a reviewer with no part in the work and name them in `run.reviewers`; a step you answer yourself is reported in `self_reviewed`.
