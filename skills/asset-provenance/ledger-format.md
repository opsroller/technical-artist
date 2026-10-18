# Provenance record format (default)

Use the project's format if it has one. Otherwise one record per asset or
generated family, e.g. as YAML or a table row:

```yaml
asset: SM_Crate_01            # logical name in the manifest
files:
  - <path to runtime asset>
  - <path to texture set>
origin: generated              # original | generated | third-party | adapted
authors: [technical-artist]    # people or roles
created: 2026-01-15
source: <path to DCC source file, or generator path>
generator:
  name: GEN_Crate
  version: <commit or tag>
  params: <path to parameter file>
  seed: 1234
inputs: []                     # other assets used, each with its own record
license: GPL-2.0-or-later      # SPDX id; project licence for original work
attribution: ""                # exact credit text if a licence requires it
changes: ""                    # for adapted third-party work
notes: ""
```

Third-party example fields: `source_url`, `license: CC-BY-4.0`,
`attribution: "Title" by Author (source URL), CC BY 4.0, adapted (recoloured)`.
