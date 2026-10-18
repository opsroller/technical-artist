# How to author a shader

*How-to guide, for a technical artist or teammate who needs a new shader, or a rework of one, built, reviewed and shipped.*

This guide shows you how to take an effect from a brief to a pull request
with the `author-shader` workflow.

1. **Check a shader is needed.** The project's shared material should not
   be able to do the effect with parameters or a mask. If it can, make a
   material instance with `asset-batch` instead.
2. **Check the renderer decision exists.** The plan reads the technique
   per tier from the project's visual target and renderer decision. If
   there is none, it stops; ask the graphics-programmer
   (`/graphics-programmer:renderer-decision`) first.
3. **Write the brief** as what the effect must look like, where it is
   used, and what it must communicate in play.
4. **Run the workflow:**

   ```
   author-shader  args: {
     shader: "SH_Water",
     brief: "harbour water with refraction and foam on high tiers; pickups floating on it still read in greyscale; covers up to half the screen",
     replaces: "the water material instance on the standard shader",
     wp: "WP-12"
   }
   ```

5. **Read the result.**
   - `status: "done"`: the shader, materials, docs and frames are on a
     pushed branch with a draft PR; `measured` and `variants` give its
     cost.
     `knownRisks` lists any budget that was already over before this
     shader while its own cost stayed within its share: pass it to the
     budget's owner. `captureHookProposal`, when set, is the small change
     to ask the overlay code's owner for so captures can hide the UI.
   - `status: "pending_ci"`: done, except the targets in `pending_ci`,
     which this machine cannot compile for (for example Metal from a
     Linux host) and which a named CI job proves. Wait for CI on the PR,
     then run the command in `next` (see below).
   - `status: "unverified"`: a review returned nothing
     (`unverifiedReviews`); run that review again with
     `run: { only: ["review:<name>"] }`.
   - `status: "blocked"`: read `stage` and `open`, fix, run again.
6. **Ship it** with the command in `next`.

## Confirm targets only CI can compile

When the result is `pending_ci`, CI must prove those targets before the
PR merges. It returns no `handoff` yet. Once the CI jobs named in
`pending_ci` have finished on the PR head, run the command in `next`. It
carries the list and what the handoff needs (`wp`, `docs`, `notes`):

```
author-shader  args: {
  shader: "SH_Water",
  pr: "#42",
  ci_pending: ["metal: pending-ci macos-build"]
}
```

It reads each job's latest run. All passed: `status: "done"` with a
`handoff` for that head, and `next` names deliver-package (with `wp`) or
land-pr. A target failed: it fixes the shader from the CI log, pushes,
and returns `pending_ci` again, because the new head needs a new CI run.
A job that has not run on the head yet: `pending_ci` again; run it once
CI finishes.

## Related

- [author-shader reference](../reference/workflow-author-shader.md)
- [materials-shaders skill reference](../reference/skill-materials-shaders.md)
- [How to capture look-dev frames before and after a change](how-to-capture-look-dev-frames-before-and-after.md)
