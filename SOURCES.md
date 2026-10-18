# Sources

*Reference, for anyone checking the research behind the technical-artist plugin.*

## Job postings and levels

- **Larian Studios, Technical Artist** - https://hitmarker.net/jobs/larian-studios-technical-artist-1900671 - core duties: art-programming link, pipeline tools, shaders/PBR, performance standards, documentation, mentoring.
- **Netflix Games Studio, Sr. Technical Artist** - https://www.entertainmentcareers.net/netflix/sr-technical-artist-games-studio/job/414175 - bridge role, asset performance and validation, pipeline tools, in-game issue diagnosis.
- **Electronic Arts, Senior/Principal Technical Artist** - https://ea.gr8people.com/jobs/167002/senior-technical-artist?locale=es - naming conventions, memory/performance budgets, build stability; senior work removed from direct asset creation.
- **Netflix Games R&D, Principal Technical Artist** - https://www.workingnomads.com/jobs/principal-technical-artist-games-rd-tech-lab-netflix-1735226 - principal scope: budgets and benchmarks for a team, profiling CPU/GPU/bandwidth, draw calls, overdraw, LODs.
- **Valkyrie Entertainment, Technical Artist** - https://jobs.smartrecruiters.com/ValkyrieEntertainment/743999796424882-technical-artist - file size, polycount and load limits, tool R&D, technical documentation.
- **O*NET 27-1014.00 Special Effects Artists and Animators** - https://www.onetonline.org/link/details/27-1014.00 - occupational task baseline for 3D modelling, lighting, texture work.
- **tech-artists.org, career tracks in technical art** - https://tech-artists.org/t/different-career-tracks-within-technical-art/11517 - specialisations (tools, pipeline, shaders/look-dev, rigging, VFX).

## Talks and practitioner write-ups

- **GDC 2012 Technical Artist Boot Camp** - https://gdcvault.com/play/1015493/Technical-Artist-Boot - role varies by studio; tools as real software (review, support); infrastructure; embedded TAs; avoiding over-engineering.
- **GDC 2014 Technical Artist Bootcamp** - https://gdcvault.com/play/1020643/Technical-Artist-Bootcamp - tool UX ("a working tool is not good enough"), asset processing automation, runtime optimisation.
- **Rob Galanakis, Top three challenges for technical artists** - https://insights.dice.com/2011/04/18/top-three-challenges-for-technical-artists/ - care about content, build programming skill, influence culture.
- **80 Level, Procedural technology in Ghost Recon Wildlands** - https://80.lv/articles/procedural-technology-in-ghost-recon-wildlands/ - one tool per task, artist control, determinism, locking procedural output before hand edits, spreading tool knowledge.
- **tech-artists.org, how to calculate game budgets** - https://www.tech-artists.org/t/how-correctly-calculate-game-budgets-textures-mb-meshes-mb-polycount/10177 - budgets are measured not copied; vertex splits; density per size class; draw calls depend on platform.

## Visual targets and quality tiers

- **Meta, Art preproduction** - https://developers.meta.com/horizon/design/art-preproduction/ - visual targets as near-final quality benchmarks built early to prevent revisions; style guide with asset budgets; testing on target hardware. Informed the `visual-target` workflow and its first follow-up package.
- **Valve, Illustrative Rendering in Team Fortress 2 (SIGGRAPH 2007 course notes)** - https://www.advances.realtimerendering.com/s2007/Mitchell-IllustrativeRenderingInTF2(Siggraph07%20Course%20Notes).pdf - readability first: silhouette and value structure so players read characters at a glance; informed the readability criteria.
- **Microsoft, Xbox Accessibility Guideline 103: Additional channels for visual and audio cues** - https://devdocs.xbox.com/gaming/accessibility/xbox-accessibility-guidelines/103 - never carry information by colour alone; informed the hue-alone criterion.
- **Epic Games, Scalability reference for Unreal Engine** - https://dev.epicgames.com/documentation/en-us/unreal-engine/scalability-reference-for-unreal-engine - quality tiers as independent groups of rendering features with per-level settings; informed the feature matrix.
- **Godot Engine, Overview of renderers** - https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html - rendering paths differ in features and platform support; the engine research starts from which path each target can run.
- **Android, Performance class** - https://developer.android.com/topic/performance/performance-class - grouping devices by capability rather than model name; informed the tier proposal.

