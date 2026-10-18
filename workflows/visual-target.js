// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'visual-target',
  description: 'Define the visual target for a game or product before content production: research what the engine can render on each target, set quality tiers with frame budgets, a feature matrix and art budgets, hand the renderer and feature decision to the graphics-programmer, set measurable readability criteria, review, then propose follow-up work packages and write the Diataxis docs. Use when there are no tiers or acceptance criteria yet, or the target look changes. args: { scope: "what the target is for, e.g. the whole game", look?: "art direction or references, or where they are", tiers?: "wanted tiers and devices, or where they are", renderer?: "an existing renderer decision, or where it is written" }',
  phases: [
    { title: 'Plan', detail: 'inputs, existing tiers and budgets, docs plan (compass)' },
    { title: 'Research', detail: 'engine rendering capabilities, target hardware, the look, in parallel and read only' },
    { title: 'Renderer', detail: 'hand-off: the graphics-programmer decides the renderer path and features per tier' },
    { title: 'Tiers', detail: 'tiers with frame budgets, feature matrix, art budgets per tier' },
    { title: 'Readability', detail: 'measurable acceptance criteria per tier' },
    { title: 'Review', detail: 'critic checks feasibility and testability; one revision round' },
    { title: 'Packages', detail: 'follow-up work packages in the project format' },
    { title: 'Docs', detail: 'write the planned Diataxis pages, then verify one kind per page' },
  ],
}

