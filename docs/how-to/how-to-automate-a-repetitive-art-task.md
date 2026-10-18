# How to automate a repetitive art task

*How-to guide, for artists or leads who keep repeating a manual step or fixing the same asset mistake.*

This guide shows you how to turn that step into a tool, import rule or
validator check with the `artist-tool` workflow.

1. **Describe the pain in one sentence**, including who has it:
   "Environment artists rename every exported texture by hand" or
   "normal maps keep getting imported as sRGB".
2. **Choose a kind if you know it.** `validator-rule` for mistakes that should
   be caught; `import-rule` for settings that should follow from the name or
   folder; `tool` for steps an artist runs. If unsure, leave it out.
3. **Run:**

   ```
   artist-tool  args: { problem: "normal maps keep getting imported as sRGB", users: "environment artists", kind: "validator-rule" }
   ```

4. **Read the result.**
   - `status: "done"`: the tool, its tests, a how-to and a reference page are
     in the working tree. `trial` says how it did on real assets.
   - `needsOtherRole` names CI or engine changes to hand to the
     devops-engineer, graphics-programmer or gameplay-programmer.
   - `status: "blocked"`: `open` lists review blockers; nothing should merge
     until they are fixed.
5. **Roll out a new validator rule as a warning first** if many existing assets
   break it; fix them, then make it an error (see the
   [asset-pipeline skill reference](../reference/skill-asset-pipeline.md)).

See the [artist-tool reference](../reference/workflow-artist-tool.md).
