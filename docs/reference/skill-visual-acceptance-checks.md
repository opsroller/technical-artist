# visual-acceptance-checks

*Reference, for users of the technical-artist plugin looking up the `visual-acceptance-checks` skill.*

| Field | Value |
|---|---|
| Name | `visual-acceptance-checks` |
| Source | [`skills/visual-acceptance-checks/SKILL.md`](../../skills/visual-acceptance-checks/SKILL.md) |
| Use when | Turning readability criteria into automated checks on rendered frames, or setting and re-tuning their thresholds. |
| Produces | A check script, a threshold data file with the good and bad numbers behind each threshold, tests on labelled cases, a CI command. |
| Docs owed | New check: reference + explanation. Adding a labelled case: how-to. |
| Used by | [calibrate-visual-checks](workflow-calibrate-visual-checks.md) |

## Method steps

1. Start from the criteria and their subjects in the visual target
2. Measure inside a mask per subject with a robust statistic
3. Pick the metric per criterion; report the worst pair
4. Simulate colour-vision deficiency in linear RGB with a published model
5. Build a labelled set of good and bad cases, with a holdout
6. Set each threshold between worst good and best bad with a margin
7. Confirm on the holdout and every tier
8. Ship as a script, threshold data, tests and a CI command
9. Re-calibrate only on purpose, never to let current art pass

## Metrics

| Criterion | Metric |
|---|---|
| Tell apart by value | CIELAB L* difference on the greyscale frame |
| Contrast against a background | Relative-luminance contrast ratio, as in WCAG |
| Tell apart by colour | CIEDE2000 (ΔE00) |
| Colour not the only cue | ΔE00 and L* after protanopia, deuteranopia and tritanopia simulation |
| Effects never hide state | The above with the effect on and off |