// --- run-modes v1 begin ---
const RUN = ((a, realAgent, realPhase, realLog) => {
  const opted = !!(a && typeof a === 'object' && a.run && typeof a.run === 'object')
  const c = opted ? a.run : {}
  const mode = c.mode === 'inline' ? 'inline' : 'agents'
  const results = c.results && typeof c.results === 'object' ? c.results : {}
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
    const ph = op.phase || current
    const base = op.label || ph || 'agent'
    seen[base] = (seen[base] || 0) + 1
    const key = seen[base] > 1 ? `${base}#${seen[base]}` : base
    let note = null
    if (has(results, key)) {
      const gap = missing(results[key], op.schema)
      if (!gap) { out[key] = results[key]; return Promise.resolve(results[key]) }
      note = `answer missing ${gap}; answer this brief again`
    }
    if (!picked(ph, base)) { skipped.push(key); return Promise.resolve(null) }
    if (mode === 'agents') {
      return realAgent(prompt, opts).then((r) => { if (r !== null && r !== undefined) out[key] = r; return r })
    }
    next.push(note ? { key, phase: ph, prompt, schema: op.schema || null, note } : { key, phase: ph, prompt, schema: op.schema || null })
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
    if (value === '__run_halted__') {
      return {
        run: 'inline', status: 'next', next, results: out, skipped, logs,
        how: 'Do each brief in next yourself, in order: follow its prompt in this session (it may tell you to edit files, commit or push), and shape your answer to its schema when one is given, with every required field. A brief with a note was answered before without the fields it names. Add each answer to results under its key, then run this workflow again with the same args and run.results set to the merged results. Repeat until status is "done".',
      }
    }
    return { run: mode, status: 'done', result: value, results: out, skipped, logs }
  }
  return { agent, phase, log, finish, halted, error }
})(typeof args === 'undefined' ? undefined : args, agent, phase, log)
if (RUN.error) return RUN.error
const RUN_OUT = await Promise.race([RUN.halted, (async (agent, phase, log) => {
// --- run-modes v1 end (workflow body follows; close it with the tail line) ---

const scope = args && args.scope
if (!scope) return 'Usage: visual-target with args { scope: "the whole game", look?: "docs/explanation/art-direction.md", tiers?: "desktop high, mobile, web", renderer?: "docs path of an existing renderer decision" }'
const look = (args && args.look) || 'not given: find the art direction and references in the project'
const wantedTiers = (args && args.tiers) || 'not given: take the target platforms from the project profile'
const given = args && args.renderer

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs/<kind>/, keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

// ---------- Plan ----------
phase('Plan')
const PLAN = {
  type: 'object',
  properties: {
    inputs: { type: 'string', description: 'art direction, references, gameplay camera, smallest screen, target platforms, design readability needs, and where each is' },
    existing: { type: 'string', description: 'tiers, frame budgets, art budgets or renderer decisions that already exist, or "none"' },
    engine: { type: 'string', description: 'engine or framework and version from the project profile' },
    docKinds: { type: 'array', items: { type: 'string' } },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['inputs', 'existing', 'engine', 'docKinds'],
}
const plan = await agent(
  `You are the technical-artist defining the visual target for "${scope}". Follow engineering-practices project-onboarding, then the technical-artist skills art-budgets-profiling and materials-shaders.\n` +
  `Look: ${look}. Wanted tiers: ${wantedTiers}.\n` +
  'Collect the inputs: art direction and references, gameplay camera, smallest supported screen, target platforms, and what the game-designer says must stay readable. Note any tiers, budgets or renderer decisions that already exist; build on them rather than replacing them. ' +
  'Name the engine and version. List which documentation kinds this work will affect using the Diataxis compass. Block only if the engine or the target platforms are unknown; missing art direction is a gap to note, not a blocker.',
  { schema: PLAN, phase: 'Plan', label: 'plan' },
)
if (!plan) return 'blocked: planning failed (no result returned).'
if (plan.blockers && plan.blockers.length) return { status: 'blocked', stage: 'plan', blockers: plan.blockers }

// ---------- Research (parallel, read only) ----------
phase('Research')
const areas = [
  { key: 'engine', focus: 'the engine\'s rendering paths or backends and, for each, which lighting, global illumination, shadows, reflections, volumetrics, anti-aliasing, upscaling, post effects and particle features it offers and on which platforms; cite the engine\'s own documentation for the version in use' },
  { key: 'hardware', focus: 'the target platforms and their weakest supported devices: GPU class, memory, display resolution and refresh rate, thermal behaviour, browser limits for web builds; propose a tier set grouped by measured or documented capability, not by model name' },
  { key: 'look', focus: 'the art direction and references: the visual pillars, which rendering features the look depends on, what each tier must keep and what it may drop, and what gameplay must read (silhouette, value contrast, state changes) from the gameplay camera at the smallest screen' },
]
const RESEARCH = {
  type: 'object',
  properties: {
    area: { type: 'string' },
    findings: { type: 'array', items: { type: 'string' } },
    sources: { type: 'array', items: { type: 'string' }, description: 'docs, captures or references behind the findings' },
  },
  required: ['area', 'findings', 'sources'],
}
const found = await parallel(areas.map((a) => () => agent(
  `You are a technical-artist researching "${a.key}" for the visual target of "${scope}". Engine: ${plan.engine}. Inputs: ${plan.inputs}. Existing: ${plan.existing}.\n` +
  `Focus: ${a.focus}. Read documentation, the project and its references; do NOT modify any file. Separate fact (with a source) from judgement.`,
  { schema: RESEARCH, phase: 'Research', label: `research:${a.key}` },
)))
const research = areas.map((a, i) => found[i] || { area: a.key, findings: [], unverified: true })
const unresearched = research.filter((r) => r.unverified).map((r) => r.area)

// ---------- Renderer (hand-off to the graphics-programmer) ----------
phase('Renderer')
// Same shape as the graphics-programmer renderer-decision workflow's decision.
const DECISION = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['decided', 'pending'], description: 'pending while the graphics-programmer has not decided' },
    renderer: { type: 'string', description: 'rendering path or backend per tier, and why' },
    features: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          feature: { type: 'string' },
          perTier: { type: 'string' },
          costMs: { type: 'string' },
          evidence: { type: 'string' },
          fallback: { type: 'string' },
        },
        required: ['feature', 'perTier', 'costMs', 'evidence', 'fallback'],
      },
    },
    constraints: { type: 'array', items: { type: 'string' } },
    openQuestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['status', 'renderer', 'features', 'constraints'],
}
const question = `which rendering path and which lighting, shadow, reflection, volumetric, anti-aliasing, upscaling and post features each tier of "${scope}" gets`
const handoff = given
  ? `A renderer decision already exists: ${typeof given === 'string' ? given : JSON.stringify(given)}. Read it (open the file if this is a path) and return it in the answer shape with status "decided". Do not change it; if it does not cover a feature the look needs, list that under openQuestions and return status "pending".`
  : 'This decision belongs to the graphics-programmer, not to you. Hand it over:\n' +
    `1. If the graphics-programmer plugin is available to you, run /graphics-programmer:renderer-decision with args { question: ${JSON.stringify(question)}, tiers: <the tier proposal from the hardware research>, wants: <the look per tier from the look research> } and return its result.decision.\n` +
    '2. Otherwise send the same question, tiers and wanted look to whoever holds the graphics-programmer role in this project (the role map in the project profile; engineering-practices peer-coordination), and return status "pending" with what you asked under openQuestions, renderer "pending" and empty features and constraints.\n' +
    'Never decide the renderer or the feature set yourself.'
const decision = await agent(
  `You are the technical-artist on the visual target for "${scope}". Research:\n${JSON.stringify(research, null, 2)}\n` + handoff,
  // A given decision uses its own label, so a stored pending answer is not reused.
  { schema: DECISION, phase: 'Renderer', label: given ? 'renderer:given' : 'renderer' },
)
if (!decision) return { status: 'blocked', stage: 'renderer', open: ['the renderer hand-off returned nothing'], research }
if (decision.status === 'pending') {
  return {
    status: 'waiting-on-graphics-programmer',
    question,
    openQuestions: decision.openQuestions || [],
    resume: 'When the graphics-programmer has decided, run this workflow again with the same args plus renderer: <the decision or the docs page that holds it>. Pass run.results from this run as well to reuse the plan and research.',
  }
}