## Look-dev capture and visual checks

- **Godot Engine, Creating movies (Movie Maker mode)** - https://docs.godotengine.org/en/stable/tutorials/animation/creating_movies.html - fixed-step offline rendering to image sequences; informed the deterministic-frame steps of `lookdev-capture`.
- **Mesa, llvmpipe** - https://docs.mesa3d.org/drivers/llvmpipe.html - software rasterizer for rendering without a GPU (lavapipe is its Vulkan driver); informed the software-renderer section.
- **X.Org, Xvfb manual** - https://www.x.org/releases/current/doc/man/man1/Xvfb.1.xhtml - virtual framebuffer display for rendering with no screen attached.
- **W3C, Understanding WCAG 2.1 Success Criterion 1.4.11: Non-text Contrast** - https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html - relative-luminance contrast ratio and the 3:1 level for UI parts; informed the contrast metric.
- **Machado, Oliveira and Fernandes, A Physiologically-based Model for Simulation of Color Vision Deficiency (2009)** - https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html - simulation matrices per deficiency and severity, applied in linear RGB; informed the colour-blind separation check.
- **Sharma, Wu and Dalal, The CIEDE2000 Color-Difference Formula (2005)** - https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/ - implementation notes and test data for ΔE00; informed the colour separation metric.

## Standards and established practice

- **Adobe (Allegorithmic), The PBR Guide part 2** - https://www.adobe.com/learn/substance-3d-designer/web/the-pbr-guide-part-2 - metal/roughness value ranges, colour spaces, F0, common mistakes.
- **GDC 2016, End-to-End Approach to Physically Based Rendering** - https://www.slideshare.net/slideshow/gdc-2016-endtoend-approach-to-physically-based-rendering/60294641 - energy conservation, albedo validation, check materials before lighting.
- **Khronos 3D Commerce, Real-time Asset Creation Guidelines** - https://github.com/mlimper/3DC-Asset-Creation/blob/main/asset-creation-guidelines/RealtimeAssetCreationGuidelines.md - scale, pivot, topology, UVs, texture sizes and colour spaces, ORM packing, naming characters, validation errors.
- **Texel density walkthrough (GarageFarm)** - https://garagefarm.net/blog/a-texel-density-walkthrough-for-blender-artists - definition, choosing a reference density, checker method, common mistakes.
- **Simplygon, choosing LOD reduction targets** - https://simplygon.com/posts/b83478b7-a2a1-46a9-a0e1-cba3da7da307 - reduce by visual error or screen size, LOD classes, scene-level budgets.
- **Simplygon, LOD transitions** - https://simplygon.com/posts/51aba9d5-bafd-459d-94b8-718273fdf092 - switch distances doubling, ~1 px deviation target, skipping LODs for tiny assets.
- **Epic Games, LOD best practices (UEFN)** - https://dev.epicgames.com/documentation/fortnite/level-of-detail-lod-best-practices-in-fortnite - starting reduction (50 %/25 %), separate curves for props and architecture, collision from low LOD, per-tier minimum LOD.
- **Unity, Artists' best practices for mobile game development (with Arm)** - https://blog.unity.com/pt/technology/artists-best-practices-for-mobile-game-development - micro-triangles, texture sizing and compression, mipmaps, overdraw, alpha test vs blend.
- **Allar, UE style guide (naming)** - https://github.com/Allar/ue5-style-guide/blob/main/README.md - Prefix_BaseAssetName_Variant_Suffix pattern, character rules, folders by content, texture suffixes.
- **Creative Commons, Recommended practices for attribution** - https://wiki.creativecommons.org/Best_practices_for_attribution - TASL, attribution of adaptations.
- **Diataxis** - https://diataxis.fr - documentation structure for this plugin and for the docs steps in its workflows.
