---
name: visual-acceptance-checks
description: Use when turning readability criteria into automated checks on rendered frames - value or luminance separation, contrast, colour separation under colour-vision-deficiency simulation - or when setting, calibrating or re-tuning the thresholds of such checks against known-good and known-bad captures.
---

# Visual acceptance checks

A readability criterion ("the seven piece kinds tell apart in
greyscale") is only enforced once a script measures it on rendered
frames and fails when it is broken. The hard part is the threshold: set
it from what the art happens to look like today and it passes anything;
set it from a guess and it fails good art. Calibrate it on captures
whose answer is known.

## Method

1. **Start from the criteria.** Take each criterion and its subjects from
   the project's visual target (visual-target workflow): what must tell
   apart from what (piece kinds, team colours, hazards and floor), from
   which camera, on which tiers. A check measures one criterion.
2. **Get per-subject pixels.** Measure inside a mask per subject, not on
   whole frames. Prefer an engine-rendered ID or segmentation pass from
   the same camera; otherwise fixed screen regions from a deterministic
   frame (lookdev-capture skill). Take a robust statistic per subject
   (median, or a trimmed mean) so highlights and edges do not dominate.
3. **Pick the metric per criterion** (see the table). Compute every
   metric pairwise between subjects that must tell apart, and report the
   worst pair, never only the average.
4. **Simulate colour-vision deficiency** for colour criteria: protanopia,
   deuteranopia and tritanopia, full severity, with a published model
   (Machado, Oliveira and Fernandes 2009; Brettel, Viénot and Mollon
   1997 or Viénot 1999 for dichromats). Apply it in linear RGB, then
   measure. Name the model in the check's output.
5. **Build a labelled set.** Known-good captures: ones the art direction
   has accepted. Known-bad captures: the same frames made deliberately
   unreadable, one fault each (contrast lowered until the art direction
   or game-designer says two subjects confuse, two hues swapped to a
   CVD-confusable pair, value flattened, fog or bloom raised over game
   state). Keep one good and one bad case out of the calibration as a
   holdout.
6. **Set the threshold between them.** For each metric: the worst value
   among good cases and the best among bad cases. A threshold exists
   only if good is better than bad; put it between them with a margin
   (e.g. a third of the gap from the bad side) and record both numbers.
   If good and bad overlap, the metric does not measure the criterion:
   change the mask, statistic or metric, not the threshold.
7. **Confirm on the holdout.** The check passes the held-out good case
   and fails the held-out bad one. Then run it on every tier's frames.
8. **Ship it as a check.** A script with its thresholds in a data file,
   tests that run it on the labelled cases (good passes, bad fails), and
   the command for the project's CI (the devops-engineer owns the
   pipeline; make the smallest change or hand it over, per
   engineering-practices peer-coordination).
9. **Re-calibrate on purpose only.** A threshold changes when the
   criterion changes or the labelled set grows, with the new numbers in
   the same PR; never to let current art pass.

## Metrics

| Criterion | Metric | Notes |
|---|---|---|
| Tell apart by value | difference in CIELAB L* between subject medians, on the greyscale frame | L* is perceptual; differences of a few units are hard to see at game speed |
| Contrast against a background | relative-luminance contrast ratio (L1 + 0.05) / (L2 + 0.05), as in WCAG | WCAG 2.x asks 3:1 for non-text UI parts; a project threshold may differ |
| Tell apart by colour | CIEDE2000 (ΔE00) between subject medians | around 1 to 2.3 is a just-noticeable difference in ideal viewing; game play needs far more |
| Colour not the only cue | ΔE00 and L* after each CVD simulation | the worst pair under any simulation is the result |
| Effects never hide state | the above metrics with the effect on and off, same frame | report the drop |

## Docs this work owes

A new check → reference (criterion, metric, mask, thresholds with the
good and bad numbers they came from, command) and an explanation of why
the threshold sits where it does. A procedure for adding a labelled case
→ how-to.

## Failure modes

- Threshold fitted to today's art with no bad cases: it never fails.
- Whole-frame averages: one large background swamps the subjects.
- Averaging pairs: the one confusable pair is hidden.
- CVD simulation applied in sRGB instead of linear RGB.
- Calibrated on one tier or one renderer, applied to all.
- Loosening a threshold in the same PR that changes the art.
