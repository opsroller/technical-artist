export const meta = {
  name: 'asset-batch',
  description: 'Generate a set of original assets in parallel by script, then check readability, budgets and provenance',
  whenToUse: 'Make several models, textures or materials at once. args: { assets: [{ name: "<manifest name>", brief: "<what it is>" }, ...] }',
  phases: [{ title: 'Make', detail: 'one agent per asset' }, { title: 'Check', detail: 'set consistency and budgets' }],
}
const assets = (args && args.assets) || []
if (!assets.length) return 'Pass args.assets: [{ name, brief }].'
const R = { type: 'object', properties: { name: { type: 'string' }, files: { type: 'array', items: { type: 'string' } },
  generator: { type: 'string' }, triangles: { type: 'number' }, notes: { type: 'string' } }, required: ['name', 'files', 'generator'] }
const made = await pipeline(assets, a => agent(`Following the technical-artist procedural-assets and asset-pipeline skills and the project profile's tools and budgets, create "${a.name}": ${a.brief}. Write a generator script in the project's tools folder, produce the asset, add it to the manifest and the provenance log. Write only files for this asset; leave shared files (manifest, provenance log) as a list of lines to add in your notes if another agent may be editing them.`, { schema: R, phase: 'Make', label: `make:${a.name}` }))
phase('Check')
return await agent(`Review this asset set as one family:\n${JSON.stringify(made.filter(Boolean))}\nCheck: distinct colour and silhouette per gameplay object from the gameplay camera, consistent scale and style, budgets, every asset in the manifest and provenance log (apply any pending lines from notes now). Fix what you can and list the rest.`, { label: 'check' })
