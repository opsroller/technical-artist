// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'asset-batch',
  description: 'Plan, make, validate, look-dev and document a set of in-game 3D assets (models, texture sets, materials) within budget, then push them as a handoff for engineering-practices deliver-package or land-pr. Each make unit is one hand-made asset or one generator run that writes many assets. Texture and material checks cover colour space, PBR value plausibility and quality-tier variants; look-dev frames are captured before and after and compared. Use for two or more related assets. args: { assets: [{ name: "SM_Crate_01", brief: "what it is and what it must communicate", kind?: "mesh|texture-set|material|shader-material" }, ...], family?: "what ties the set together", generator?: "<existing generator script, optional>", capture?: true, wp?: "<work package id>", branch?: "<existing branch>", pr?: "<existing PR>" }',
  phases: [
    { title: 'Plan', detail: 'conventions, make units (one asset, or one generator run for many), owned paths, budgets, colour spaces, tier variants, generated-output policy, look-dev frames, doc kinds' },
    { title: 'Before', detail: 'capture the look-dev frames on the current state (lookdev-capture skill)' },
    { title: 'Make', detail: 'one agent per make unit; each writes only its own paths and returns manifest and provenance lines' },
    { title: 'Check', detail: 'apply shared-file lines once; independent read-only check of budgets, checklist, colour space, PBR values, tier variants, regeneration; fix loop' },
    { title: 'After', detail: 'capture the same frames again and compare them independently against the briefs and readability criteria; fix loop' },
    { title: 'Docs', detail: 'write the planned Diataxis pages, then an independent check of one kind per page' },
    { title: 'Handoff', detail: 'commit, push, open or reuse a draft PR, return a handoff for deliver-package or land-pr' },
  ],
}

