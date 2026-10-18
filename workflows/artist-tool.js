// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'artist-tool',
  description: 'Turn a slow or error-prone art workflow step into a small, tested, documented tool, import rule or validator check, trialled against real assets. Use when artists repeat a manual step or keep shipping the same asset error. args: { problem: "what hurts, for whom", users?: "who uses it", kind?: "tool" | "import-rule" | "validator-rule" }',
  phases: [
    { title: 'Plan', detail: 'brief, smallest useful version, test assets, doc kinds via the compass' },
    { title: 'Do', detail: 'build the tool or rule with tests' },
    { title: 'Check', detail: 'code review, tests, artist trial against the brief; fix loop; then the reviewer\'s nits applied' },
    { title: 'Docs', detail: 'how-to and reference for the tool, then up to three independent checks and two fixes' },
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

const problem = args && args.problem
if (!problem) return 'Usage: artist-tool with args { problem: "normal maps keep getting imported as sRGB", users?: "environment artists", kind?: "validator-rule" }'
const users = (args && args.users) || 'the artists who do this task'
const kind = (args && args.kind) || 'tool'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs/<kind>/, keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

// ---------- Plan ----------
phase('Plan')
const BRIEF = {
  type: 'object',
  properties: {
    brief: { type: 'string', description: 'user, problem, current cost, done criteria, inputs/outputs, out of scope' },
    approach: { type: 'string', description: 'tool, preset, import rule or validator rule; where it lives; why not an existing feature' },
    files: { type: 'array', items: { type: 'string' } },
    testAssets: { type: 'array', items: { type: 'string' }, description: 'known-good and known-bad samples' },
    docKinds: { type: 'array', items: { type: 'string' } },
    needsOtherRole: { type: 'string', description: 'engine or CI changes needing graphics-programmer, gameplay-programmer or devops-engineer, or "none"' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['brief', 'approach', 'files', 'testAssets', 'docKinds'],
}
const plan = await agent(
  `You are the technical-artist. Follow engineering-practices project-onboarding, then the technical-artist skills artist-tools and asset-pipeline.\nProblem: ${problem}\nUsers: ${users}\nRequested kind: ${kind}\n` +
  'Investigate the current workflow (scripts, docs, recent asset fixes) and write a one-page brief. Prefer a pipeline rule or preset over a tool people must remember to run; check whether an existing feature already solves it. ' +
  'Choose the smallest useful version, name the files it will touch, list known-good and known-bad test assets, and list the doc kinds it needs via the Diataxis compass (a tool always needs a how-to and a reference page).',
  { schema: BRIEF, phase: 'Plan', label: 'brief' },
)
if (!plan) return 'blocked: planning failed (no brief returned).'
if (plan.blockers && plan.blockers.length) return { status: 'blocked', stage: 'plan', blockers: plan.blockers }

// ---------- Do ----------
phase('Do')
const build = await agent(
  `You are the technical-artist building: ${plan.approach}\nBrief: ${plan.brief}\nFiles: ${JSON.stringify(plan.files)}\nTest assets: ${JSON.stringify(plan.testAssets)}\n` +
  'Follow the artist-tools skill: one job, sensible defaults, dry-run or undo for destructive actions, errors that name the asset, the rule and the fix, no machine-specific paths, runs headless where possible. ' +
  'Write tests for the logic using the known-good and known-bad samples (create small sample assets if needed, with provenance records per asset-provenance). Run the tests. Report files changed and test results.',
  { phase: 'Do', label: 'build' },
)
if (!build) return { status: 'blocked', stage: 'do', blockers: ['build agent returned nothing'] }

// ---------- Check (fix loop) ----------
phase('Check')
const REVIEW = {
  type: 'object',
  properties: {
    testsPass: { type: 'boolean' },
    trial: { type: 'string', description: 'result of using it as the artist would, on real assets, against the done criteria' },
    blockers: { type: 'array', items: { type: 'string' } },
    nits: { type: 'array', items: { type: 'string' } },
  },
  required: ['testsPass', 'trial', 'blockers'],
}
let review = null
for (let round = 1; round <= 3; round++) {
  review = await agent(
    `Review the ${kind} built for: ${plan.brief}\nBuilder report: ${JSON.stringify(build)}\n` +
    'Act as both code reviewer (correctness, safety on failure, no data loss, no hard-coded paths, tests meaningful) and as the artist user: run it on real project assets the way they would, from the instructions alone, and judge it against the brief\'s done criteria. ' +
    'Blockers are anything that loses data, gives wrong results, fails tests, or that an artist could not use. Report blockers and nits separately.',
    { schema: REVIEW, phase: 'Check', label: `review:${round}`, independent: true },
  )
  if (!review) { review = { testsPass: false, trial: 'unverified: reviewer returned nothing', blockers: ['review not completed'] }; continue }
  if (review.testsPass && !(review.blockers || []).length) break
  if (round < 3) {
    await agent(
      `You are the technical-artist fixing review blockers for the ${kind}: ${JSON.stringify(review.blockers)}. Tests passing: ${review.testsPass}. Fix them, re-run the tests, report.`,
      { phase: 'Check', label: `fix:${round}` },
    )
  }
}
if (!review.testsPass || (review.blockers || []).length) return { status: 'blocked', stage: 'check', open: review.blockers, trial: review.trial }

// Nits get their own step once the blockers are gone: apply the small,
// plainly correct ones, keep the tests green, and carry the rest.
const NITS = { type: 'object', properties: { applied: { type: 'array', items: { type: 'string' } }, left: { type: 'array', items: { type: 'string' }, description: 'each nit not applied, with why' }, testsPass: { type: 'boolean' } }, required: ['applied', 'left', 'testsPass'] }
let nitsLeft = review.nits || []
if (nitsLeft.length) {
  const polish = await agent(
    `You are the technical-artist applying the reviewer's nits on the ${kind}:\n- ${nitsLeft.join('\n- ')}\nApply each one that is small and plainly correct; skip any that would change behaviour the trial approved or needs a decision, and say why. Re-run the tests after; revert any nit that breaks them. Commit. Return applied, left (with why) and whether the tests pass.`,
    { schema: NITS, phase: 'Check', label: 'apply-nits' },
  )
  if (polish && !polish.testsPass) return { status: 'blocked', stage: 'nits', open: ['tests fail after applying nits'], trial: review.trial }
  if (polish) nitsLeft = polish.left || []
}

// ---------- Docs ----------
phase('Docs')
const docs = await agent(
  `You are the technical-artist documenting the new ${kind}. Brief: ${plan.brief}. Planned doc kinds: ${JSON.stringify(plan.docKinds)}. Trial notes: ${review.trial}\n` +
  DOCS_FRAGMENT + ' At minimum: a how-to named for the artist\'s goal (not the tool\'s name) and a reference page (options, inputs, outputs, every error message and its fix). Add an explanation only if a real design trade-off was made; update the onboarding tutorial if new artists must use it. Use the project\'s docs location from its profile.',
  { phase: 'Docs', label: 'docs:do' },
)
if (!docs) return { status: 'blocked', stage: 'docs', open: ['docs writer returned nothing'] }
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
const DOCFIX = { type: 'object', properties: { pages: { type: 'array', items: { type: 'string' } }, left: { type: 'array', items: { type: 'string' }, description: 'each problem not fixed, with why' } }, required: ['pages'] }
// The check only reads, so it stays independent of the writing; fixes are
// their own step, each followed by a fresh check that confirms the last
// check's problems and anything the fix left. Up to three checks and two
// fixes; a problem still open after the last check blocks.
const docCheckPrompt = (prior) => `Review the documentation pages just written for the new ${kind} (writer's report: ${JSON.stringify(docs)}). Check one Diataxis kind per page, title patterns, reference format matches siblings, links between kinds, and that the how-to works when followed literally.${prior.length ? `\nThe last check found these problems and a fix step has tried to close them; confirm each against the pages now and report any still present, alongside anything new:\n- ${prior.join('\n- ')}` : ''} Read-only: do not edit anything; report every problem with its page.`
let docCheck = null
let prior = []
let docLeft = []
for (let round = 1; round <= 3; round++) {
  docCheck = await agent(docCheckPrompt(prior), { schema: DOCCHECK, phase: 'Docs', label: round === 1 ? 'docs:check' : `docs:recheck:${round - 1}`, independent: true })
  if (!docCheck) break
  // A problem the fix left for a content decision stays open whatever the
  // re-check says.
  const open = [...new Set([...(docCheck.problems || []), ...docLeft])]
  docCheck = { ok: docCheck.ok && !docLeft.length, problems: open }
  if (docCheck.ok || round === 3) break
  if (!open.length) { docCheck = { ok: false, problems: ['docs check failed without details'] }; break }
  const docFix = await agent(`Fix these documentation problems with the smallest edits, touching only the pages they name; leave anything that needs a content decision:\n- ${open.join('\n- ')}\nReturn pages: every page you edited or added, and left: any problem you did not fix, with why.`, { schema: DOCFIX, phase: 'Docs', label: `docs:fix:${round}` })
  if (!docFix) break
  docLeft = docFix.left || []
  prior = open
}
if (!docCheck) return { status: 'done-docs-unverified', trial: review.trial, nits: nitsLeft }
if (!docCheck.ok) return { status: 'blocked', stage: 'docs', open: (docCheck.problems && docCheck.problems.length) ? docCheck.problems : ['docs check failed without details'] }
return { status: 'done', trial: review.trial, nits: nitsLeft, needsOtherRole: plan.needsOtherRole || 'none' }
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
