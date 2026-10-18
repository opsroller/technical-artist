# How to capture look-dev frames before and after a change

*How-to guide, for anyone who needs to see and compare what a material, texture or shader change looks like in the engine, without a person at the screen.*

This guide follows the `lookdev-capture` skill by hand. The `asset-batch`,
`author-shader` and `calibrate-visual-checks` workflows run the same steps
for you.

1. **List the frames**: the look-dev scene and the gameplay camera, once
   per renderer or quality tier the project ships, at one size.
2. **Find the capture command** for the project's engine in the skill's
   [engine recipes](../../skills/lookdev-capture/engine-recipes.md). On a
   machine without a GPU, wrap it in a virtual display and point it at a
   software driver, for example on Linux:

   ```sh
   VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/lvp_icd.x86_64.json \
     xvfb-run -a -s "-screen 0 1920x1080x24" \
     godot --path . --write-movie /tmp/frames/look.png \
       --fixed-fps 30 --quit-after 30 --resolution 1920x1080 \
       res://lookdev/LD_Neutral.tscn
   ```

3. **Keep global overlays out.** If the project loads UI, a fade layer
   or a debug overlay into every scene (autoloads, global singletons),
   capture with the override the project documents: a capture flag the
   overlays honour, or a capture configuration without them. If there is
   none, add a flag with the overlays' owner and document it. The skill's
   [engine recipes](../../skills/lookdev-capture/engine-recipes.md) list
   the usual switch per engine.
4. **Capture "before" from the base commit.** Check out the default branch
   in a separate worktree and run the same command there, before you
   change anything.
5. **Check every frame.** Its size is the one you asked for, it is not
   black or blank, it shows no overlay the scene does not contain, and it is the settled frame (the same frame number each
   time). If the size is wrong, set the engine's window size override and
   capture again.
6. **Make your change and capture "after"** with the identical command,
   size, frame and driver.
7. **Make the comparison images** with a script: a greyscale copy of each
   frame, and before | after side by side.
8. **Judge** each pair against the brief and the readability criteria,
   in colour and in greyscale. Name each problem with its frame.
9. **Store the frames** where the project says: small compressed images
   next to the docs page that shows them, full-size frames as CI
   artifacts.

## Related

- [lookdev-capture skill reference](../reference/skill-lookdev-capture.md)
- [How to make a set of game assets](how-to-make-a-set-of-game-assets.md)
- [How to author a shader](how-to-author-a-shader.md)