// --- run-modes v2 begin ---
const RUN = ((a, realAgent, realPhase, realLog) => {
  const opted = !!(a && typeof a === 'object' && a.run && typeof a.run === 'object')
  const c = opted ? a.run : {}
  const mode = c.mode === 'inline' ? 'inline' : 'agents'
  const results = c.results && typeof c.results === 'object' ? c.results : {}
  const reviewers = c.reviewers && typeof c.reviewers === 'object' ? c.reviewers : {}
  const only = Array.isArray(c.only) && c.only.length ? c.only.map(String) : null
  const from = c.from ? String(c.from) : null
  const titles = typeof meta !== 'undefined' && meta && Array.isArray(meta.phases) ? meta.phases.map((p) => p.title) : []
  const unknown = titles.length ? (from ? [from] : []).filter((t) => !titles.includes(t)) : []
  const error = c.mode && !['agents', 'inline'].includes(c.mode)
    ? `run.mode must be "agents" or "inline", got "${c.mode}"`
    : unknown.length ? `run.from names no phase: ${unknown.join(', ')}. Phases: ${titles.join(', ')}` : null
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k)
  // An answer must carry every required key of its schema, as the runtime
  // enforces for agents; returns the missing keys, or null when it fits.
  const missing = (v, schema) => {
    if (v === null || v === undefined) return 'an answer'
    if (!schema || schema.type !== 'object') return null
    if (typeof v !== 'object' || Array.isArray(v)) return 'a JSON object'
    const gap = (schema.required || []).filter((k) => !has(v, k) || v[k] === undefined)
    return gap.length ? gap.join(', ') : null
  }
  const seen = {}
  const out = {}
  // Who answered each step marked independent: "subagent" when this run
  // spawned it, else the reviewer named in run.reviewers, else "self".
  const by = {}
  const who = (k) => (typeof reviewers[k] === 'string' && reviewers[k].trim() ? reviewers[k].trim() : 'self')
  const skipped = []
  const next = []
  const logs = []
  let current = ''
  let reached = !from
  let halting = false
  let release = () => {}
  const halted = new Promise((r) => { release = r })
  const picked = (ph, label) => reached && (!only || only.some((s) => s === ph || s === label || label.startsWith(s + ':')))
  const agent = (prompt, opts) => {
    const op = opts || {}
    const independent = op.independent === true
    const ph = op.phase || current
    const base = op.label || ph || 'agent'
    seen[base] = (seen[base] || 0) + 1
    const key = seen[base] > 1 ? `${base}#${seen[base]}` : base
    let note = null
    if (has(results, key)) {
      const gap = missing(results[key], op.schema)
      if (!gap) { out[key] = results[key]; if (independent) by[key] = who(key); return Promise.resolve(results[key]) }
      note = `answer missing ${gap}; answer this brief again`
    }
    if (!picked(ph, base)) { skipped.push(key); return Promise.resolve(null) }
    if (mode === 'agents') {
      const pass = Object.assign({}, op)
      delete pass.independent
      return realAgent(prompt, opts ? pass : opts).then((r) => {
        if (r !== null && r !== undefined) { out[key] = r; if (independent) by[key] = 'subagent' }
        return r
      })
    }
    const brief = { key, phase: ph, prompt, schema: op.schema || null }
    if (independent) brief.independent = true
    if (note) brief.note = note
    next.push(brief)
    if (!halting) {
      halting = true
      // Wait 200 microtask turns before pausing, so every sibling in a
      // parallel() or pipeline() fan-out queues its brief into this pause.
      ;(async () => { for (let i = 0; i < 200; i++) await null; release('__run_halted__') })()
    }
    return new Promise(() => {})
  }
  const phase = (t) => { current = t; if (from && t === from) reached = true; return realPhase(t) }
  const log = (m) => { logs.push(String(m)); return realLog(m) }
  const finish = (value) => {
    if (!opted) return value
    const self_reviewed = Object.keys(by).filter((k) => by[k] === 'self')
    if (value === '__run_halted__') {
      return {
        run: 'inline', status: 'next', next, results: out, reviewers: by, self_reviewed, skipped, logs,
        how: 'Do each brief in next, in order: follow its prompt in this session (it may tell you to edit files, commit or push), and shape your answer to its schema when one is given, with every required field. A brief marked independent reviews work this run produced, so do not answer it yourself: send its prompt to a reviewer with no part in the work (the project\'s code-reviewer role, a fresh session or a fresh subagent), use their answer, and name them in run.reviewers under its key; if you must answer it yourself, it is listed in self_reviewed and must be reported as self-reviewed. A brief with a note was answered before without the fields it names. Add each answer to results under its key, then run this workflow again with the same args, run.results set to the merged results and run.reviewers to the merged reviewers. Repeat until status is "done". To avoid pasting results back on every call, drive the run with engineering-practices tools/run-inline.mjs and a state file instead: it stores each answer and prints only the next briefs.',
      }
    }
    return { run: mode, status: 'done', result: value, results: out, reviewers: by, self_reviewed, skipped, logs }
  }
  return { agent, phase, log, finish, halted, error }
})(typeof args === 'undefined' ? undefined : args, agent, phase, log)
if (RUN.error) return RUN.error
const RUN_OUT = await Promise.race([RUN.halted, (async (agent, phase, log) => {
// --- run-modes v2 end (workflow body follows; close it with the tail line) ---

const USAGE = 'Usage: asset-batch with args { assets: [{ name: "SM_Crate_01", brief: "wooden crate, breakable, must read as a pickup container", kind: "mesh" }, { name: "T_Planks_01", brief: "weathered dock plank texture set", kind: "texture-set" }, ...], family: "dockside props", generator: "<existing generator script, optional>", capture: true, wp: "<work package id, optional>", branch: "<existing branch, optional>", pr: "<existing PR, optional>" }'
const assets = (args && Array.isArray(args.assets)) ? args.assets.filter(a => a && a.name && a.brief) : []
if (!assets.length) return USAGE
const family = (args && args.family) || 'one coherent set'
const generator = args && args.generator ? String(args.generator) : ''
const wantCapture = !(args && args.capture === false)
const wp = args && args.wp ? String(args.wp) : ''
const where = args && args.pr
  ? `Work on the existing PR ${args.pr} and its head branch; do not create a new branch or PR.`
  : args && args.branch
    ? `Work on the existing branch ${args.branch} (reuse its open PR if one exists); do not create a new branch.`
    : 'Work on the current feature branch; if you are on the default branch, cut a Conventional branch (feat/<slug>) from the latest remote default branch.'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs/<kind>/, keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

// Texture and material checks every maker and checker applies. They are
// the ones that most often go wrong unnoticed in a PBR pipeline.
const MATERIAL_RULES = 'For texture sets and materials (materials-shaders skill and its pbr-reference.md): ' +
  '1) colour space: colour maps (base colour, emissive) sRGB, every data map (normal, roughness, metallic, AO, height, masks, packed maps) linear, checked in the import settings or the material, not assumed; ' +
  '2) PBR value plausibility, measured with a script or the project validator over every pixel or a sample, not by eye: dielectric base colour within the reference range, raw metal base colour bright, metallic essentially binary, roughness not a constant map, no lighting or AO baked into base colour, normal map in the engine\'s convention, constant maps replaced by parameters; ' +
  '3) quality-tier variants: every variant for a higher tier has a base variant every target can load, lower-tier exports leave the higher-tier files out, and each tier\'s texture memory is within its budget; ' +
  '4) engine import settings: every texture has the engine\'s import settings written next to it by whatever made it (the generator, or the authored export step), never left to engine defaults: mipmaps on for 3D textures, compression per map type and platform, colour space (sRGB flag) by map role, normal-map flag on normal maps; each setting is read back from the file and checked against the map\'s role.'

const strings = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const notes = []

// ---------- Plan ----------
phase('Plan')
const PLAN = {
  type: 'object',
  properties: {
    conventions: { type: 'string', description: 'scale, pivot, naming, texel density, export format, folders, validator command, manifest and provenance log paths, as the project profile states them' },
    units: {
      type: 'array',
      description: 'make units: one per hand-made or separately generated asset, or one per generator run that writes several assets at once (a texture-set or material generator)',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'short unique id, e.g. the asset name or gen-<generator>' },
          method: { type: 'string', enum: ['authored', 'procedural', 'generator-run'] },
          assets: { type: 'array', items: { type: 'string' }, description: 'asset names this unit produces' },
          kind: { type: 'string', description: 'mesh | texture-set | material | shader-material | mixed' },
          budget: { type: 'string', description: 'per asset: tris per LOD, texture set size and memory per tier, materials' },
          writes: { type: 'array', items: { type: 'string' }, description: 'files or directories only this unit may write (generator script, its inputs, its outputs)' },
          command: { type: 'string', description: 'for procedural or generator-run: the command that regenerates every output' },
          tool: { type: 'string', description: 'the DCC or tool this unit runs, and whether it ran headless here when you tried its batch or background command now (e.g. "<tool> <version>: headless ok" or "<tool>: cannot run headless here: <why>")' },
          substitute: { type: 'string', description: 'when the named tool cannot run headless here: the procedural or scripted tool that does run and is used instead (method becomes procedural); empty otherwise' },
          tierVariants: { type: 'array', items: { type: 'string' }, description: 'each "tier: what differs (file, texture size, shader feature)", empty if one variant serves every tier' },
          notes: { type: 'string' },
        },
        required: ['id', 'method', 'assets', 'kind', 'budget', 'writes'],
      },
    },
    tiers: { type: 'array', items: { type: 'string' }, description: 'quality tiers from the project\'s visual target, lowest first; empty if the project has none' },
    generatedOutputs: { type: 'string', enum: ['commit', 'build'], description: 'commit: generated files are committed; build: only the generator and inputs are committed, outputs are made by the build and ignored by version control' },
    generatedWhy: { type: 'string', description: 'the project rule this follows, or the default taken and why' },
    lookdev: {
      type: 'object',
      properties: {
        possible: { type: 'boolean', description: 'the project can render a look-dev scene headless in this environment' },
        frames: { type: 'array', items: { type: 'string' }, description: 'each "scene / camera / renderer or tier": what is captured' },
        command: { type: 'string', description: 'the capture command (lookdev-capture skill), with resolution and frame; empty when the project has none' },
        commandFound: { type: 'boolean', description: 'true only if the project already has a capture command you found; false means the Before step builds one from the lookdev-capture recipe' },
        overlays: { type: 'string', description: 'what the project draws over every scene (autoloads or global singletons with UI, fades, debug HUDs), or "none"' },
        hook: { type: 'string', description: 'the capture hook the project provides for capture mode (command-line flag, environment variable or override file) that hides UI and overlays, or "none"' },
        hookProposal: { type: 'string', description: 'when overlays exist and hook is "none": the small separate change that adds a hook and who owns that code (project profile); otherwise empty' },
        outDir: { type: 'string', description: 'where frames go, and whether the project commits them' },
        why: { type: 'string', description: 'when not possible: why' },
      },
      required: ['possible'],
    },
    docKinds: { type: 'array', items: { type: 'string' }, description: 'tutorial | how-to | reference | explanation, each with the page and reason' },
    blockers: { type: 'array', items: { type: 'string' }, description: 'only what stops the work from starting' },
    caveats: { type: 'array', items: { type: 'string' }, description: 'risks that do not stop the work' },
  },
  required: ['conventions', 'units', 'tiers', 'generatedOutputs', 'lookdev', 'docKinds'],
}
const plan = await agent(
  `You are the technical-artist planning an asset batch (family: ${family}). Follow engineering-practices project-onboarding, then the technical-artist skills art-budgets-profiling, asset-pipeline, procedural-assets, materials-shaders and lookdev-capture.\n` +
  `Assets:\n${JSON.stringify(assets, null, 2)}\n` +
  (generator ? `An existing generator is named for this batch: ${generator}. Read it first; plan it as one generator-run unit for every asset it can produce.\n` : '') +
  'Read the project profile for conventions and budgets (if budgets are missing, propose them per art-budgets-profiling and list that as a doc change). ' +
  'Split the batch into make units. A unit is one hand-made asset, one procedurally generated asset, or one generator run that writes several assets at once: texture sets and materials that one script produces are ONE unit, never one unit per output. Prefer one shared generator for variants of one idea. Give each unit the files or directories only it may write, so no two units write the same file, and for generated units the one command that regenerates every output. ' +
  'Detect early whether each unit\'s DCC or tool runs headless in this environment: try its batch or background command now (a version or no-op script run) and record the result in tool. If a named tool cannot run headless here, fall back to procedural or scripted generation in a tool that does run (realtime-asset-authoring, "When the DCC tool cannot run headless"): set method to procedural, name the tool used in substitute, and keep the same output contract. ' +
  'Read the project\'s quality tiers from its visual target (visual-target workflow) if it has one, and list per unit what differs per tier. ' +
  'Read the project rule on whether generated files are committed; if it has none, choose "build" when the outputs are large or binary (only the generator and its inputs are committed and the build makes the outputs) and "commit" otherwise, and say which you took in generatedWhy. ' +
  'Plan the look-dev frames (lookdev-capture skill): the project\'s look-dev scene and the gameplay camera, on each renderer or tier the project ships, and the headless capture command. Detect whether the project has a capture command and set commandFound; never assume one exists; with none, the Before step builds one from the skill\'s capture command recipe. Set possible to false with the reason only if the project or environment cannot render, and the capture is then pending. Find what the project draws over every scene and the capture hook it provides for capture mode (flag, environment variable or override file); if there is none, write the small separate change that adds one and who owns that code in hookProposal, and never plan to hand-edit shipping configuration. ' +
  'List which documentation kinds this batch affects using the Diataxis compass (e.g. a new generator needs reference + how-to; new budgets need reference + explanation). Only what stops the work goes in blockers; risks go in caveats. Do not create assets yet.',
  { schema: PLAN, phase: 'Plan', label: 'plan' },
)
if (!plan || !Array.isArray(plan.units) || !plan.units.length) return 'blocked: planning failed (no plan returned). Check the project profile and retry.'
if (strings(plan.blockers).length) return { status: 'blocked', stage: 'plan', blockers: strings(plan.blockers) }
const units = plan.units.filter(u => u && u.id)
// Two units writing one path would race in parallel; stop before making.
const owned = []
const clashes = []
units.forEach(u => strings(u.writes).forEach(p => {
  const q = p.replace(/\/+$/, '')
  owned.forEach(o => { if (o.unit !== u.id && (o.path === q || q.startsWith(o.path + '/') || o.path.startsWith(q + '/'))) clashes.push(`${o.unit} and ${u.id} both write ${o.path === q ? q : (q.length < o.path.length ? q : o.path)}`) })
  owned.push({ unit: u.id, path: q })
}))
if (clashes.length) return { status: 'blocked', stage: 'plan', blockers: clashes.map(c => 'make units overlap: ' + c + '; re-plan with disjoint paths') }
const planned = new Set(units.flatMap(u => strings(u.assets)))
const unplanned = assets.map(a => a.name).filter(n => !planned.has(n))
if (unplanned.length) return { status: 'blocked', stage: 'plan', blockers: ['no make unit produces: ' + unplanned.join(', ')] }
const caveats = strings(plan.caveats)
const tiers = strings(plan.tiers)
const look = plan.lookdev || { possible: false }
const capturing = wantCapture && !!look.possible
if (wantCapture && !look.possible) notes.push('look-dev capture pending: ' + (look.why || 'the plan found no way to render headless'))
// A missing capture hook is someone else's code: propose it, do not edit shipping config.
const hookProposal = capturing && look.hookProposal && String(look.hookProposal).trim() ? 'capture hook proposed as a separate change: ' + String(look.hookProposal).trim() : ''
if (hookProposal) notes.push(hookProposal)
// A tool swapped because the named one cannot run headless is recorded in
// the handoff here and in each provenance record by its make unit.
const substitutions = units.filter(u => u.substitute && String(u.substitute).trim()).map(u => `${u.id}: ${u.tool || 'named tool'} replaced by ${String(u.substitute).trim()}`)
substitutions.forEach(x => notes.push('tool substituted (named tool cannot run headless here): ' + x))
const GENERATED = plan.generatedOutputs === 'build'
  ? 'Generated outputs are NOT committed: commit the generator and its inputs only, make sure version control ignores the outputs, and make sure the project\'s build (or its asset step) runs the generator before anything that reads the outputs (validator, import, export).'
  : 'Generated outputs are committed next to the generator and its inputs.'
log(`${units.length} make units for ${assets.length} assets; tiers: ${tiers.join(', ') || 'none'}; generated outputs: ${plan.generatedOutputs}; look-dev: ${capturing ? 'captured' : 'not captured'}`)

// ---------- Before ----------
const FRAMES = { type: 'object', properties: { command: { type: 'string', description: 'the capture command used, built from the lookdev-capture recipe if the project had none' }, frames: { type: 'array', items: { type: 'string' }, description: 'each "<file> : scene / camera / renderer or tier, size WxH"' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['frames'] }
const captureCmd = (when, built) => built ? built : look.commandFound && look.command ? look.command
  : when === 'before the change' ? 'no capture command (the project has none): build one from the skill\'s capture command recipe as a script outside shipping configuration, use it, and return it in command; if it cannot be built here, return no frames and say why in problems'
  : 'the capture command the before step built'
const captureBrief = (when, built) => `Capture the look-dev frames ${when}, following the technical-artist lookdev-capture skill exactly: ${JSON.stringify(look.frames || [])} with ${captureCmd(when, built)}, into ${look.outDir || 'a frames directory the project profile names'}. Name each file <scene>-<camera>-<renderer or tier>-${when === 'before the change' ? 'before' : 'after'}. Capture in capture mode through the project\'s capture hook (${look.hook && look.hook !== 'none' ? look.hook : 'none exists: do not hand-edit shipping configuration; use an override that changes no committed file if the engine allows one, otherwise capture with the overlays and say so'}) so overlays (${look.overlays || 'find them: autoloads, global singletons, persistent UI'}) stay out of the frame. ${when === 'before the change' ? 'Render from the base commit (a separate worktree of the base branch) so the frames show the state before this work, even if the working branch already has changes. ' : 'Render from the working tree with the same command, size, frame and driver as the before frames. '} Check every frame is the requested size and is not black, blank or captured before the scene settled; re-capture any that fail. Write a greyscale copy of each. Change no project files except the frames. Return the capture command used, the frame files with what each shows, and anything you could not capture in problems.`
let before = null
if (capturing) {
  phase('Before')
  before = await agent(captureBrief('before the change'), { schema: FRAMES, phase: 'Before', label: 'capture:before' })
  if (!before || !strings(before.frames).length) notes.push('look-dev capture pending, before frames missing: ' + (before ? strings(before.problems).join('; ') : 'capture step returned nothing'))
}

// ---------- Make ----------
phase('Make')
const MADE = {
  type: 'object',
  properties: {
    unit: { type: 'string' },
    assets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
          measured: { type: 'string', description: 'tris per LOD, verts, texture memory per tier, materials, file size' },
          maps: { type: 'array', items: { type: 'string' }, description: 'each "<file>: <role> <sRGB|linear> <size>; import settings <settings file>: mipmaps, compression, colour space, normal-map flag" for texture maps' },
        },
        required: ['name', 'files', 'measured'],
      },
    },
    source: { type: 'string', description: 'DCC source path, or generator path + inputs + seed + command' },
    substitution: { type: 'string', description: 'when the planned tool was replaced because it cannot run headless here: "<named tool> -> <tool used>: <why>", also stated in each provenance record; empty otherwise' },
    regenerates: { type: 'string', description: 'for generated units: "identical" when a second run of the command gave byte-identical outputs, else what differed; "n/a" for authored' },
    manifestLines: { type: 'array', items: { type: 'string' } },
    provenanceRecords: { type: 'array', items: { type: 'string' } },
    non_original: { type: 'array', items: { type: 'string' }, description: 'each third-party item used (texture, scan, font, code) with its source and licence; empty when all is original' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['unit', 'assets', 'source', 'regenerates', 'manifestLines', 'provenanceRecords'],
}
const skillFor = (u) => u.method === 'authored' ? 'realtime-asset-authoring' : 'procedural-assets'
const made = await pipeline(units, u => agent(
  `You are a technical-artist making one make unit, "${u.id}" (${u.method}, ${u.kind}), which produces: ${strings(u.assets).join(', ')}.\n` +
  `Briefs:\n${strings(u.assets).map(n => `- ${n}: ${(assets.find(a => a.name === n) || {}).brief || u.notes || ''}`).join('\n')}\n` +
  `Conventions: ${plan.conventions}\nBudget: ${u.budget}\n` +
  (tiers.length ? `Quality tiers (lowest first): ${tiers.join(', ')}. Tier variants for this unit: ${strings(u.tierVariants).join('; ') || 'one variant for every tier'}.\n` : '') +
  `Follow the technical-artist skills ${skillFor(u)}, materials-shaders, lods-optimization and asset-provenance, and the checklist in realtime-asset-authoring/asset-checklist.md.\n` +
  (u.substitute ? `The planned tool cannot run headless here (${u.tool || 'named tool'}); generate with ${u.substitute} instead, keep the same output contract, and record the substitution in substitution and in every provenance record for this unit.\n` : '') +
  (u.method === 'authored' ? '' : `Regenerate with: ${u.command || 'a single command you add and report'}. Run it twice and compare the outputs byte for byte; report the result in regenerates. ${GENERATED}\n`) +
  `Write files ONLY under: ${strings(u.writes).join(', ')}. Do NOT edit any shared file: not the manifest, not the provenance log, not shared materials or shaders. ` +
  'Instead return the exact manifest lines and one provenance record per asset for the Check step to apply, and list every third-party item you used in non_original. ' +
  MATERIAL_RULES + ' ' +
  'Write the engine\'s import settings next to every texture you write (from the generator, or the export step for authored maps) and list each in maps. Run the project validator on your files, and report measured numbers per asset (per tier where they differ) and any open issues honestly.',
  { schema: MADE, phase: 'Make', label: `make:${u.id}` },
))
const results = units.map((u, i) => made[i] ? made[i] : { unit: u.id, assets: strings(u.assets).map(n => ({ name: n })), failed: true })
const failed = results.filter(r => r.failed).map(r => r.unit)
if (failed.length === results.length) return { status: 'blocked', stage: 'make', blockers: ['every make agent failed'], failed }
results.filter(r => !r.failed && r.substitution && String(r.substitution).trim() && !substitutions.some(x => x.startsWith(r.unit + ':')))
  .forEach(r => notes.push(`tool substituted (named tool cannot run headless here): ${r.unit}: ${r.substitution}`))
results.filter(r => !r.failed && r.regenerates && !/^(identical|n\/a)$/i.test(String(r.regenerates).trim()))
  .forEach(r => notes.push(`${r.unit}: regeneration not byte-identical: ${r.regenerates}`))

// ---------- Check (with fix loop) ----------
phase('Check')
const CHECK = {
  type: 'object',
  properties: {
    perAsset: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          verdict: { type: 'string', enum: ['pass', 'fail', 'unverified'] },
          problems: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'verdict'],
      },
    },
    familyProblems: { type: 'array', items: { type: 'string' } },
  },
  required: ['perAsset'],
}
// The shared files are written once, by a step of their own, so the
// check that follows only reads.
const APPLIED = { type: 'object', properties: { applied: { type: 'boolean' }, skipped: { type: 'array', items: { type: 'string' } } }, required: ['applied'] }
const apply = await agent(
  `You are the technical-artist recording the asset family "${family}". Results:\n${JSON.stringify(results, null, 2)}\n` +
  'Using the asset-provenance skill: apply ALL returned manifest lines and provenance records to the shared manifest and provenance log, in one edit each, skipping failed units. Report whether both were applied and which assets you skipped. Failed make units: ' + JSON.stringify(failed),
  { schema: APPLIED, phase: 'Check', label: 'apply' },
)
const applied = !!(apply && apply.applied)
const allNames = units.flatMap(u => strings(u.assets))
let review = null
let open = []
for (let round = 1; round <= 3; round++) {
  review = await agent(
    `You are the technical-artist giving an independent check of the asset family "${family}" (round ${round}), which you did not make.\nConventions: ${plan.conventions}\nTiers: ${tiers.join(', ') || 'none'}\nGenerated outputs: ${plan.generatedOutputs}. ${GENERATED}\nResults:\n${JSON.stringify(results, null, 2)}\n` +
    'Using the skills realtime-asset-authoring (asset-checklist.md), materials-shaders, art-budgets-profiling and asset-provenance: check each asset against its budget and the checklist, run the project validator, and check the set as one family (consistent scale, texel density, style; distinct silhouette and value for gameplay objects from the gameplay camera). ' +
    MATERIAL_RULES + ' ' +
    'For generated units, run the regenerate command into a scratch directory or a separate worktree, never over the working tree, and diff its outputs against the working tree; confirm the generated-output policy holds (ignored and built, or committed). ' +
    'Read back the engine import settings written next to every texture (rule 4) and fail any texture left on engine defaults or with a setting that does not match its role. Check that a substituted tool is recorded in the asset\'s provenance record. Also check the shared manifest and provenance log entries for these assets. Read-only: do not edit anything; list every problem per asset. Mark an asset "unverified" if you could not check it, never drop it. Failed make units: ' + JSON.stringify(failed),
    { schema: CHECK, phase: 'Check', label: `check:${round}`, independent: true },
  )
  if (!review) { open = allNames.map(n => `${n}: unverified (checker returned nothing)`); continue }
  open = (review.perAsset || []).filter(a => a.verdict !== 'pass').map(a => `${a.name}: ${a.verdict} ${(a.problems || []).join('; ')}`)
    .concat(review.familyProblems || [])
  const seen = (review.perAsset || []).map(a => a.name)
  allNames.forEach(n => { if (!seen.includes(n)) open.push(`${n}: unverified (not reported by checker)`) })
  if (!open.length) break
  if (round < 3) {
    await agent(
      `You are a technical-artist fixing check findings for "${family}". Follow the same skills as the makers. Open items:\n${open.join('\n')}\n` +
      'Fix each in the unit\'s own files; for a generated asset, fix the generator or its inputs and regenerate, never the output by hand. If a fix changes a manifest or provenance entry, make that single edit yourself (you are the only agent running now). Report what you fixed.',
      { phase: 'Check', label: `fix:${round}` },
    )
  }
}
if (!applied) open.push('shared manifest and provenance log not applied')
failed.forEach(id => { if (!open.some(o => o.startsWith(id + ':'))) open.push(`${id}: make agent failed; its assets were not created`) })
if (open.length) return { status: 'blocked', stage: 'check', open, results, notes }

