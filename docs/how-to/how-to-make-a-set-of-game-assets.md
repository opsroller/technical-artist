# How to make a set of game assets

*How-to guide, for a lead or teammate who needs several related 3D assets made, checked and documented at once.*

This guide shows you how to produce a family of assets with the
`asset-batch` workflow.

1. **Check the project is ready.** The profile must name the asset folder, the
   manifest, the provenance log and the validator command. Budgets are optional;
   the workflow proposes them if missing.
2. **Write one line per asset**: a logical name following the project's naming
   pattern, and a brief that says what it is and what it must communicate.
3. **Run the workflow:**

   ```
   asset-batch  args: {
     family: "dockside props",
     assets: [
       { name: "SM_Crate_01", brief: "wooden crate, breakable, reads as a container" },
       { name: "SM_Barrel_01", brief: "metal barrel, explosive, must read as dangerous" },
       { name: "SM_Rope_Coil_01", brief: "decorative rope coil, low priority" }
     ]
   }
   ```

4. **Read the result.**
   - `status: "done"`: assets, manifest, provenance and docs are in place.
   - `status: "blocked"`: read `open`; each item names the asset and the
     problem. Fix or re-brief those assets and run again for just them.
   - `done-docs-unverified`: assets are done; review the docs pages by hand.
5. **Open a PR** with the measured numbers from `results` in the description
   (see `engineering-practices`).

If you want variants of one idea, give them the same base name (`SM_Crate_01`,
`SM_Crate_02`); the plan step will usually choose one shared generator.

If two assets must not share a material, say so in their briefs.

See the [asset-batch reference](../reference/workflow-asset-batch.md) for
phases, args and outputs.
