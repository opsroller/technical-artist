# How to cut art cost in a slow scene

*How-to guide, for anyone whose scene misses its frame-time, memory or load target and suspects the art.*

This guide shows you how to find and fix content-side cost with the
`art-performance-audit` workflow.

1. **Pick the scene and the lowest target tier.** Desktop numbers will not tell
   you about a low-end tier.
2. **Run a read-only audit first** if you want to see findings before any change:

   ```
   art-performance-audit  args: { scene: "harbour district", tier: "low mobile", fix: false }
   ```

3. **Run with fixes** once you agree with the findings:

   ```
   art-performance-audit  args: { scene: "harbour district", tier: "low mobile" }
   ```

4. **Read the result.**
   - Compare `baseline` and `after`; `withinBudget` says whether the scene now
     meets its budgets.
   - `remaining` lists what is still over, including hand-offs for the
     graphics-programmer (engine-side causes). Pass those on with the capture.
   - `unanalysed` lists categories whose analysis failed; rerun or check them
     by hand.
   - `status: "blocked"` with `open` means the fixes caused a regression (a pop,
     a broken material). Revert or fix those items before merging.
5. **If budgets were missing**, the docs step wrote a proposed budget reference.
   Get it agreed with the graphics-programmer before you rely on it.

See the [art-performance-audit reference](../reference/workflow-art-performance-audit.md)
and the [art-budgets-profiling skill reference](../reference/skill-art-budgets-profiling.md).
