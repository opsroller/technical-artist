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
| Check | Family and per-asset review against budgets and the asset checklist; the round-1 checker applies all manifest and provenance lines in one edit each; up to 3 review rounds with a single fix agent between them. Unchecked assets stay "unverified". |
| Docs | Do: write the planned Diataxis pages. Check: one kind per page, title patterns, links. |

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | Assets, manifest, provenance and docs complete. Returns `results`, `docs`. |
| `blocked` | Returns `stage` and `open` (or `blockers`) items; nothing should merge. |
| `done-docs-unverified` | Assets done; docs check returned nothing. |
