// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'author-shader',
  description: 'Author or rework one shader (and the materials that use it) from an effect brief: write the effect down with its coverage, platforms, tiers, fallbacks, permutations and cost budget, capture look-dev frames before, build it on the project\'s shared material conventions, capture after, attack it in parallel independent read-only reviews (look, cost and permutations, platforms and fallbacks, artist parameters), fix, document it and push it as a handoff for engineering-practices deliver-package or land-pr. Targets only provable in CI (a platform-only toolchain, e.g. Metal from a Linux host) finish as pending_ci with the CI job named; re-run with ci_pending after CI to confirm or fix them. Builds on the materials-shaders and lookdev-capture skills. args: { shader: "<shader name>", brief: "<what it must look like and where it is used>", replaces?: "<existing shader or material, optional>", wp?: "<work package id>", branch?: "<existing branch>", pr?: "<existing PR>", ci_pending?: ["<target>: <CI job>", ...], docs?: [...], undocumented?: [...], notes?: [...], non_original?: [...] (resume: carried from the pending_ci result) }',
  phases: [
    { title: 'Plan', detail: 'effect, coverage, platforms and tiers, fallbacks, permutations, parameters, cost budget, look-dev frames, doc kinds' },
    { title: 'Before', detail: 'capture the look-dev frames on the current state (lookdev-capture skill)' },
    { title: 'Build', detail: 'shader, material instances, tier variants and fallbacks; compiles on every renderer it can reach, CI-only targets recorded as pending CI; cost measured' },
    { title: 'After', detail: 'capture the same frames with the new shader' },
    { title: 'Review', detail: 'parallel independent read-only reviews: look, cost and permutations, platforms and fallbacks, artist parameters' },
    { title: 'Fix', detail: 'one agent fixes what the reviews found and re-captures; only failures block, notes never do' },
    { title: 'Docs', detail: 'write or update the planned Diataxis pages, then an independent check of one kind per page' },
    { title: 'Handoff', detail: 'commit, push, open or reuse a draft PR, return a handoff for deliver-package or land-pr' },
    { title: 'CI', detail: 'resume only (ci_pending): read the named CI jobs on the PR head; confirm each pending target or fix it from the CI log' },
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

const USAGE = 'usage: author-shader { shader: "<shader name, e.g. SH_Water>", brief: "<what it must look like, where it is used, what it must communicate>", replaces: "<existing shader or material, optional>", wp: "<work package id, optional>", branch: "<existing branch, optional>", pr: "<existing PR, optional>", ci_pending: ["<target>: <CI job>", ...] (resume after CI, with pr or branch; brief optional), docs, undocumented, notes, non_original: (resume, carried from the pending_ci result) }'
const ciPending = Array.isArray(args && args.ci_pending) ? args.ci_pending.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : []
if (!args || !args.shader || (!args.brief && !ciPending.length)) return USAGE
if (ciPending.length && !args.pr && !args.branch) return USAGE + ' (ci_pending needs pr or branch)'
const shader = String(args.shader)
const brief = args.brief ? String(args.brief) : ''
const replaces = args.replaces ? String(args.replaces) : ''
const wp = args.wp ? String(args.wp) : ''
const where = args.pr
  ? `Work on the existing PR ${args.pr} and its head branch; do not create a new branch or PR.`
  : args.branch
    ? `Work on the existing branch ${args.branch} (reuse its open PR if one exists); do not create a new branch.`
    : 'Work on the current feature branch; if you are on the default branch, cut a Conventional branch (feat/<slug>) from the latest remote default branch.'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs location (per the project profile), keep each page to one kind, title it by the project pattern (how-to names a goal, explanation reads "About ...", reference is named for the thing), and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

// Only failures block. Every review returns blocking problems and
// informational notes in separate fields, and the workflow stops on the
// blocking field alone, so a note never turns green work into "blocked".
const NOTES_RULE = 'Put a problem in the blocking list only if it is a failure you can point to: a frame that visibly misses the brief or a readability criterion, a renderer or platform where it fails to compile or renders wrong, a measured cost over budget, a tier without its fallback, a parameter that breaks the material when moved through its range. Everything else (observations, ideas, questions, "nothing found") goes in notes.'

const strings = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const notes = []

const PLAN = {
  type: 'object',
  properties: {
    effect: { type: 'string', description: 'what it must look like, written down: the reference, what changes with light and view, what it must communicate in play' },
    coverage: { type: 'string', description: 'where it is used and how much of the screen it covers at most; opaque, alpha-tested or blended' },
    standard: { type: 'string', description: 'why the project\'s standard material cannot do this, or "extends <shared shader or include>"' },
    targets: { type: 'array', items: { type: 'string' }, description: 'each renderer or backend and platform it must run on' },
    ci_only: { type: 'array', items: { type: 'string' }, description: 'each "<target>: <CI job that compiles it> (why it cannot compile here)" for a target only CI can prove, e.g. a platform-only toolchain; empty if every target compiles locally' },
    tiers: { type: 'array', items: { type: 'string' }, description: 'each "tier: technique and quality for this tier" from the visual target, lowest first; empty if the project has no tiers' },
    fallbacks: { type: 'array', items: { type: 'string' }, description: 'each "where: what renders instead" for a tier or renderer without the full effect' },
    permutations: { type: 'string', description: 'static switches and how many compiled variants they make' },
    parameters: { type: 'array', items: { type: 'string' }, description: 'each artist parameter with name, range and default; everything else stays hidden' },
    budget: { type: 'string', description: 'cost limit on the lowest tier that uses it: ms at its coverage, or instruction and texture-sample counts, and how it is measured; the frame or scene budget it is a share of, and who owns that budget' },
    files: { type: 'array', items: { type: 'string' }, description: 'shader, include, material instances and look-dev scene files this work may write' },
    lookdev: {
      type: 'object',
      properties: {
        possible: { type: 'boolean' },
        frames: { type: 'array', items: { type: 'string' }, description: 'each "scene / camera / renderer or tier"' },
        command: { type: 'string', description: 'the project\'s capture command, or empty when it has none' },
        commandFound: { type: 'boolean', description: 'true only if the project already has a capture command you found (profile, scripts, CI jobs, docs); false means the Before step builds one from the lookdev-capture recipe' },
        outDir: { type: 'string' },
        overlays: { type: 'string', description: 'what the project draws over every scene (autoloads or global singletons with UI, fades, debug HUDs), or "none"' },
        hook: { type: 'string', description: 'the capture hook the project provides for capture mode (command-line flag, environment variable or override file) that hides UI and overlays, or "none"' },
        hookProposal: { type: 'string', description: 'when overlays exist and hook is "none": the small separate change that adds a hook and who owns that code (project profile); otherwise empty' },
        why: { type: 'string' },
      },
      required: ['possible'],
    },
    ambiguous: { type: 'array', items: { type: 'string' }, description: 'each "AMBIGUOUS: <question> -> default <value>"' },
    docKinds: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation'] }, page: { type: 'string' }, why: { type: 'string' } }, required: ['kind', 'page', 'why'] } },
    blockers: { type: 'array', items: { type: 'string' }, description: 'only what stops the work: no brief to judge against, unknown engine or targets' },
    caveats: { type: 'array', items: { type: 'string' } },
  },
  required: ['effect', 'coverage', 'standard', 'targets', 'tiers', 'fallbacks', 'permutations', 'parameters', 'budget', 'files', 'lookdev', 'ambiguous', 'docKinds'],
}
const FRAMES = { type: 'object', properties: { command: { type: 'string', description: 'the capture command used, built from the lookdev-capture recipe if the project had none' }, frames: { type: 'array', items: { type: 'string' }, description: 'each "<file> : scene / camera / renderer or tier, size WxH, driver"' }, contaminated: { type: 'array', items: { type: 'string' }, description: 'each "<file>: what drew over the scene" for a frame that still shows an overlay after the override; these are left out of frames' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['frames'] }
const BUILD = { type: 'object', properties: { compiles: { type: 'array', items: { type: 'string' }, description: 'each "<renderer or platform>: ok | error <message> | pending-ci <CI job that compiles it>"' }, measured: { type: 'string', description: 'cost on the lowest tier that uses it, with device or stand-in, or "estimate: ..."' }, baseline: { type: 'string', description: 'the same measurement of the frame or scene on the base commit (before the change), so the shader\'s own delta shows, or "not measured"' }, variants: { type: 'string', description: 'compiled variant count' }, files: { type: 'array', items: { type: 'string' } }, branch: { type: 'string' }, non_original: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } }, required: ['compiles', 'measured', 'files', 'branch'] }
const REVIEW = { type: 'object', properties: { problems: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['problems'] }
const FIX = { type: 'object', properties: { fixed: { type: 'array', items: { type: 'string' } }, failing: { type: 'array', items: { type: 'string' } }, baseline_over: { type: 'array', items: { type: 'string' }, description: 'each "<finding>: baseline <before> already over budget <budget>, shader delta <delta> within its share <share>; owner <who owns the budget>" for an over-budget finding that only fails because the baseline already did' }, frames: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['fixed', 'failing'] }
const DOCS = { type: 'object', properties: { pages: { type: 'array', items: { type: 'string' } }, undocumented: { type: 'array', items: { type: 'string' } } }, required: ['pages', 'undocumented'] }
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
const HANDOFF = { type: 'object', properties: { branch: { type: 'string' }, pr: { type: 'string' }, head_sha: { type: 'string' }, tests_pass: { type: 'boolean' }, problem: { type: 'string' } }, required: ['branch', 'tests_pass'] }

// A target that only CI can compile (a platform-only toolchain or driver)
// is "pending CI", never "ok": the run finishes with it listed, and this
// resume path turns it into pass or fail from the CI result.
const PENDING_RE = /:\s*pending[- ]ci\b\s*(.*)$/i
const CICHECK = { type: 'object', properties: { branch: { type: 'string' }, pr: { type: 'string' }, docs: { type: 'array', items: { type: 'string' }, description: 'docs pages the PR body lists, when no docs were carried in args' }, targets: { type: 'array', items: { type: 'object', properties: { target: { type: 'string' }, job: { type: 'string' }, result: { type: 'string', enum: ['pass', 'fail', 'not-run'] }, run: { type: 'string', description: 'CI run or job URL on the current head' }, log: { type: 'string', description: 'for fail: the compiler error lines from the log' } }, required: ['target', 'result'] } }, head_sha: { type: 'string', description: 'the head commit the runs were read on' } }, required: ['targets', 'branch', 'head_sha'] }
const CIFIX = { type: 'object', properties: { fixed: { type: 'array', items: { type: 'string' } }, failing: { type: 'array', items: { type: 'string' } }, head_sha: { type: 'string', description: 'the pushed head after the fix' }, notes: { type: 'array', items: { type: 'string' } } }, required: ['fixed', 'failing', 'head_sha'] }
// Everything the resume needs is carried in its args, so a pending_ci
// result is the only state between the two runs.
const carried = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const resumeArgs = (pending, extra) => ({ shader, pr: extra.pr || undefined, branch: extra.pr ? undefined : extra.branch, wp: wp || undefined, ci_pending: pending, docs: extra.docs, undocumented: extra.undocumented, notes: extra.notes, non_original: extra.non_original })
const resumeNext = (pending, extra) => `after CI finishes on the head, confirm the pending targets: /technical-artist:author-shader ${JSON.stringify(resumeArgs(pending, extra))}`
if (ciPending.length) {
  phase('CI')
  const ci = await agent(
    `You are the technical-artist confirming the shader "${shader}" on targets only CI can compile. ${where} For each pending target below, find the named CI job's latest run on the current head of the branch (the forge's API or CLI; wait for no run, read what is there), and report pass, fail (with the compiler error lines from its log) or not-run (no finished run on this head), with the run URL. A job that passed without compiling this shader for the target (skipped, cached, wrong platform) is not-run. Pending targets:\n- ${ciPending.join('\n- ')}\nReturn the branch, the PR URL, the head SHA you read the runs on` + (carried(args.docs).length ? '' : ', and the docs pages the PR body lists') + `. Do not edit, commit or push anything.`,
    { schema: CICHECK, phase: 'CI', label: 'ci:read' })
  if (!ci || !Array.isArray(ci.targets)) return { status: 'blocked', stage: 'ci', open: ['could not read the CI results for: ' + ciPending.join('; ')] }
  const by = (r) => ci.targets.filter((t) => t && t.result === r)
  // Keep the job named in the args when the reader leaves it out.
  const asPending = (t) => ciPending.find((p) => p.split(':')[0].trim() === t.target) || `${t.target}: pending-ci ${t.job || ''}`.trim()
  const passed = by('pass').map((t) => `${t.target}: pass ${t.run || ''}`.trim())
  const failed = by('fail')
  const listed = new Set(ci.targets.map((t) => t && t.target))
  const notRun = by('not-run').map(asPending)
    .concat(ciPending.filter((p) => !listed.has(p.split(':')[0].trim())))
  const carry = { pr: args.pr || ci.pr || '', branch: ci.branch || args.branch || '', docs: carried(args.docs).length ? carried(args.docs) : strings(ci.docs), undocumented: carried(args.undocumented), notes: carried(args.notes), non_original: carried(args.non_original) }
  if (failed.length) {
    const cifix = await agent(
      `Fix the shader "${shader}" for the targets that failed in CI, in the shader and material files only, following the technical-artist materials-shaders skill. ${where}\n` +
      failed.map((t) => `- ${t.target} (${t.job || 'CI job'}, ${t.run || 'run'}):\n${t.log || '(no log excerpt)'}`).join('\n') +
      '\nKeep every target that already compiles compiling (recompile the ones you can reach locally), run the project validator and tests, commit with Conventional Commits and push. Return what you fixed, anything you could not fix, the new head SHA and notes.',
      { schema: CIFIX, phase: 'CI', label: 'ci:fix' })
    if (!cifix) return { status: 'blocked', stage: 'ci', open: failed.map((t) => `${t.target}: fails in CI ${t.run || ''}`.trim()), confirmed: passed }
    if (strings(cifix.failing).length) return { status: 'blocked', stage: 'ci', open: strings(cifix.failing), confirmed: passed, notes: strings(cifix.notes) }
    // The fix is a new head, so every target CI proves must run again on it.
    const again = failed.map(asPending).concat(notRun)
    const fixNotes = carry.notes.concat(strings(cifix.notes).map((n) => 'ci fix: ' + n))
    return { status: 'pending_ci', shader, pending_ci: again, confirmed: passed, fixed: strings(cifix.fixed), head_sha: cifix.head_sha, notes: fixNotes, next: resumeNext(again, Object.assign({}, carry, { notes: fixNotes })) }
  }
  if (notRun.length) return { status: 'pending_ci', shader, pending_ci: notRun, confirmed: passed, head_sha: ci.head_sha, notes: carry.notes, next: resumeNext(notRun, carry) }
  // Every pending target passed on the head just read: hand that head off.
  return {
    status: 'done',
    shader,
    confirmed: passed,
    head_sha: ci.head_sha,
    notes: carry.notes,
    handoff: {
      from: 'technical-artist:author-shader',
      branch: carry.branch,
      pr: carry.pr,
      head_sha: ci.head_sha,
      tests_pass: true,
      docs: carry.docs,
      undocumented: carry.undocumented,
      non_original: carry.non_original,
      notes: carry.notes.concat(['confirmed in CI: ' + passed.join('; ')]),
    },
    next: wp
      ? `ship it without rebuilding: /engineering-practices:deliver-package { wp: "${wp}", prior: <this result> }; after the code reviewer passes, /engineering-practices:land-pr { pr: "${carry.pr || '<the PR>'}" }`
      : `land it (it marks the PR ready, asks the code reviewer, polls CI and squash-merges once passed): /engineering-practices:land-pr ${carry.pr ? `{ pr: "${carry.pr}" }` : `{ branch: "${carry.branch}" }`}`,
  }
}

phase('Plan')
const plan = await agent(
  `You are the technical-artist authoring the shader "${shader}". Onboard first (engineering-practices project-onboarding), then follow the technical-artist skills materials-shaders (Shader method), art-budgets-profiling and lookdev-capture. Brief: ${brief}\n` +
  (replaces ? `It replaces or reworks: ${replaces}. Read it first and keep what it gets right.\n` : '') +
  'Write the effect down before any code: what it must look like, where it is used and how much screen it covers, opaque or blended. Start from the project\'s shared material or shader includes; a new shader needs a stated reason the standard one cannot do the effect. ' +
  'Read the project\'s quality tiers and renderer decision (visual target; the renderer and features per tier are the graphics-programmer\'s decision, so take them as given and put any missing decision in blockers), list the renderers and platforms it must run on (and in ci_only each one this machine cannot compile for, such as a platform-only toolchain, with the CI job that does), the technique per tier and a fallback for every tier or renderer without the full effect. ' +
  'Plan static switches with their compiled variant count, the artist parameters with ranges and defaults, and a cost budget on the lowest tier that uses it with how it is measured, the frame or scene budget it is a share of and who owns that budget. Plan the look-dev frames (lookdev-capture skill). Detect whether the project has a capture command (profile, scripts, CI jobs, docs) and set commandFound; never assume one exists. If it has none, the Before step builds one from the skill\'s capture command recipe; set possible to false with the reason only when none can be built here (no engine binary, display or software driver), and the capture is then pending. Find what the project draws over every scene (autoloads, global singletons, persistent UI or debug overlays) and the capture hook it provides for capture mode (flag, environment variable or override file), as the skill\'s capture-mode step says; if there is none, write the small separate change that adds one and who owns that code in hookProposal, and never plan to hand-edit shipping configuration. ' +
  'State each gap as "AMBIGUOUS: <question> -> default <value>". Plan documentation with the Diataxis compass: a new shader owes reference (parameters, permutations, cost, platforms, fallbacks) and an explanation of design choices; a how-to when someone must do something new with it. List the files you will change. Do not edit files.',
  { schema: PLAN, phase: 'Plan', label: 'plan' })
if (!plan) return 'blocked: planning failed (no plan returned) for ' + shader
if (strings(plan.blockers).length) return { status: 'blocked', stage: 'plan', open: strings(plan.blockers) }
const ambiguous = strings(plan.ambiguous)
const caveats = strings(plan.caveats)
const look = plan.lookdev || { possible: false }
if (!look.possible) notes.push('look-dev capture pending: ' + (look.why || 'the plan found no way to render headless'))
// A missing capture hook is someone else's code: propose it, do not edit shipping config.
const hookProposal = look.possible && look.hookProposal && String(look.hookProposal).trim() ? 'capture hook proposed as a separate change: ' + String(look.hookProposal).trim() : ''
if (hookProposal) notes.push(hookProposal)
const ciOnly = strings(plan.ci_only)
const spec = `Effect: ${plan.effect}\nCoverage: ${plan.coverage}\nBase: ${plan.standard}\nTargets: ${strings(plan.targets).join(', ')}\nCI-only targets: ${ciOnly.join('; ') || 'none'}\nTiers: ${strings(plan.tiers).join('; ') || 'none'}\nFallbacks: ${strings(plan.fallbacks).join('; ') || 'none'}\nPermutations: ${plan.permutations}\nParameters: ${strings(plan.parameters).join('; ')}\nBudget: ${plan.budget}`
const captureCmd = (tag, built) => built ? built : look.commandFound && look.command ? look.command
  : tag === 'before' ? 'no capture command (the project has none): build one from the skill\'s capture command recipe as a script outside shipping configuration, use it, and return it in command; if it cannot be built here, return no frames and say why in problems'
  : 'the capture command the before step built'
const captureBrief = (tag, built) => `Capture the look-dev frames ${tag === 'before' ? 'before the change' : 'with the new shader'}, following the technical-artist lookdev-capture skill exactly: ${JSON.stringify(look.frames || [])} with ${captureCmd(tag, built)}, into ${look.outDir || 'a frames directory the project profile names'}. Name each file <scene>-<camera>-<renderer or tier>-${tag}. Isolate the scene from what the project draws over every scene (${look.overlays || 'find it: autoloads, global singletons, persistent UI'}) in capture mode through the project's capture hook (${look.hook && look.hook !== 'none' ? look.hook : 'none exists: do not hand-edit shipping configuration; use an override that changes no committed file if the engine allows one, otherwise capture with the overlays'}), and check each frame shows only the scene: no HUD, text, fade or debug layer the scene does not contain (render the scene once with capture mode off if you need to see what the overlays draw). Re-capture a contaminated frame; one that still shows an overlay goes in contaminated, not frames. ${tag === 'before' ? 'Render from the base commit (a separate worktree of the base branch) so the frames show the state before this work, even if the working branch already has changes. ' : 'Render from the working tree with the same command, size, frame and driver as the before frames. '} Check every frame is the requested size and is not black, blank or captured before the scene settled; re-capture any that fail. Write a greyscale copy of each. Change no project files except the frames. Return the capture command used, the frame files with what each shows and the driver that rendered it, and anything you could not capture in problems.`
log(`${strings(plan.targets).length} targets, ${strings(plan.tiers).length} tiers, ${strings(plan.parameters).length} parameters, ${ambiguous.length} ambiguous`)

let before = null
if (look.possible) {
  phase('Before')
  before = await agent(captureBrief('before'), { schema: FRAMES, phase: 'Before', label: 'capture:before' })
  if (before && strings(before.contaminated).length) notes.push('before frames still showing overlays, left out: ' + strings(before.contaminated).join('; '))
  if (!before || !strings(before.frames).length) notes.push('look-dev capture pending, before frames missing: ' + (before ? strings(before.problems).join('; ') : 'capture step returned nothing'))
}

phase('Build')
const build = await agent(
  `Build the shader "${shader}" following the technical-artist materials-shaders skill (Shader method and Material method) and the project profile. ${where}\n${spec}\n` +
  `Write files only in: ${strings(plan.files).join(', ')}. Use the project's shared includes and conventions (colour spaces, packing, normal convention) and expose only the planned parameters with their ranges. Give every tier its technique and every planned fallback. Update the material instances that use it and the look-dev scene if it needs one. ` +
  (ambiguous.length ? 'Implement each stated default as a named value and keep this list:\n- ' + ambiguous.join('\n- ') + '\n' : '') +
  'Compile or load it on every target renderer (headless where the engine allows) and report each result as "<target>: ok" or "<target>: error <message>". A target this machine cannot compile for at all (no toolchain or driver for that platform, e.g. a platform-only shader compiler), and that a named CI job does compile, is "<target>: pending-ci <CI job>": make sure that job builds this shader for that target (say so in notes if it does not and you could not add it), and never report such a target as ok. A target with no CI job to prove it is an error. ' +
  (ciOnly.length ? 'Planned CI-only targets: ' + ciOnly.join('; ') + '. ' : '') +
  'Measure the cost on the lowest tier that uses it against the budget, and the same measurement on the base commit as the baseline, so the shader\'s own delta shows (instruction and sample counts from the compiler, or a timed capture at its coverage); if no target device is reachable, give a sourced estimate and label it "estimate". Count compiled variants. Run the project validator and tests. ' +
  'Log every non-original item (code, noise textures, LUTs) per the asset-provenance skill. Commit with Conventional Commits. Return compile results per target, the measured or estimated cost, the baseline, the variant count, the files, the branch and the non-original items (empty if none).',
  { schema: BUILD, phase: 'Build', label: 'build' })
if (!build) return { status: 'blocked', stage: 'build', open: ['build step returned nothing'] }
const pendingCi = strings(build.compiles).filter((c) => PENDING_RE.test(c) && PENDING_RE.exec(c)[1].trim())
const compileErrors = strings(build.compiles).filter((c) => !/:\s*ok\b/i.test(c) && !pendingCi.includes(c))
if (compileErrors.length) return { status: 'blocked', stage: 'build', open: compileErrors.map((c) => 'does not compile or load: ' + c), notes }
if (build.notes) notes.push('build: ' + build.notes)

let after = null
if (look.possible) {
  phase('After')
  after = await agent(captureBrief('after', before && before.command), { schema: FRAMES, phase: 'After', label: 'capture:after' })
  if (after && strings(after.contaminated).length) notes.push('after frames still showing overlays, left out: ' + strings(after.contaminated).join('; '))
  if (!after || !strings(after.frames).length) notes.push('after frames missing: ' + (after ? strings(after.problems).join('; ') : 'capture step returned nothing'))
}
const afterFrames = after ? strings(after.frames) : []

phase('Review')
const lenses = [
  { key: 'look', text: `look: open every before and after frame and its greyscale copy (lookdev-capture skill, "Judge"). Before: ${JSON.stringify(before ? before.frames : [])}. After: ${JSON.stringify(afterFrames)}. Does it look like the effect written down, read from the gameplay camera, keep gameplay objects apart by value, silhouette and colour on every tier captured, and add to the base look rather than change what reads? A software-rendered frame judges values and readability, not GPU-only features. If there are no after frames, say so in problems.` },
  { key: 'cost', text: `cost and permutations: budget ${plan.budget}; measured ${build.measured}; baseline before the change ${build.baseline || 'not measured'}; ${build.variants || 'unknown'} compiled variants (planned: ${plan.permutations}). Read the shader for pixel work that could move to vertex or a texture, redundant samples, blending over large areas, and switches that multiply variants (materials-shaders, art-budgets-profiling). A measured cost over budget is a problem, unless the baseline was already over budget and the shader\'s own delta is within its share: that is a note starting "baseline over budget:" naming the baseline, delta, share and the budget\'s owner. A labelled estimate is a note.` },
  { key: 'platforms', text: `platforms and fallbacks: targets ${strings(plan.targets).join(', ')}; tiers ${strings(plan.tiers).join('; ') || 'none'}; fallbacks ${strings(plan.fallbacks).join('; ') || 'none'}; compile results ${strings(build.compiles).join('; ')}. A "pending-ci" target is proven later by its CI job: check that job exists and builds this target, and read the shader for what that target is known to reject (feature, precision, sampler or resource limits); do not count pending as a failure. Every reachable target compiles, every tier gets its technique, every lower tier or renderer without the full effect gets its fallback, and nothing renders black, pink or untextured; precision and features the weakest target lacks are not used unguarded.` },
  { key: 'params', text: `artist parameters and materials: planned ${strings(plan.parameters).join('; ')}. Each parameter has a clear name, range and default; moving it across its whole range never breaks the look (no NaN, blown highlights, negative values); hidden values stay hidden; material instances that use it follow the project\'s colour-space and packing conventions (materials-shaders, pbr-reference.md).` },
]
const reviews = await parallel(lenses.map((l) => () => agent(
  `You are a technical-artist giving an independent review of the new shader "${shader}", which you did not write. Review it through ${l.text}\nSpec:\n${spec}\nFiles: ${strings(build.files).join(', ')}. Do not edit any file. ${NOTES_RULE}`,
  { schema: REVIEW, phase: 'Review', label: 'review:' + l.key, independent: true })))
const unverified = []
const problems = []
reviews.forEach((r, i) => {
  const k = lenses[i].key
  if (!r || !Array.isArray(r.problems)) unverified.push(k)
  else {
    r.problems.forEach((p) => problems.push(`${k}: ${p}`))
    strings(r.notes).forEach((n) => notes.push(`${k}: ${n}`))
  }
})

// Over budget only because the baseline already was: a known risk for the
// budget owner, in the result and the handoff notes, never a blocker.
const knownRisks = notes.filter((n) => /^cost: baseline over budget:/i.test(n)).map((n) => 'budget already over before this shader (owned by the budget owner): ' + n.replace(/^cost: baseline over budget:\s*/i, ''))
let frames = afterFrames
if (problems.length) {
  phase('Fix')
  const fix = await agent(
    `Fix these review findings on the shader "${shader}" in one pass, in the planned files only, following the same skills and spec as the build:\n${spec}\n- ${problems.join('\n- ')}\n` +
    'Recompile on every target, re-measure cost (and its baseline on the base commit) if the shader changed, run the project validator and tests, and' + (look.possible ? ` re-capture the after frames with the same command and names (${look.command || 'the project\'s capture command'}), checking size and content as the lookdev-capture skill says,` : '') + ' then commit. A cost finding where the baseline (before) measurement already exceeds the budget and the shader\'s own delta is within its share is not failing: put it in baseline_over with the budget\'s owner (project profile), not in failing. Return what you fixed, each finding that still fails (one line each), baseline_over, the new frames' + (look.possible ? '' : ' (none)') + ' and notes. ' + NOTES_RULE,
    { schema: FIX, phase: 'Fix', label: 'fix' })
  if (!fix) return { status: 'blocked', stage: 'fix', open: problems, notes }
  strings(fix.notes).forEach((n) => notes.push('fix: ' + n))
  strings(fix.baseline_over).forEach((b) => knownRisks.push('budget already over before this shader (owned by the budget owner): ' + b))
  if (strings(fix.failing).length) return { status: 'blocked', stage: 'fix', open: strings(fix.failing), notes }
  if (strings(fix.frames).length) frames = strings(fix.frames)
}

phase('Docs')
const docKinds = Array.isArray(plan.docKinds) ? plan.docKinds : []
const docs = await agent(
  `Document the shader "${shader}" in the same PR. Planned pages:\n` +
  (docKinds.length ? docKinds.map((d) => `- ${d.kind}: ${d.page} (${d.why})`).join('\n') : '- (none planned; re-run the compass)') +
  `\nThe reference page lists the parameters with ranges and defaults, the permutations and variant count, the technique and fallback per tier and renderer, and the cost (measured, or labelled estimate): ${build.measured}.` +
  (frames.length ? ` Where the project shows look-dev frames in its docs, use these: ${JSON.stringify(frames)}.` : '') + ' ' + DOCS_FRAGMENT,
  { schema: DOCS, phase: 'Docs', label: 'docs:do' })
if (!docs) return { status: 'blocked', stage: 'docs', open: ['docs step failed; a shader without its docs is not done'], notes }
// The check only reads, so it stays independent of the docs it judges;
// fixes are their own step, followed by a fresh check.
const docCheckPrompt = `Review the documentation pages just written for the shader "${shader}" (writer's report: ${JSON.stringify(docs)}). ` +
  'Check that every touched page holds one Diataxis kind only, starts with a line saying its kind and audience, how-to titles name a goal, explanation titles read with "About", reference matches sibling pages and states parameters, permutations, tiers, fallbacks and cost, and links connect the kinds. Read-only: do not edit anything; report every problem with its page.'
let docCheck = await agent(docCheckPrompt, { schema: DOCCHECK, phase: 'Docs', label: 'docs:check', independent: true })
if (docCheck && !docCheck.ok && (docCheck.problems || []).length) {
  const docFix = await agent(`Fix these documentation problems with the smallest edits, touching only the pages they name; leave anything that needs a content decision:\n- ${docCheck.problems.join('\n- ')}`, { phase: 'Docs', label: 'docs:fix' })
  if (docFix) docCheck = await agent(docCheckPrompt, { schema: DOCCHECK, phase: 'Docs', label: 'docs:recheck', independent: true })
}
if (!docCheck) notes.push('docs check returned nothing; review the pages by hand')
else if (!docCheck.ok) return { status: 'blocked', stage: 'docs', open: (docCheck.problems && docCheck.problems.length) ? docCheck.problems : ['docs check failed without details'], notes }

phase('Handoff')
const handoff = await agent(
  `Hand off the shader "${shader}". ${where} Make sure every commit is pushed to the branch (${build.branch}); if no pull request is open for it, open a draft PR titled as a Conventional Commit${wp ? ` with "Refs: ${wp}" in the body` : ''}, with the effect, the cost against budget, the variant count, the technique and fallback per tier, the docs pages by Diataxis kind${pendingCi.length ? ', a "Pending CI" section listing ' + pendingCi.join('; ') + ' and saying these targets are confirmed only when those CI jobs pass on the head, before merge' : ''}${frames.length ? ', the before and after frames' : ''}${ambiguous.length ? ', the defaults taken for ambiguous points' : ''}${caveats.length || knownRisks.length ? ', and a "Known risks" section: ' + caveats.concat(knownRisks).join('; ') : ''}${hookProposal ? '; say the ' + hookProposal : ''}. ` +
  'Do not mark it ready, request review or merge: the engineering-practices workflow named in the result does that. Follow the engineering-practices git-workflow skill. Run the project\'s tests and asset validator on the pushed head. Return the branch, PR URL, head commit SHA, and whether they pass on that head.',
  { schema: HANDOFF, phase: 'Handoff', label: 'handoff' })
if (!handoff || !handoff.branch) return { status: 'blocked', stage: 'handoff', open: ['hand-off failed; the work is committed on ' + build.branch + ' but may not be pushed'], notes }
if (!handoff.tests_pass) return { status: 'blocked', stage: 'handoff', open: ['tests or asset validator not green on the pushed head' + (handoff.problem ? ': ' + handoff.problem : '')], notes }

// An unverified review still hands off, but says so where deliver-package
// and the reviewer will read it.
unverified.forEach((k) => notes.push(`unverified: review:${k} returned nothing`))
return {
  status: unverified.length || !docCheck ? 'unverified' : pendingCi.length ? 'pending_ci' : 'done',
  shader,
  pending_ci: pendingCi,
  measured: build.measured,
  variants: build.variants || '',
  ambiguous,
  unverifiedReviews: unverified,
  findingsFixed: problems.length,
  before: before ? before.frames : [],
  after: frames,
  docs: docs.pages,
  undocumented: docs.undocumented,
  caveats,
  knownRisks,
  captureHookProposal: hookProposal,
  notes,
  ...(pendingCi.length ? {} : { handoff: {
    from: 'technical-artist:author-shader',
    branch: handoff.branch,
    pr: handoff.pr || '',
    head_sha: handoff.head_sha || '',
    tests_pass: true,
    docs: docs.pages || [],
    undocumented: docs.undocumented || [],
    non_original: strings(build.non_original),
    notes: caveats.concat(knownRisks, notes),
  } }),
  // A pending_ci run hands nothing off: the resume confirms the targets
  // and returns the handoff for the head CI proved.
  next: pendingCi.length
    ? resumeNext(pendingCi, { pr: handoff.pr || '', branch: handoff.branch, docs: strings(docs.pages), undocumented: strings(docs.undocumented), notes: caveats.concat(knownRisks, notes), non_original: strings(build.non_original) }) + '; its done result names the next step'
    : wp
    ? `ship it without rebuilding: /engineering-practices:deliver-package { wp: "${wp}", prior: <this result> }; after the code reviewer passes, /engineering-practices:land-pr { pr: "<the PR>" }`
    : `land it (it marks the PR ready, asks the code reviewer, polls CI and squash-merges once passed): /engineering-practices:land-pr ${handoff.pr ? `{ pr: "${handoff.pr}" }` : `{ branch: "${handoff.branch}" }`}`,
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
