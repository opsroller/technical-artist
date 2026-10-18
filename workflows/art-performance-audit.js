// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'art-performance-audit',
  description: 'Profile what the art in one scene costs on a target tier, find the worst offenders by category in parallel, apply the agreed content fixes, re-measure, and document budgets and findings. Use when a scene misses its frame, memory or load target, or before a milestone. args: { scene: "level or scene name", tier: "lowest target tier, e.g. low mobile", fix?: true }',
  phases: [
    { title: 'Plan', detail: 'baseline capture, which bound (CPU submission, GPU pixels, memory), doc kinds via the compass' },
    { title: 'Analyse', detail: 'one read-only agent per cost category' },
    { title: 'Fix', detail: 'one agent applies content fixes in priority order; engine-side causes go to the graphics-programmer' },
    { title: 'Check', detail: 're-measure against the baseline and budgets' },
    { title: 'Docs', detail: 'write the planned Diataxis pages, then verify one kind per page' },
  ],
}

const scene = args && args.scene
const tier = args && args.tier
if (!scene || !tier) return 'Usage: art-performance-audit with args { scene: "harbour district", tier: "low mobile", fix?: true }'
const doFix = !(args && args.fix === false)

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs/<kind>/, keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

// ---------- Plan ----------
phase('Plan')
const BASE = {
  type: 'object',
  properties: {
    method: { type: 'string', description: 'build, device or tier, capture tool category, camera positions, number of captures' },
    baseline: { type: 'string', description: 'frame time, GPU/CPU split, draw calls, triangles, texture memory, overdraw notes, load time' },
    budgets: { type: 'string', description: 'the project budgets that apply, or "missing"' },
    bound: { type: 'string', enum: ['cpu-submission', 'gpu-pixels', 'gpu-geometry', 'memory', 'load', 'within-budget', 'unknown'] },
    docKinds: { type: 'array', items: { type: 'string' } },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['method', 'baseline', 'budgets', 'bound', 'docKinds'],
}
const base = await agent(
  `You are the technical-artist auditing art cost in scene "${scene}" on tier "${tier}". Follow engineering-practices project-onboarding, then the technical-artist skill art-budgets-profiling.\n` +
  'Build or use the project build for that tier, capture several frames from typical and worst-case views with the profiling tools the project profile names, and record a baseline. Decide which bound the scene hits. ' +
  'Look up the applicable budgets; if they are missing, say so (writing them becomes a doc change). List which documentation kinds this audit will affect using the Diataxis compass. ' +
  'If you cannot build or capture on this tier, return blockers instead of guessing numbers.',
  { schema: BASE, phase: 'Plan', label: 'baseline' },
)
if (!base) return 'blocked: baseline capture failed (no result returned).'
if (base.blockers && base.blockers.length) return { status: 'blocked', stage: 'plan', blockers: base.blockers }

// ---------- Analyse (parallel, read-only) ----------
phase('Analyse')
const categories = [
  { key: 'geometry', focus: 'triangle and vertex counts, tiny triangles, missing or bad LODs, vertex splits from seams/hard edges', skill: 'lods-optimization' },
  { key: 'draw-calls', focus: 'draw calls and material/shader switches, unique mesh x material pairs, batching and instancing opportunities, material slots per mesh', skill: 'lods-optimization' },
  { key: 'pixels', focus: 'shader cost, overdraw from transparency and effects, alpha test vs blend, full-screen or large-coverage materials', skill: 'materials-shaders' },
  { key: 'memory', focus: 'texture memory by asset, oversized or uncompressed textures, wrong formats or colour spaces, constant maps, duplicate textures, mesh memory, file sizes', skill: 'asset-pipeline' },
]
const FIND = {
  type: 'object',
  properties: {
    category: { type: 'string' },
    offenders: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          asset: { type: 'string' },
          cost: { type: 'string', description: 'measured cost x instance count' },
          fix: { type: 'string' },
          owner: { type: 'string', enum: ['technical-artist', 'graphics-programmer', 'other'] },
          expectedGain: { type: 'string' },
          risk: { type: 'string' },
        },
        required: ['asset', 'cost', 'fix', 'owner'],
      },
    },
  },
  required: ['category', 'offenders'],
}
const finds = await parallel(categories.map(c => () => agent(
  `You are a technical-artist analysing the "${c.key}" cost of scene "${scene}" on tier "${tier}". Baseline: ${base.baseline}. Bound: ${base.bound}. Budgets: ${base.budgets}.\n` +
  `Focus: ${c.focus}. Follow the technical-artist skills art-budgets-profiling and ${c.skill}. ` +
  'Read captures, import reports and assets; do NOT modify any file. Rank offenders by cost x count, propose a fix for each, and mark engine-side causes for the graphics-programmer.',
  { schema: FIND, phase: 'Analyse', label: `analyse:${c.key}` },
)))
const findings = categories.map((c, i) => finds[i] || { category: c.key, offenders: [], unverified: true })
const unanalysed = findings.filter(f => f.unverified).map(f => f.category)

