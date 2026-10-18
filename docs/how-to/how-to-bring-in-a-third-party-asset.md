# How to bring a third-party asset into the project

*How-to guide, for anyone who wants to use a model, texture or material the team did not make.*

This guide shows you how to import an outside asset so the project can prove
it may ship it.

1. **Check the project allows it.** The profile states which licences are
   compatible with the project's licence and distribution. If it says nothing,
   ask the project-manager before going further.
2. **Get the licence, not just the file.** Save the source URL, the exact
   licence name and version (e.g. CC BY 4.0, CC0 1.0) and its text or deed link.
   "Free" or "Creative Commons" alone is not enough.
3. **Check what the licence allows**: modification, commercial use,
   redistribution in your build, attribution terms. No-derivatives licences do
   not allow adapting the asset.
4. **Write the provenance record first**, using the
   [ledger format](../../skills/asset-provenance/ledger-format.md):
   `origin: third-party` (or `adapted` if you will change it), `source_url`,
   `license`, `attribution`.
5. **Bring it to project standards** with the technical-artist agent: rename,
   rescale, fix pivot, convert textures to the PBR rules, add LODs, run the
   validator. Record what you changed in `changes`.
6. **Supply the credit line** (Title, Author, Source, Licence) to whoever owns
   the credits page or screen.
7. **Commit** the asset, its record and the credit line together.

See the [asset-provenance skill reference](../reference/skill-asset-provenance.md).
