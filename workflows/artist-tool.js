// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'artist-tool',
  description: 'Turn a slow or error-prone art workflow step into a small, tested, documented tool, import rule or validator check, trialled against real assets. Use when artists repeat a manual step or keep shipping the same asset error. args: { problem: "what hurts, for whom", users?: "who uses it", kind?: "tool" | "import-rule" | "validator-rule" }',
  phases: [
    { title: 'Plan', detail: 'brief, smallest useful version, test assets, doc kinds via the compass' },
    { title: 'Do', detail: 'build the tool or rule with tests' },
    { title: 'Check', detail: 'code review, tests, artist trial against the brief; fix loop' },
    { title: 'Docs', detail: 'how-to and reference for the tool, then verify one kind per page' },
  ],
}

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
    { schema: REVIEW, phase: 'Check', label: `review:${round}` },
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

// ---------- Docs ----------
phase('Docs')
const docs = await agent(
  `You are the technical-artist documenting the new ${kind}. Brief: ${plan.brief}. Planned doc kinds: ${JSON.stringify(plan.docKinds)}. Trial notes: ${review.trial}\n` +
  DOCS_FRAGMENT + ' At minimum: a how-to named for the artist\'s goal (not the tool\'s name) and a reference page (options, inputs, outputs, every error message and its fix). Add an explanation only if a real design trade-off was made; update the onboarding tutorial if new artists must use it. Use the project\'s docs location from its profile.',
  { phase: 'Docs', label: 'docs:do' },
)
if (!docs) return { status: 'blocked', stage: 'docs', open: ['docs writer returned nothing'] }
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
const docCheck = await agent(
  `Review the documentation pages just written for the new ${kind} (writer's report: ${JSON.stringify(docs)}). Check one Diataxis kind per page, title patterns, reference format matches siblings, links between kinds, and that the how-to works when followed literally. Fix small problems; report what remains.`,
  { schema: DOCCHECK, phase: 'Docs', label: 'docs:check' },
)
if (!docCheck) return { status: 'done-docs-unverified', trial: review.trial, nits: review.nits || [] }
if (!docCheck.ok) return { status: 'blocked', stage: 'docs', open: (docCheck.problems && docCheck.problems.length) ? docCheck.problems : ['docs check failed without details'] }
return { status: 'done', trial: review.trial, nits: review.nits || [], needsOtherRole: plan.needsOtherRole || 'none' }
