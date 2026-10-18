---
name: asset-provenance
description: Use when creating, importing, generating, modifying or reviewing any art asset, to record and check where it came from, who made it, under what licence, and how to reproduce it.
---

# Asset provenance

Every shipped asset needs an answer to "where did this come from and may we
ship it?". This skill applies the base `provenance` skill of
`engineering-practices` to art assets; follow both.

## Rules

- **No record, no asset.** Each asset (or generated family) has a provenance
  record before it merges.
- **Original by default.** Make assets from scratch or from generators the
  project owns. Never trace, kitbash or closely imitate art you have no
  documented right to use; "found online" is not a licence.
- **Third-party assets** only under a licence compatible with the project's
  licence and distribution, as the project profile states. Record the exact
  licence and keep its attribution terms.
- **Reference is not source.** Photos and concept art used as reference are
  noted but not copied into the asset unless their licence allows it.
- **Generated content** (procedural or tool-assisted) records the generator,
  its version, parameters and seed, and any inputs (scans, textures, models)
  with their own provenance. If the project allows AI-assisted generation,
  record the tool, prompts or settings, and follow the project's policy on it;
  if the project has no policy, ask before using it.
- **Modifications** of third-party work: record what was changed. Under
  Creative Commons, an adaptation credits the original with Title, Author,
  Source, Licence (TASL) and says it was adapted.

## Record fields

See [ledger-format.md](ledger-format.md). Minimum: asset (logical name and
files), origin (original / generated / third-party / adapted), author(s),
created date, source file or generator + version + parameters + seed,
inputs and their records, licence (SPDX id where one exists), attribution
text, notes on changes.

## Method

1. Create the record when you start the asset, not at the end.
2. For third-party input, store the licence text or a stable link and the
   original source URL; check the licence permits modification and commercial
   use if needed.
3. Check the attribution reaches the project's credits page or file (the
   frontend-web-developer or ui-developer shows it; you supply the lines).
4. In review, refuse assets with missing, vague or incompatible records.
5. Licence compliance automation belongs to the devops-engineer; supply records
   in the machine-readable form the project uses.

## Parallel work

When several agents or people create assets at once, each writes its own
record file or returns its record lines; one owner merges them into the shared
log in a single edit.

## Docs this work owes

The ledger itself is **reference**. A new provenance policy or exception →
**explanation**. A procedure for importing third-party assets → **how-to**.

## Failure modes

- "We'll fill in the log later."
- Licence named vaguely ("Creative Commons", "free").
- Generated assets with no generator version or seed, so nobody can prove or
  reproduce them.
- Attribution required by a licence missing from the shipped credits.
