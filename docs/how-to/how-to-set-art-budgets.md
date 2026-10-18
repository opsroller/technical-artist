# How to set art budgets for a project

*How-to guide, for a technical artist or lead who needs budgets before asset production scales up.*

This guide shows you how to get measured, agreed art budgets with the
`technical-artist` agent.

1. **Collect the frame.** Ask the graphics-programmer (or read the profile)
   for target tiers, resolution, frame-time target and the share of the frame
   available to content.
2. **Ask the agent for a proposal:**

   > Use the technical-artist agent and the art-budgets-profiling skill.
   > Propose art budgets for tiers <list>, measured from <our prototype scene
   > or a comparable reference>.

3. **Check it measured, not guessed.** The proposal must name the capture
   method, the scene, the tier and the number of captures.
4. **Prove it** with a stress scene at worst-case density on the lowest tier.
   If you have one, run the
   [art cost audit](how-to-cut-art-cost-in-a-slow-scene.md) on it.
5. **Agree** the numbers with the graphics-programmer and the art lead.
6. **Publish** them as a reference page in the project's docs, using the
   [budget template](../../skills/art-budgets-profiling/budget-template.md),
   plus an explanation page on how they were derived.
7. **Enforce** them: ask for validator rules
   ([How to automate a repetitive art task](how-to-automate-a-repetitive-art-task.md))
   and have the devops-engineer run the validator in CI.

If budgets change later, update the table's change log with the reason and
the measured evidence.
