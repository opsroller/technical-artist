# How to calibrate visual acceptance checks

*How-to guide, for a technical artist or teammate who needs readability criteria enforced by an automated check with thresholds that mean something.*

This guide shows you how to build or re-tune value, contrast and
colour-blind separation checks with the `calibrate-visual-checks`
workflow.

1. **Check the criteria exist.** The project's visual target must list
   the readability criteria and what must tell apart. If it does not, run
   `/technical-artist:visual-target` first.
2. **Name the subjects**: the things that must tell apart, from which
   camera (for example "the five pickup types against the floor, from
   the gameplay camera").
3. **Run the workflow:**

   ```
   calibrate-visual-checks  args: {
     criteria: "R1 to R3 in docs/reference/visual-target.md",
     subjects: "the five pickup types against the floor, from the gameplay camera",
     wp: "WP-12"
   }
   ```

   Pass `existing` with the path of a check script to re-calibrate it.

4. **Read the result.**
   - `status: "done"`: `thresholds` lists each threshold with the worst
     good and best bad numbers it came from; `holdout` shows the check
     got both held-out cases right; `perTier` shows how the current art
     scores.
   - `notes` lists any current art that fails a check. That is a finding
     for the art; fix the art, not the threshold.
   - `status: "blocked"` in `fix` with an overlap: good and bad cases
     score the same, so the metric does not measure the criterion yet.
     Add a better mask or metric, or more labelled cases, and run again.
5. **Ship it** with the command in `next`, then ask the devops-engineer to
   make the check command a required CI step if the PR did not already.

## Add a labelled case later

Add the frame (good) or the frame and the fault that makes it bad (bad)
to the fixtures, then run the workflow again with `existing` set to the
check. The new thresholds and their numbers go in the same PR.

## Related

- [calibrate-visual-checks reference](../reference/workflow-calibrate-visual-checks.md)
- [visual-acceptance-checks skill reference](../reference/skill-visual-acceptance-checks.md)
- [How to define a visual target and quality tiers](how-to-define-a-visual-target-and-quality-tiers.md)
