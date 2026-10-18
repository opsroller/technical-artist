# Look-dev capture recipes

Starting points per engine and environment. Flags change between engine
versions: check them against the documentation for the version the
project pins, and verify the output as the skill says.

## Virtual display and software GPU (Linux)

| Need | Command or setting |
|---|---|
| Virtual display | `xvfb-run -a -s "-screen 0 1920x1080x24" <engine command>` (package `xvfb`) |
| Software Vulkan | Mesa lavapipe (package `mesa-vulkan-drivers` on Debian/Ubuntu); point the loader at it with `VK_ICD_FILENAMES` (older loaders) or `VK_DRIVER_FILES` (newer) = the `lvp_icd.*.json` under `/usr/share/vulkan/icd.d/` |
| Software OpenGL | Mesa llvmpipe; `LIBGL_ALWAYS_SOFTWARE=1` |
| Which driver ran | `vulkaninfo --summary` or `glxinfo -B` inside the same `xvfb-run`; the engine's startup log usually names the device |

## Godot 4

| Need | Command or setting |
|---|---|
| Fixed-step capture | `godot --path <project> --write-movie <out>.png --fixed-fps 30 --quit-after <frames> <scene>` (a `.png` path writes a numbered image per frame; keep the settled one) |
| Size | `--resolution <W>x<H>`; when the captured size differs, set `display/window/size/window_width_override` and `window_height_override` (project settings or an override file) and capture again |
| Renderer | `--rendering-method forward_plus\|mobile\|gl_compatibility`, `--rendering-driver vulkan\|opengl3` |
| Note | `--headless` uses a dummy renderer and writes empty frames; use a virtual display instead |

## Unreal Engine

| Need | Command or setting |
|---|---|
| Offscreen render | `<Editor or game binary> <project> <map> -game -RenderOffscreen -ResX=<W> -ResY=<H> -ExecCmds="HighResShot <W>x<H>"` |
| Sequences | Movie Render Queue, from the command line with a saved queue preset |
| Determinism | fixed frame rate (`-BENCHMARK -FPS=<n>` or the queue's settings), fixed seeds for Niagara |

## Unity

| Need | Command or setting |
|---|---|
| Batch render | `-batchmode` without `-nographics` keeps the GPU; run an editor method with `-executeMethod` that renders a camera into a `RenderTexture` and saves it with `ReadPixels` and `EncodeToPNG` |
| Determinism | `Time.captureFramerate` for fixed steps, `Random.InitState` for seeds |

## Overlays drawn over every scene

What the engine loads into every scene, and the capture hook that keeps
it out of a look-dev capture (the skill's capture mode). Prefer a flag or
environment variable the overlays honour over an override file, and never
hand-edit the shipping configuration; check the frame afterwards, as the
skill says.

| Engine | What draws over every scene | Capture hook |
|---|---|---|
| Godot 4 | autoloads (`[autoload]` in `project.godot`) that add UI, fade or debug layers | a user argument after `--` (`godot ... <scene> -- --lookdev`), read with `OS.get_cmdline_user_args()` (or an environment variable read with `OS.get_environment()`), that each overlay autoload checks to hide or free itself; or a capture override file that removes the autoload entries (check on the pinned version that the override really drops them) |
| Unreal Engine | the GameMode's HUD class, widgets the GameInstance or a subsystem adds, on-screen debug messages and stats | a look-dev map with a GameMode override that has no HUD class; `-ExecCmds="DisableAllScreenMessages, stat none"` |
| Unity | bootstrap objects from `RuntimeInitializeOnLoadMethod` or `DontDestroyOnLoad` (UI canvases, fade screens, debug consoles) | a command-line switch read with `System.Environment.GetCommandLineArgs()` that the bootstrap checks; or an editor method that renders only the look-dev scene's camera into a `RenderTexture` |

## Derived images

| Need | Pillow | ImageMagick |
|---|---|---|
| Greyscale | `ImageOps.grayscale(img)` | `magick in.png -colorspace Gray out.png` |
| Side by side | paste into a new image of width `w1 + w2` | `magick before.png after.png +append pair.png` |
| Difference | `ImageChops.difference(a, b)` then `ImageStat.Stat(d).rms` | `magick compare -metric RMSE a.png b.png diff.png` |
| Size check | `img.size` | `magick identify -format "%wx%h" in.png` |
