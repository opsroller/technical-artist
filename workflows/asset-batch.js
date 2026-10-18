// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'asset-batch',
  description: 'Plan, make (in parallel, authored or procedural), validate and document a set of in-game 3D assets within budget, with manifest and provenance applied in one edit. Use for two or more related models/materials. args: { assets: [{ name: "SM_Crate_01", brief: "what it is and what it must communicate" }, ...], family?: "what ties the set together" }',
  phases: [
    { title: 'Plan', detail: 'conventions, budget class per asset, generator vs authored, doc kinds via the compass' },
    { title: 'Make', detail: 'one agent per asset; each writes only its own files and returns manifest and provenance lines' },
    { title: 'Check', detail: 'family review, budgets, validation; apply shared-file lines once; fix loop' },
    { title: 'Docs', detail: 'write the planned Diataxis pages, then verify one kind per page' },
  ],
}

const assets = (args && Array.isArray(args.assets)) ? args.assets.filter(a => a && a.name && a.brief) : []
if (!assets.length) {
  return 'Usage: asset-batch with args { assets: [{ name: "SM_Crate_01", brief: "wooden crate, breakable, must read as a pickup container" }, ...], family?: "dockside props" }'
}
const family = (args && args.family) || 'one coherent set'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs/<kind>/, keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

// ---------- Plan ----------
phase('Plan')
const PLAN = {
  type: 'object',
  properties: {
    conventions: { type: 'string', description: 'scale, pivot, naming, texel density, export format, folders, validator command, manifest and provenance log paths, as the project profile states them' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          method: { type: 'string', enum: ['authored', 'procedural'] },
          budgetClass: { type: 'string' },
          budget: { type: 'string', description: 'tris per LOD, texture set size, materials' },
          outputDir: { type: 'string', description: 'files this asset alone may write' },
          notes: { type: 'string' },
        },
        required: ['name', 'method', 'budgetClass', 'budget', 'outputDir'],
      },
    },
    docKinds: { type: 'array', items: { type: 'string' }, description: 'tutorial | how-to | reference | explanation, each with the page and reason' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['conventions', 'items', 'docKinds'],
}
const plan = await agent(
  `You are the technical-artist planning an asset batch (family: ${family}). Follow engineering-practices project-onboarding, then the technical-artist skills art-budgets-profiling, asset-pipeline and procedural-assets.\n` +
  `Assets:\n${JSON.stringify(assets, null, 2)}\n` +
  'Read the project profile for conventions and budgets (if budgets are missing, propose them per art-budgets-profiling and list that as a doc change). ' +
  'For each asset choose authored or procedural (prefer one shared generator for variants of one idea), its budget class and numbers, and a separate output directory so no two assets write the same file. ' +
  'List which documentation kinds this batch affects using the Diataxis compass (e.g. a new generator needs reference + how-to; new budgets need reference + explanation). Do not create assets yet.',
  { schema: PLAN, phase: 'Plan', label: 'plan' },
)
if (!plan || !Array.isArray(plan.items) || !plan.items.length) return 'blocked: planning failed (no plan returned). Check the project profile and retry.'
if (plan.blockers && plan.blockers.length) return { status: 'blocked', stage: 'plan', blockers: plan.blockers }