// ---------- After: capture again and compare ----------
const LOOK = { type: 'object', properties: { problems: { type: 'array', items: { type: 'string' }, description: 'each a visible failure against a brief or readability criterion, with the frame' }, notes: { type: 'array', items: { type: 'string' } } }, required: ['problems'] }
let after = null
if (capturing) {
  phase('After')
  let lookOpen = []
  for (let round = 1; round <= 2; round++) {
    after = await agent(captureBrief('after the change', before && before.command), { schema: FRAMES, phase: 'After', label: `capture:after:${round}` })
    if (!after || !strings(after.frames).length) { lookOpen = ['after frames missing: ' + (after ? strings(after.problems).join('; ') : 'capture step returned nothing')]; break }
    const judged = await agent(
      `You are a technical-artist giving an independent look review of the asset family "${family}", which you did not make. Do not edit anything.\n` +
      `Before frames: ${JSON.stringify(before ? before.frames : [])}\nAfter frames: ${JSON.stringify(after.frames)}\nBriefs: ${JSON.stringify(assets)}\n` +
      'Open every frame and its greyscale copy (lookdev-capture skill, "Judge"). Compare before and after side by side from the same camera. Check each asset against its brief and the project\'s art direction and readability criteria (visual target): gameplay objects tell apart by value in greyscale, silhouette and colour from the gameplay camera, on every tier captured; nothing reads washed out, too dark, blown out or noisy; higher tiers add to the base look rather than change what reads. A frame from a software renderer judges values and readability, not final GPU features. Put only visible failures in problems; everything else in notes.',
      { schema: LOOK, phase: 'After', label: `look:${round}`, independent: true },
    )
    if (!judged) { lookOpen = ['look review returned nothing']; break }
    strings(judged.notes).forEach(n => notes.push('look: ' + n))
    lookOpen = strings(judged.problems)
    if (!lookOpen.length || round === 2) break
    await agent(
      `You are a technical-artist fixing look review findings for "${family}". Follow the same skills as the makers and keep the Check rules (${MATERIAL_RULES}) true. Findings:\n- ${lookOpen.join('\n- ')}\n` +
      'Fix each in the owning unit\'s files (generator or inputs for generated assets, then regenerate), re-run the project validator, and report what you changed.',
      { phase: 'After', label: `look-fix:${round}` },
    )
  }
  if (lookOpen.length) return { status: 'blocked', stage: 'after', open: lookOpen, results, before: before && before.frames, after: after && after.frames, notes }
}