// ---------- Tiers ----------
phase('Tiers')
const TIERS = {
  type: 'object',
  properties: {
    tiers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          devices: { type: 'string', description: 'weakest example device and the class it stands for' },
          fps: { type: 'number' },
          frameMs: { type: 'string', description: 'frame budget in ms with its CPU and GPU split and headroom' },
          resolution: { type: 'string', description: 'output resolution and render scale' },
          look: { type: 'string', description: 'what this tier looks like in one or two sentences' },
        },
        required: ['name', 'devices', 'fps', 'frameMs', 'resolution', 'look'],
      },
    },
    matrix: { type: 'array', items: { type: 'string' }, description: 'one row per rendering feature: feature, then setting per tier, as decided by the graphics-programmer' },
    artBudgets: { type: 'array', items: { type: 'string' }, description: 'one row per tier: triangles, texture memory, draw calls, materials, overdraw, effect counts' },
  },
  required: ['tiers', 'matrix', 'artBudgets'],
}
const tierSet = await agent(
  `You are the technical-artist setting the quality tiers for "${scope}". Follow art-budgets-profiling. Research:\n${JSON.stringify(research, null, 2)}\n` +
  `Renderer decision from the graphics-programmer (take it as given; do not change features or costs):\n${JSON.stringify(decision, null, 2)}\n` +
  'For each tier write its weakest example device, target frame rate, frame budget in ms with its CPU and GPU split and some headroom, output resolution and render scale, and its look in a sentence. ' +
  'Turn the decision into a feature matrix row per feature. Derive art budgets per tier from the content share of the frame budget and the decision\'s constraints; label any number you did not measure as an estimate. Do not edit files yet.',
  { schema: TIERS, phase: 'Tiers', label: 'tiers' },
)
if (!tierSet) return { status: 'blocked', stage: 'tiers', open: ['tier agent returned nothing'], decision }

// ---------- Readability ----------
phase('Readability')
const CRITERIA = {
  type: 'object',
  properties: {
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'short id, e.g. R1' },
          criterion: { type: 'string', description: 'what must be true, e.g. every gameplay piece is told apart by shape and value, not hue alone' },
          tiers: { type: 'string', description: 'which tiers it applies to (usually all)' },
          check: { type: 'string', description: 'how to verify it: screenshot at the smallest screen, greyscale test, colour-vision simulation, effects-off comparison, capture' },
          threshold: { type: 'string', description: 'pass mark, e.g. minimum on-screen size in px or a value-contrast step' },
        },
        required: ['id', 'criterion', 'tiers', 'check', 'threshold'],
      },
    },
  },
  required: ['criteria'],
}
const readability = await agent(
  `You are the technical-artist setting acceptance criteria for the visual target of "${scope}". Inputs: ${plan.inputs}. Look research: ${JSON.stringify(research.find((r) => r.area === 'look'))}.\n` +
  `Tiers: ${JSON.stringify(tierSet.tiers)}\n` +
  'Write criteria a reviewer can check without taste: gameplay objects read from the gameplay camera at the smallest supported screen, by silhouette and value before colour; no information carried by hue alone; effects, fog, bloom or reflections never hide game state; every tier keeps the same readable set; the look per tier holds against the references. ' +
  'Give each a check and a pass threshold. Include frame-time criteria per tier (median and p95 within budget on the weakest device).',
  { schema: CRITERIA, phase: 'Readability', label: 'readability' },
)
if (!readability) return { status: 'blocked', stage: 'readability', open: ['readability agent returned nothing'], tiers: tierSet }

// ---------- Review (one revision round) ----------
phase('Review')
const REVIEW = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
const REVISED = {
  type: 'object',
  properties: { tiers: TIERS.properties.tiers, matrix: TIERS.properties.matrix, artBudgets: TIERS.properties.artBudgets, criteria: CRITERIA.properties.criteria },
  required: ['tiers', 'matrix', 'artBudgets', 'criteria'],
}
let target = { tiers: tierSet.tiers, matrix: tierSet.matrix, artBudgets: tierSet.artBudgets, criteria: readability.criteria }
const reviewPrompt = (t) =>
  `You are a second technical-artist reviewing the visual target for "${scope}". Renderer decision: ${JSON.stringify(decision)}\nTarget:\n${JSON.stringify(t, null, 2)}\n` +
  'Check: the matrix matches the renderer decision; art budgets fit inside each tier\'s frame budget; every tier has a weakest device and a measurable frame target; every feature off on a tier has a fallback that keeps readability; every criterion has a check and a threshold a reviewer can apply; no requirement names a vendor or tool the project does not use. Report problems; do not edit files.'