// ---------- Make ----------
phase('Make')
const MADE = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    source: { type: 'string', description: 'DCC source path or generator path + params + seed' },
    measured: { type: 'string', description: 'tris per LOD, verts, texture memory, materials, file size' },
    manifestLines: { type: 'array', items: { type: 'string' } },
    provenanceRecord: { type: 'string' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'files', 'source', 'measured', 'manifestLines', 'provenanceRecord'],
}
const made = await pipeline(plan.items, item => agent(
  `You are a technical-artist making one asset: "${item.name}" (${item.method}). Brief: ${(assets.find(a => a.name === item.name) || {}).brief || item.notes || ''}\n` +
  `Conventions: ${plan.conventions}\nBudget (${item.budgetClass}): ${item.budget}\n` +
  `Follow the technical-artist skills ${item.method === 'procedural' ? 'procedural-assets' : 'realtime-asset-authoring'}, materials-shaders, lods-optimization and asset-provenance, and the checklist in realtime-asset-authoring/asset-checklist.md.\n` +
  `Write files ONLY under ${item.outputDir} (plus a generator script there if procedural). Do NOT edit any shared file: not the manifest, not the provenance log, not shared materials. ` +
  'Instead return the exact manifest lines and the provenance record text for the Check step to apply. ' +
  'Check the asset in the look-dev scene and gameplay camera if the project makes that possible, run the project validator on your files, and report measured numbers and any open issues honestly.',
  { schema: MADE, phase: 'Make', label: `make:${item.name}` },
))
const results = plan.items.map((item, i) => made[i] ? made[i] : { name: item.name, failed: true })
const failed = results.filter(r => r.failed).map(r => r.name)
if (failed.length === results.length) return { status: 'blocked', stage: 'make', blockers: ['every make agent failed'], failed }

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
    sharedFilesApplied: { type: 'boolean' },
  },
  required: ['perAsset', 'sharedFilesApplied'],
}
let review = null
let open = []
for (let round = 1; round <= 3; round++) {
  review = await agent(
    `You are the technical-artist reviewing the asset family "${family}" (round ${round}).\nConventions: ${plan.conventions}\nResults:\n${JSON.stringify(results, null, 2)}\n` +
    'Using the skills realtime-asset-authoring (asset-checklist.md), materials-shaders, art-budgets-profiling and asset-provenance: check each asset against its budget and the checklist, run the project validator, and check the set as one family (consistent scale, texel density, style; distinct silhouette and value for gameplay objects from the gameplay camera). ' +
    (round === 1 ? 'Then apply ALL returned manifest lines and provenance records to the shared manifest and provenance log yourself, in one edit each, skipping failed assets. ' : 'Shared files were already applied; correct entries only if a fix changed them. ') +
    'Fix small problems directly; list what remains per asset. Mark an asset "unverified" if you could not check it, never drop it. Failed make agents: ' + JSON.stringify(failed),
    { schema: CHECK, phase: 'Check', label: `check:${round}` },
  )
  if (!review) { open = results.map(r => `${r.name}: unverified (checker returned nothing)`); continue }
  open = (review.perAsset || []).filter(a => a.verdict !== 'pass').map(a => `${a.name}: ${a.verdict} ${(a.problems || []).join('; ')}`)
    .concat(review.familyProblems || [])
  const seen = (review.perAsset || []).map(a => a.name)
  results.forEach(r => { if (!seen.includes(r.name)) open.push(`${r.name}: unverified (not reported by checker)`) })
  if (!open.length) break
  if (round < 3) {
    await agent(
      `You are a technical-artist fixing review findings for "${family}". Follow the same skills as the makers. Open items:\n${open.join('\n')}\n` +
      'Fix each in the asset\'s own files. If a fix changes a manifest or provenance entry, make that single edit yourself (you are the only agent running now). Report what you fixed.',
      { phase: 'Check', label: `fix:${round}` },
    )
  }
}
failed.forEach(n => { if (!open.some(o => o.startsWith(n + ':'))) open.push(`${n}: make agent failed; asset not created`) })
if (open.length) return { status: 'blocked', stage: 'check', open, results }

// ---------- Docs: Do then Check ----------
phase('Docs')
const docs = await agent(
  `You are the technical-artist documenting the asset batch "${family}". Planned doc kinds: ${JSON.stringify(plan.docKinds)}. Assets: ${JSON.stringify(results.map(r => ({ name: r.name, source: r.source, measured: r.measured })))}\n` +
  DOCS_FRAGMENT + ' Use the project\'s docs location and Diataxis guide from its profile. Typical: generator → reference (parameters, command) + how-to (make a variant); new budgets or conventions → reference + explanation.',
  { phase: 'Docs', label: 'docs:do' },
)
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok'] }
const docCheck = await agent(
  `Review the documentation pages just written for the asset batch "${family}" (writer's report: ${JSON.stringify(docs)}). ` +
  'Check that every touched page holds one Diataxis kind only, how-to titles name a goal, explanation titles read with "About", reference matches sibling pages, and links connect the kinds. Fix small problems directly and report what remains.',
  { schema: DOCCHECK, phase: 'Docs', label: 'docs:check' },
)
if (!docCheck) return { status: 'done-docs-unverified', results, docs }
if (!docCheck.ok && docCheck.problems && docCheck.problems.length) return { status: 'blocked', stage: 'docs', open: docCheck.problems, results }
return { status: 'done', results, docs }