// ---------- Fix (single writer) ----------
let fixReport = null
if (doFix) {
  phase('Fix')
  fixReport = await agent(
    `You are the technical-artist applying content fixes for scene "${scene}" on tier "${tier}". Findings:\n${JSON.stringify(findings, null, 2)}\n` +
    `The scene is bound by: ${base.bound}. Fix only items owned by technical-artist, highest gain first, starting with the bound that limits the scene. Follow lods-optimization, materials-shaders and asset-pipeline. ` +
    'You are the only agent editing now, so you may update the manifest, import settings and shared materials; keep each change reproducible (source or generator updated, not just the exported file). ' +
    'For items owned by the graphics-programmer, write a short hand-off note with the capture evidence. Report fixes applied, skipped, and hand-offs.',
    { phase: 'Fix', label: 'fix' },
  )
  if (!fixReport) return { status: 'blocked', stage: 'fix', blockers: ['fix agent returned nothing; files may be partly changed, review the working tree'], findings }
}

// ---------- Check ----------
phase('Check')
const AFTER = {
  type: 'object',
  properties: {
    after: { type: 'string' },
    withinBudget: { type: 'boolean' },
    regressions: { type: 'array', items: { type: 'string' } },
    remaining: { type: 'array', items: { type: 'string' } },
  },
  required: ['after', 'withinBudget'],
}
const check = await agent(
  `You are the technical-artist verifying the audit of "${scene}" on "${tier}". Use the same method as the baseline: ${base.method}. Baseline: ${base.baseline}.\n` +
  `Fix report: ${JSON.stringify(fixReport)}\n` +
  'Re-measure, compare with baseline and budgets, check visually for LOD pops, broken materials or lost readability, and run the project validator. Report numbers, regressions and what remains.',
  { schema: AFTER, phase: 'Check', label: 'remeasure' },
)
if (!check) return { status: 'unverified', stage: 'check', note: 're-measure failed; fixes are not verified', findings, fixReport }
if (check.regressions && check.regressions.length) return { status: 'blocked', stage: 'check', open: check.regressions, findings, check }

// ---------- Docs ----------
phase('Docs')
const docs = await agent(
  `You are the technical-artist documenting the art performance audit of "${scene}" on "${tier}". Planned doc kinds: ${JSON.stringify(base.docKinds)}. Baseline: ${base.baseline}. After: ${check.after}. Budgets: ${base.budgets}.\n` +
  DOCS_FRAGMENT + ' Typical: budgets (new or changed) → reference table + explanation of how they were derived; a fix procedure the team will repeat → how-to. Use the project\'s docs location from its profile.',
  { phase: 'Docs', label: 'docs:do' },
)
if (!docs) return { status: 'blocked', stage: 'docs', open: ['docs writer returned nothing'], baseline: base.baseline, after: check.after }
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
const docCheck = await agent(
  `Review the documentation pages just written for the art audit of "${scene}" (writer's report: ${JSON.stringify(docs)}). Check one Diataxis kind per page, title patterns (how-to names a goal; explanation reads with "About"), reference format matches siblings, links between kinds. Fix small problems; report what remains.`,
  { schema: DOCCHECK, phase: 'Docs', label: 'docs:check' },
)
return {
  status: !docCheck ? 'done-docs-unverified' : (docCheck.ok ? 'done' : 'blocked'),
  baseline: base.baseline,
  after: check.after,
  withinBudget: check.withinBudget,
  remaining: check.remaining || [],
  unanalysed,
  docProblems: docCheck ? (docCheck.problems || []) : ['docs check returned nothing'],
}