// ---------- Docs: Do then Check ----------
phase('Docs')
const DOCS = { type: 'object', properties: { pages: { type: 'array', items: { type: 'string' } }, undocumented: { type: 'array', items: { type: 'string' } } }, required: ['pages', 'undocumented'] }
const docs = await agent(
  `You are the technical-artist documenting the asset batch "${family}". Planned doc kinds: ${JSON.stringify(plan.docKinds)}. Make units: ${JSON.stringify(results.map(r => ({ unit: r.unit, source: r.source, assets: (r.assets || []).map(a => ({ name: a.name, measured: a.measured })) })))}\n` +
  DOCS_FRAGMENT + ' Use the project\'s docs location and Diataxis guide from its profile. Typical: generator → reference (parameters, command, outputs, whether outputs are committed or built) + how-to (make a variant); new budgets or conventions → reference + explanation; tier variants → reference (what each tier gets).' +
  (after ? ` Where the project shows look-dev frames in its docs, use the after frames: ${JSON.stringify(after.frames)}.` : ''),
  { schema: DOCS, phase: 'Docs', label: 'docs:do' },
)
if (!docs) return { status: 'blocked', stage: 'docs', open: ['docs writer returned nothing'], results, notes }
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
// The check only reads, so it stays independent of the docs it judges;
// fixes are their own step, followed by a fresh check.
const docCheckPrompt = `Review the documentation pages just written for the asset batch "${family}" (writer's report: ${JSON.stringify(docs)}). ` +
  'Check that every touched page holds one Diataxis kind only, how-to titles name a goal, explanation titles read with "About", reference matches sibling pages, and links connect the kinds. Read-only: do not edit anything; report every problem with its page.'
