# How to define a visual target and quality tiers

*How-to guide, for a technical artist who must say what the game should look like on each target before content production scales up.*

This guide shows you how to get tiers, budgets and readability criteria that
a reviewer can check, with the renderer decision made by the role that owns
it.

1. **Gather the inputs.** Have the art direction and references, the
   gameplay camera, the smallest supported screen and the target platforms
   written somewhere the project can point to. Missing art direction is a
   gap the workflow records, not a reason to wait.
2. **Run the workflow:**

   ```
   /technical-artist:visual-target  args: { scope: "the whole game", look: "<art direction page>", tiers: "desktop high, mobile, web" }
   ```

   Add `run: { mode: "inline" }` when your session must not spawn agents.
3. **Let the graphics-programmer decide the renderer.** If the run stops
   with `waiting-on-graphics-programmer`, the question has gone to whoever
   holds that role. When they answer (their
   [renderer-decision](https://github.com/opsroller/graphics-programmer/blob/main/docs/reference/workflow-renderer-decision.md)
   workflow returns it in the shape this one expects), run again with
   `renderer` set to their decision or the page it is written on.
4. **Read the result.** `done` returns tiers, the feature matrix, art
   budgets, criteria and packages. `blocked` with `open` lists review
   problems that one revision did not fix: settle them with the
   graphics-programmer or the art lead, then run again.
5. **Replace estimates.** Every budget labelled as an estimate gets a
   measurement in the first follow-up package: a near-final target scene on
   each tier's weakest device ([How to set art budgets](how-to-set-art-budgets.md)).
6. **Use the criteria.** Point asset reviews and the
   [art cost audit](how-to-cut-art-cost-in-a-slow-scene.md) at the
   criteria ids, and ask for validator rules for the budgets
   ([How to automate a repetitive art task](how-to-automate-a-repetitive-art-task.md)).

See the [visual-target reference](../reference/workflow-visual-target.md).
