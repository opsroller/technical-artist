# art-performance-audit

*Reference, for users of the technical-artist plugin looking up the `art-performance-audit` workflow.*

| Field | Value |
|---|---|
| Name | `art-performance-audit` |
| Source | [`workflows/art-performance-audit.js`](../../workflows/art-performance-audit.js) |
| Does | Profile art cost in one scene on a target tier, analyse by category in parallel, fix content-side causes, re-measure and document. |
| How-to | [How to cut art cost in a slow scene](../how-to/how-to-cut-art-cost-in-a-slow-scene.md) |

## Args

| Arg | Type | Required | Meaning |
|---|---|---|---|
| `scene` | string | yes | Level or scene to audit. |
| `tier` | string | yes | Lowest target tier to measure on. |
| `fix` | boolean | no | Default true. false = analyse only, no file changes. |

Missing required args return a usage string.

Example:

```
art-performance-audit  args: { scene: "harbour district", tier: "low mobile", fix: false }
```

## Phases

| Phase | What happens |
|---|---|
| Plan | Baseline captures, limiting bound, applicable budgets (or "missing"), doc kinds via the compass. |
| Analyse | Four read-only agents in parallel: geometry, draw calls, pixels, memory. Failed categories are reported in `unanalysed`. |
| Fix | One agent applies technical-artist-owned fixes, highest gain first; writes hand-off notes for the graphics-programmer. |
| Check | Re-measure with the baseline method; regressions block. |
| Docs | Do: budgets and procedures as Diataxis pages. Check: one kind per page. |

## Outputs (`status`)

| Status | Meaning |
|---|---|
| `done` | Returns `baseline`, `after`, `withinBudget`, `remaining`, `unanalysed`, `docProblems`. |
| `blocked` | Regressions or doc problems; see `open` / `docProblems`. |
| `unverified` | Re-measure failed; fixes not verified. |
| `done-docs-unverified` | Docs check returned nothing. |