let docCheck = await agent(docCheckPrompt, { schema: DOCCHECK, phase: 'Docs', label: 'docs:check', independent: true })
if (docCheck && !docCheck.ok && (docCheck.problems || []).length) {
  const docFix = await agent(`Fix these documentation problems with the smallest edits, touching only the pages they name; leave anything that needs a content decision:\n- ${docCheck.problems.join('\n- ')}`, { phase: 'Docs', label: 'docs:fix' })
  if (docFix) docCheck = await agent(docCheckPrompt, { schema: DOCCHECK, phase: 'Docs', label: 'docs:recheck', independent: true })
}
if (!docCheck) notes.push('docs check returned nothing; review the pages by hand')
else if (!docCheck.ok) return { status: 'blocked', stage: 'docs', open: (docCheck.problems && docCheck.problems.length) ? docCheck.problems : ['docs check failed without details'], results, notes }

// ---------- Handoff ----------
phase('Handoff')
const HANDOFF = { type: 'object', properties: { branch: { type: 'string' }, pr: { type: 'string' }, head_sha: { type: 'string' }, tests_pass: { type: 'boolean' }, problem: { type: 'string' } }, required: ['branch', 'tests_pass'] }
const handoff = await agent(
  `Hand off the asset batch "${family}". ${where} Commit everything this run changed with Conventional Commits (engineering-practices git-workflow skill), following the generated-output policy: ${GENERATED} ` +
  `Push the branch; if no pull request is open for it, open a draft PR titled as a Conventional Commit${wp ? ` with "Refs: ${wp}" in the body` : ''}, with the measured numbers per asset against budget, the tier variants, the docs pages by Diataxis kind${after ? ' and the before and after frames' : ''}${notes.some(n => n.startsWith('tool substituted')) ? ', a "Tool substitutions" section: ' + notes.filter(n => n.startsWith('tool substituted')).join('; ') : ''}${hookProposal ? ', the ' + hookProposal : ''}${caveats.length ? ', and a "Known risks" section: ' + caveats.join('; ') : ''}. ` +
  'Do not mark it ready, request review or merge: the engineering-practices workflow named in the result does that. Run the project\'s tests and asset validator on the pushed head. Return the branch, PR URL, head commit SHA, and whether the tests and validator pass on that head.',
  { schema: HANDOFF, phase: 'Handoff', label: 'handoff' },
)
if (!handoff || !handoff.branch) return { status: 'blocked', stage: 'handoff', open: ['hand-off failed; the work is in the working tree but may not be committed or pushed'], results, notes }
if (!handoff.tests_pass) return { status: 'blocked', stage: 'handoff', open: ['tests or asset validator not green on the pushed head' + (handoff.problem ? ': ' + handoff.problem : '')], results, notes }

