# asset-pipeline

*Reference, for users of the technical-artist plugin looking up the `asset-pipeline` skill.*

| Field | Value |
|---|---|
| Name | `asset-pipeline` |
| Source | [`skills/asset-pipeline/SKILL.md`](../../skills/asset-pipeline/SKILL.md) |
| Use when | Adding, renaming, importing or reorganising assets; naming, folder and import conventions; import automation; validation; manifest. |
| Produces | Conventions, import presets, a validator with actionable messages, manifest entries. |
| Docs owed | Conventions and validator rules: reference + explanation. Add-asset and fix-error procedures: how-to. First import: tutorial. |

## Method steps

1. Write the rules down
2. Automate import from name/folder
3. Validate on import and in CI
4. Actionable error messages
5. Test the validator with good and bad samples
6. Roll out as warnings, then errors

## Supporting files

- `naming-reference.md`: default Prefix_BaseName_Variant_Suffix pattern, prefixes, texture suffixes, examples
