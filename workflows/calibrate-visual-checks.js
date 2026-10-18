// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'calibrate-visual-checks',
  description: 'Turn readability criteria into automated checks on rendered frames and calibrate their thresholds: plan metrics, masks and a labelled set of known-good and known-bad captures, capture them (lookdev-capture skill), measure, set each threshold between good and bad with a margin, confirm on a holdout, attack the calibration independently, document it and push it as a handoff for engineering-practices deliver-package or land-pr. Use for value or luminance separation, contrast and colour-blind separation checks, or to re-tune existing ones. args: { criteria: "<criteria ids or text, or where the visual target writes them>", subjects: "<what must tell apart, e.g. the seven piece kinds>", existing?: "<existing check script, optional>", wp?: "<work package id>", branch?: "<existing branch>", pr?: "<existing PR>" }',
  phases: [
    { title: 'Plan', detail: 'criteria, metric and mask per check, CVD model, labelled good and bad cases with a holdout, tiers, doc kinds' },
    { title: 'Capture', detail: 'render the good cases and make the bad ones (lookdev-capture skill); check every frame' },
    { title: 'Calibrate', detail: 'measure every case, set thresholds between good and bad with a margin, write the check, its data and tests' },
    { title: 'Review', detail: 'independent read-only attack: holdout, overlap, masks, CVD model, every tier' },
    { title: 'Fix', detail: 'one agent fixes what the review found; only failures block' },
    { title: 'Docs', detail: 'write or update the planned Diataxis pages, then an independent check of one kind per page' },
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

const USAGE = 'usage: calibrate-visual-checks { criteria: "<criteria ids or text, or where the visual target writes them>", subjects: "<what must tell apart, e.g. the seven piece kinds on the board>", existing: "<existing check script, optional>", wp: "<work package id, optional>", branch: "<existing branch, optional>", pr: "<existing PR, optional>" }'
if (!args || !args.criteria || !args.subjects) return USAGE
const criteria = String(args.criteria)
const subjects = String(args.subjects)
const existing = args.existing ? String(args.existing) : ''
const wp = args.wp ? String(args.wp) : ''
const where = args.pr
  ? `Work on the existing PR ${args.pr} and its head branch; do not create a new branch or PR.`
  : args.branch
    ? `Work on the existing branch ${args.branch} (reuse its open PR if one exists); do not create a new branch.`
    : 'Work on the current feature branch; if you are on the default branch, cut a Conventional branch (feat/<slug>) from the latest remote default branch.'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs location (per the project profile), keep each page to one kind, title it by the project pattern (how-to names a goal, explanation reads "About ...", reference is named for the thing), and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'
const NOTES_RULE = 'Put a problem in the blocking list only if it is a failure you can point to: a held-out case the check gets wrong, a metric where good and bad cases overlap, a threshold not between the good and bad numbers it claims, a mask that misses its subject, a tier or renderer where the check gives a wrong answer, a test that fails. Everything else goes in notes.'

const strings = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const notes = []

const PLAN = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'short id, e.g. value-separation' },
          criterion: { type: 'string', description: 'the criterion it enforces, with its id in the visual target' },
          metric: { type: 'string', description: 'metric and statistic (visual-acceptance-checks skill), pairwise over subjects, worst pair' },
          mask: { type: 'string', description: 'how per-subject pixels are found: engine ID pass, or fixed regions of a deterministic frame' },
          cvd: { type: 'string', description: 'simulation model and types, or "none"' },
        },
        required: ['id', 'criterion', 'metric', 'mask', 'cvd'],
      },
    },
    good: { type: 'array', items: { type: 'string' }, description: 'known-good cases: frames the art direction accepted, each "id: scene / camera / tier"' },
    bad: { type: 'array', items: { type: 'string' }, description: 'known-bad cases, one fault each, each "id: base frame + the fault"' },
    holdout: { type: 'array', items: { type: 'string' }, description: 'ids of one good and one bad case kept out of calibration' },
    tiers: { type: 'array', items: { type: 'string' } },
    capture: { type: 'object', properties: { possible: { type: 'boolean' }, command: { type: 'string' }, outDir: { type: 'string' }, why: { type: 'string' } }, required: ['possible'] },
    files: { type: 'array', items: { type: 'string' }, description: 'check script, threshold data file, tests, fixtures' },
    ci: { type: 'string', description: 'the command CI runs and who owns the pipeline change' },
    docKinds: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation'] }, page: { type: 'string' }, why: { type: 'string' } }, required: ['kind', 'page', 'why'] } },
    blockers: { type: 'array', items: { type: 'string' }, description: 'only what stops the work: no criteria to enforce, no way to render frames' },
    caveats: { type: 'array', items: { type: 'string' } },
  },
  required: ['checks', 'good', 'bad', 'holdout', 'tiers', 'capture', 'files', 'ci', 'docKinds'],
}
const CASES = { type: 'object', properties: { cases: { type: 'array', items: { type: 'string' }, description: 'each "<id> <good|bad>: <file>, size WxH, driver"' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['cases'] }
const CAL = {
  type: 'object',
  properties: {
    thresholds: { type: 'array', items: { type: 'string' }, description: 'each "<check id>: threshold <t>; worst good <g>; best bad <b>; worst pair <subjects>"' },
    overlap: { type: 'array', items: { type: 'string' }, description: 'each check where good and bad overlap, with the numbers' },
    holdout: { type: 'array', items: { type: 'string' }, description: 'each "<case id>: expected <pass|fail>, got <pass|fail>"' },
    perTier: { type: 'array', items: { type: 'string' }, description: 'each "<tier>: <check id> pass|fail <value>" on the current art' },
    tests_pass: { type: 'boolean' },
    branch: { type: 'string' },
    command: { type: 'string' },
    non_original: { type: 'array', items: { type: 'string' }, description: 'third-party code or data used (e.g. a CVD matrix set or colour library) with source and licence' },
  },
  required: ['thresholds', 'overlap', 'holdout', 'perTier', 'tests_pass', 'branch', 'command'],
}
const REVIEW = { type: 'object', properties: { problems: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['problems'] }
const FIX = { type: 'object', properties: { fixed: { type: 'array', items: { type: 'string' } }, failing: { type: 'array', items: { type: 'string' } }, thresholds: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['fixed', 'failing'] }
const DOCS = { type: 'object', properties: { pages: { type: 'array', items: { type: 'string' } }, undocumented: { type: 'array', items: { type: 'string' } } }, required: ['pages', 'undocumented'] }
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
const HANDOFF = { type: 'object', properties: { branch: { type: 'string' }, pr: { type: 'string' }, head_sha: { type: 'string' }, tests_pass: { type: 'boolean' }, problem: { type: 'string' } }, required: ['branch', 'tests_pass'] }

phase('Plan')
const plan = await agent(
  `You are the technical-artist calibrating visual acceptance checks. Onboard first (engineering-practices project-onboarding), then follow the technical-artist skills visual-acceptance-checks and lookdev-capture. Criteria: ${criteria}\nSubjects that must tell apart: ${subjects}\n` +
  (existing ? `An existing check is named: ${existing}. Read it and its thresholds first; this run re-calibrates it rather than writing a new one.\n` : '') +
  'Read the criteria in the project\'s visual target; if there are none to enforce, put "no readability criteria; run /technical-artist:visual-target first" in blockers. Plan one check per criterion with its metric, its per-subject mask and its colour-vision-deficiency model where colour matters. ' +
  'Plan the labelled set: known-good frames the art direction accepted, and known-bad frames made from them with one fault each, enough that every check has at least one bad case it must fail; keep one good and one bad case as a holdout. Name the tiers to run on, the capture command (or possible false with the reason), the files, and the command CI will run and who owns that pipeline change. Plan docs with the Diataxis compass. Only what stops the work goes in blockers. Do not edit files.',
  { schema: PLAN, phase: 'Plan', label: 'plan' })
if (!plan) return 'blocked: planning failed (no plan returned) for the visual checks'
if (strings(plan.blockers).length) return { status: 'blocked', stage: 'plan', open: strings(plan.blockers) }
const checks = Array.isArray(plan.checks) ? plan.checks.filter((c) => c && c.id) : []
if (!checks.length) return 'blocked: planning returned no checks'
if (!strings(plan.good).length || !strings(plan.bad).length) return { status: 'blocked', stage: 'plan', open: ['the labelled set needs at least one known-good and one known-bad case'] }
if (strings(plan.holdout).length < 2) return { status: 'blocked', stage: 'plan', open: ['plan a holdout of one good and one bad case'] }
if (!plan.capture || !plan.capture.possible) return { status: 'blocked', stage: 'plan', open: ['cannot render the frames: ' + ((plan.capture && plan.capture.why) || 'no capture route')] }
const caveats = strings(plan.caveats)
const spec = `Checks:\n${checks.map((c) => `- ${c.id}: ${c.criterion}; metric ${c.metric}; mask ${c.mask}; CVD ${c.cvd}`).join('\n')}\nGood: ${strings(plan.good).join('; ')}\nBad: ${strings(plan.bad).join('; ')}\nHoldout: ${strings(plan.holdout).join(', ')}\nTiers: ${strings(plan.tiers).join(', ') || 'one'}`
log(`${checks.length} checks, ${strings(plan.good).length} good and ${strings(plan.bad).length} bad cases`)

phase('Capture')
const cases = await agent(
  `Make the labelled set for these visual checks, following the technical-artist lookdev-capture skill exactly.\n${spec}\nRender every good case with ${plan.capture.command || 'the project\'s capture command'} into ${plan.capture.outDir || 'the fixtures directory the plan names'}, on each tier listed. Make each bad case from its base frame with its one fault, by a script (so it can be remade) or by a render with a changed setting. Render or derive each check\'s masks the way the plan says. Check every frame and mask as the skill says (size, not black, settled, mask covers its subject). Change no project files except the fixtures and the script that makes the bad cases. Return every case with its file, and anything you could not make in problems.`,
  { schema: CASES, phase: 'Capture', label: 'capture' })
if (!cases || !strings(cases.cases).length) return { status: 'blocked', stage: 'capture', open: cases ? strings(cases.problems) : ['capture step returned nothing'] }
strings(cases.problems).forEach((p) => notes.push('capture: ' + p))

phase('Calibrate')
const cal = await agent(
  `Calibrate the visual checks following the technical-artist visual-acceptance-checks skill (Method steps 3 to 8). ${where}\n${spec}\nCases:\n- ${strings(cases.cases).join('\n- ')}\n` +
  `Write the check script and a data file holding each threshold with the worst-good and best-bad numbers it came from, in: ${strings(plan.files).join(', ')}. Measure every case outside the holdout. For each check set the threshold between the worst good and the best bad value with a margin; if they overlap, do not set one: report the check in overlap. Then run the holdout and every tier's current frames. ` +
  'Add tests that run the check on the labelled cases (every good passes, every bad fails). Run them and the project tests. Write the code in the language the project profile names for tools. Commit with Conventional Commits. Log every third-party item (code, published simulation matrices, colour libraries) per the asset-provenance skill. Return the thresholds with their numbers, any overlap, the holdout results, the per-tier results on the current art, whether the tests pass, the branch, the check command and the non-original items (empty if none).',
  { schema: CAL, phase: 'Calibrate', label: 'calibrate' })
if (!cal) return { status: 'blocked', stage: 'calibrate', open: ['calibrate step returned nothing'] }
const failedHoldout = strings(cal.holdout).filter((h) => { const m = h.match(/expected\s+(pass|fail).*got\s+(pass|fail)/i); return !m || m[1].toLowerCase() !== m[2].toLowerCase() })
const calOpen = strings(cal.overlap).map((o) => 'good and bad overlap: ' + o).concat(failedHoldout.map((h) => 'holdout wrong: ' + h))
if (!cal.tests_pass) calOpen.push('check tests not green')
// Current art failing a calibrated check is a finding for the art, not a
// reason to move the threshold, so it is reported and never blocks.
strings(cal.perTier).filter((t) => /\bfail\b/i.test(t)).forEach((t) => notes.push('current art fails: ' + t))

phase('Review')
const review = await agent(
  `You are a technical-artist giving an independent review of visual acceptance checks and their calibration, which you did not write. Do not edit any file.\n${spec}\nThresholds: ${strings(cal.thresholds).join('; ')}\nHoldout: ${strings(cal.holdout).join('; ')}\nPer tier: ${strings(cal.perTier).join('; ')}\nCommand: ${cal.command}\n` +
  'Run the check on every labelled case and the holdout yourself. Try to break it (visual-acceptance-checks skill, failure modes): a threshold fitted to the current art, a bad case it passes, a metric averaged over pairs or whole frames, masks that miss or spill, CVD simulation in the wrong colour space or model, a tier or renderer where it answers wrongly, thresholds whose recorded good and bad numbers do not match a re-measurement. ' + NOTES_RULE,
  { schema: REVIEW, phase: 'Review', label: 'review', independent: true })
if (!review) notes.push('review returned nothing; the calibration is unverified')
const problems = calOpen.concat(review ? strings(review.problems) : [])
if (review) strings(review.notes).forEach((n) => notes.push('review: ' + n))
let thresholds = strings(cal.thresholds)

if (problems.length) {
  phase('Fix')
  const fix = await agent(
    `Fix these problems in the visual checks in one pass, following the technical-artist visual-acceptance-checks skill, in the planned files only:\n${spec}\n- ${problems.join('\n- ')}\n` +
    'Where good and bad overlap, change the mask, statistic or metric, never the threshold alone; add labelled cases if a fault has none. Never loosen a threshold to let current art pass. Re-measure, re-run the holdout and tests, commit. Return what you fixed, each problem that still fails (one line each), the thresholds now set with their numbers, and notes. ' + NOTES_RULE,
    { schema: FIX, phase: 'Fix', label: 'fix' })
  if (!fix) return { status: 'blocked', stage: 'fix', open: problems, notes }
  strings(fix.notes).forEach((n) => notes.push('fix: ' + n))
  if (strings(fix.failing).length) return { status: 'blocked', stage: 'fix', open: strings(fix.failing), notes }
  if (strings(fix.thresholds).length) thresholds = strings(fix.thresholds)
}

phase('Docs')
const docKinds = Array.isArray(plan.docKinds) ? plan.docKinds : []
const docs = await agent(
  'Document the visual acceptance checks in the same PR. Planned pages:\n' +
  (docKinds.length ? docKinds.map((d) => `- ${d.kind}: ${d.page} (${d.why})`).join('\n') : '- (none planned; re-run the compass)') +
  `\nThe reference page lists each check with its criterion, metric, mask, CVD model, threshold and the worst-good and best-bad numbers it came from (${thresholds.join('; ')}), and the command (${cal.command}); the explanation says why each threshold sits where it does; a how-to says how to add a labelled case and re-calibrate. ` + DOCS_FRAGMENT,
  { schema: DOCS, phase: 'Docs', label: 'docs:do' })
if (!docs) return { status: 'blocked', stage: 'docs', open: ['docs step failed'], notes }
const docCheckPrompt = `Review the documentation pages just written for the visual acceptance checks (writer's report: ${JSON.stringify(docs)}). ` +
  'Check that every touched page holds one Diataxis kind only, starts with a line saying its kind and audience, how-to titles name a goal, explanation titles read with "About", reference states every threshold with the numbers it came from, and links connect the kinds. Read-only: do not edit anything; report every problem with its page.'
let docCheck = await agent(docCheckPrompt, { schema: DOCCHECK, phase: 'Docs', label: 'docs:check', independent: true })
if (docCheck && !docCheck.ok && (docCheck.problems || []).length) {
  const docFix = await agent(`Fix these documentation problems with the smallest edits, touching only the pages they name; leave anything that needs a content decision:\n- ${docCheck.problems.join('\n- ')}`, { phase: 'Docs', label: 'docs:fix' })
  if (docFix) docCheck = await agent(docCheckPrompt, { schema: DOCCHECK, phase: 'Docs', label: 'docs:recheck', independent: true })
}
if (!docCheck) notes.push('docs check returned nothing; review the pages by hand')
else if (!docCheck.ok) return { status: 'blocked', stage: 'docs', open: (docCheck.problems && docCheck.problems.length) ? docCheck.problems : ['docs check failed without details'], notes }

phase('Handoff')
const handoff = await agent(
  `Hand off the visual acceptance checks. ${where} Make sure every commit is pushed to the branch (${cal.branch}); if no pull request is open for it, open a draft PR titled as a Conventional Commit${wp ? ` with "Refs: ${wp}" in the body` : ''}, with each check, its threshold and the numbers it came from, the holdout results, the per-tier results on the current art, the CI command (${plan.ci}) and the docs pages by Diataxis kind${caveats.length ? ', and a "Known risks" section: ' + caveats.join('; ') : ''}. ` +
  'Do not mark it ready, request review or merge: the engineering-practices workflow named in the result does that. Follow the engineering-practices git-workflow skill. Run the check tests and the project tests on the pushed head. Return the branch, PR URL, head commit SHA, and whether they pass on that head.',
  { schema: HANDOFF, phase: 'Handoff', label: 'handoff' })
if (!handoff || !handoff.branch) return { status: 'blocked', stage: 'handoff', open: ['hand-off failed; the work is committed on ' + cal.branch + ' but may not be pushed'], notes }
if (!handoff.tests_pass) return { status: 'blocked', stage: 'handoff', open: ['tests not green on the pushed head' + (handoff.problem ? ': ' + handoff.problem : '')], notes }

return {
  status: !review || !docCheck ? 'unverified' : 'done',
  checks: checks.map((c) => c.id),
  thresholds,
  holdout: strings(cal.holdout),
  perTier: strings(cal.perTier),
  command: cal.command,
  ci: plan.ci,
  docs: docs.pages,
  undocumented: docs.undocumented,
  caveats,
  notes,
  handoff: {
    from: 'technical-artist:calibrate-visual-checks',
    branch: handoff.branch,
    pr: handoff.pr || '',
    head_sha: handoff.head_sha || '',
    tests_pass: true,
    docs: docs.pages || [],
    undocumented: docs.undocumented || [],
    non_original: strings(cal.non_original),
    notes: caveats.concat(notes),
  },
  next: wp
    ? `ship it without rebuilding: /engineering-practices:deliver-package { wp: "${wp}", prior: <this result> }; after the code reviewer passes, /engineering-practices:land-pr { pr: "<the PR>" }`
    : `land it (it marks the PR ready, asks the code reviewer, polls CI and squash-merges once passed): /engineering-practices:land-pr ${handoff.pr ? `{ pr: "${handoff.pr}" }` : `{ branch: "${handoff.branch}" }`}`,
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