const non_original = results.flatMap(r => strings(r.non_original))
return {
  status: docCheck ? 'done' : 'done-docs-unverified',
  results,
  tiers,
  generatedOutputs: plan.generatedOutputs,
  before: before ? before.frames : [],
  after: after ? after.frames : [],
  docs: docs.pages,
  undocumented: docs.undocumented,
  caveats,
  substitutions: notes.filter(n => n.startsWith('tool substituted')),
  captureHookProposal: hookProposal,
  notes,
  handoff: {
    from: 'technical-artist:asset-batch',
    branch: handoff.branch,
    pr: handoff.pr || '',
    head_sha: handoff.head_sha || '',
    tests_pass: true,
    docs: docs.pages || [],
    undocumented: docs.undocumented || [],
    non_original,
    notes: caveats.concat(notes),
  },
  next: wp
    ? `ship it without rebuilding: /engineering-practices:deliver-package { wp: "${wp}", prior: <this result> }; after the code reviewer passes, /engineering-practices:land-pr { pr: "<the PR>" }`
    : `land it (it marks the PR ready, asks the code reviewer, polls CI and squash-merges once passed): /engineering-practices:land-pr ${handoff.pr ? `{ pr: "${handoff.pr}" }` : `{ branch: "${handoff.branch}" }`}`,
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
