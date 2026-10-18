---
name: artist-tools
description: Use when building or improving a tool, script, exporter, editor extension or automation for artists - finding the slow or error-prone step in an art workflow and removing it.
---

# Tools for artists

Tech-art tools are real software used under deadline by people who are not
programmers. A working tool is not enough; it must be easy to use, maintained,
supported and worth its cost.

## Method

1. **Find the pain by watching.** Sit with (or read the work logs of) the
   artists doing the task. Time each step; note errors, rework and waiting.
   Pick the step with the biggest cost × frequency, or the one that causes
   broken assets.
2. **Write a one-page brief.** User, problem, current time/error rate, what
   "done" looks like, inputs and outputs, what it will not do. Check whether a
   built-in feature, an existing tool or a pipeline rule already solves it.
3. **Smallest useful version first.** One job per tool; clear inputs and
   outputs so tools compose. Avoid frameworks before the second user.
4. **Design for the artist.** Works inside the tools they already use (DCC
   menu, editor panel, drag-and-drop, command) as the project profile names.
   Sensible defaults; one obvious action; progress for long work; undo or a
   dry-run for destructive actions; never lose the artist's data.
5. **Errors an artist can act on.** Say what is wrong, on which asset, and how
   to fix it. Log details for you; show the short version to them.
6. **Engineer it properly.** Version control, code review by the code-reviewer,
   tests for the logic (naming rules, maths, file conversion) with sample
   assets, pinned dependencies, no machine-specific paths, runs headless where
   possible so CI and other agents can use it.
7. **Trial with real users** on real assets; fix what confuses them; measure
   the time or error reduction against the brief.
8. **Ship with docs and support.** How-to for the task it solves, reference for
   options, a named owner and a way to report problems. Announce it.
9. **Maintain or retire.** Track usage and bug reports; remove tools nobody
   uses.

## Decision rules

- Automate a step when it is frequent, error-prone or blocks others; leave
  rare judgement calls to people.
- Prefer improving the pipeline (a rule, a preset) over a tool that must be
  remembered to run.
- If the tool needs engine or renderer changes, agree scope with the
  graphics-programmer or gameplay-programmer first.

## Quality bar

- An artist completes the task with the how-to alone.
- Measured improvement against the brief.
- Tests pass in CI; no hard-coded user paths; safe on failure.

## Docs this work owes

Every tool: a **how-to** named for the artist's goal and a **reference** page
(options, inputs, outputs, errors). A design trade-off worth recording →
**explanation**. If it changes onboarding, update the **tutorial**.

## Failure modes

- Building what was asked instead of what was needed.
- "Meta tools" that do everything and nothing well.
- Tools that only run on the author's machine; one person owns all knowledge.
- Silent failures; destructive operations without undo.
- No docs, so nobody uses it.