let review = await agent(reviewPrompt(target), { schema: REVIEW, phase: 'Review', label: 'review:1' })
if (review && !review.ok && review.problems && review.problems.length) {
  const revised = await agent(
    `You are the technical-artist revising the visual target for "${scope}". Fix every problem without changing the renderer decision:\n${JSON.stringify(review.problems)}\nCurrent target:\n${JSON.stringify(target, null, 2)}\nReturn the whole revised target.`,
    { schema: REVISED, phase: 'Review', label: 'revise:1' },
  )
  if (revised) target = revised
  review = await agent(reviewPrompt(target), { schema: REVIEW, phase: 'Review', label: 'review:2' })
}
if (!review) return { status: 'unverified', stage: 'review', note: 'review returned nothing', target }
if (!review.ok) return { status: 'blocked', stage: 'review', open: review.problems || [], target }

// ---------- Packages ----------
phase('Packages')
const PACKAGES = {
  type: 'object',
  properties: {
    packages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          role: { type: 'string', description: 'the job function that does it' },
          dependsOn: { type: 'string' },
          doneWhen: { type: 'string', description: 'one testable sentence, citing criteria ids where they apply' },
        },
        required: ['name', 'role', 'doneWhen'],
      },
    },
    added: { type: 'boolean', description: 'true if written into the project\'s work-package plan' },
    where: { type: 'string', description: 'where they were written, or who they were sent to' },
  },
  required: ['packages', 'added', 'where'],
}
const packages = await agent(
  `You are the technical-artist turning the visual target for "${scope}" into follow-up work. Follow engineering-practices work-packages.\nTarget:\n${JSON.stringify(target, null, 2)}\nRenderer decision: ${JSON.stringify(decision)}\n` +
  'Propose the packages that get the project from here to the target, each with one role and a testable done-when: usually a near-final target scene per tier to prove the look and the budgets on the weakest device; renderer and quality-setting work for the graphics-programmer; asset and material upgrades for the technical-artist; validator rules for the budgets; any criterion that needs a tool. ' +
  'If the project profile lets this role edit the work-package plan, add them there in its format; otherwise send them to the project-manager (peer-coordination) and say so in "where".',
  { schema: PACKAGES, phase: 'Packages', label: 'packages' },
)
if (!packages) return { status: 'blocked', stage: 'packages', open: ['packages agent returned nothing'], target }

// ---------- Docs ----------
phase('Docs')
const docs = await agent(
  `You are the technical-artist documenting the visual target for "${scope}". Planned doc kinds: ${JSON.stringify(plan.docKinds)}.\nTarget:\n${JSON.stringify(target, null, 2)}\nRenderer decision: ${JSON.stringify(decision)}\nResearch sources: ${JSON.stringify(research.map((r) => ({ area: r.area, sources: r.sources })))}\n` +
  DOCS_FRAGMENT + ' Typical: the tiers, feature matrix, art budgets and acceptance criteria as one reference page ("Visual target and quality tiers" or the project\'s pattern), linking the graphics-programmer\'s renderer reference rather than copying it; why the target and tiers are what they are, with sources, as an explanation ("About the visual target"); checking a scene against the criteria as a how-to if the team will repeat it. Use the project\'s docs location from its profile.',
  { phase: 'Docs', label: 'docs:do' },
)
if (!docs) return { status: 'blocked', stage: 'docs', open: ['docs writer returned nothing'], target, packages: packages.packages }
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
const docCheck = await agent(
  `Review the documentation pages just written for the visual target of "${scope}" (writer's report: ${JSON.stringify(docs)}). Check one Diataxis kind per page, title patterns (how-to names a goal; explanation reads with "About"), reference format matches siblings, links between kinds, and that numbers and criteria match the target. Fix small problems; report what remains.`,
  { schema: DOCCHECK, phase: 'Docs', label: 'docs:check' },
)
return {
  status: !docCheck ? 'done-docs-unverified' : !docCheck.ok ? 'blocked' : unresearched.length ? 'unverified' : 'done',
  tiers: target.tiers,
  matrix: target.matrix,
  artBudgets: target.artBudgets,
  criteria: target.criteria,
  renderer: decision.renderer,
  packages: packages.packages,
  packagesWhere: packages.where,
  unresearched,
  next: 'Docs and any plan rows are in the working tree, not committed. Ship them with /engineering-practices:deliver-package or /engineering-practices:small-change.',
  docProblems: docCheck ? (docCheck.problems || []) : ['docs check returned nothing'],
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
