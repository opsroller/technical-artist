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
| Check | Code review plus artist trial on real assets; up to 3 rounds with fixes; open blockers return "blocked". |
| Docs | Do: how-to (named for the goal) and reference (options, errors). Check: one kind per page, how-to followed literally. |

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | Returns `trial`, `nits`, `needsOtherRole`. |
| `blocked` | Returns `stage` and `open`. |
| `done-docs-unverified` | Docs check returned nothing. |
