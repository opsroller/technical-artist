# asset-provenance

*Reference, for users of the technical-artist plugin looking up the `asset-provenance` skill.*

| Field | Value |
|---|---|
| Name | `asset-provenance` |
| Source | [`skills/asset-provenance/SKILL.md`](../../skills/asset-provenance/SKILL.md) |
| Use when | Creating, importing, generating, modifying or reviewing any asset, to record origin, author, licence and how to reproduce it. |
| Produces | A provenance record per asset or generated family; attribution lines for credits. |
| Docs owed | Ledger: reference. New policy or exception: explanation. Third-party import procedure: how-to. |

## Method steps

1. Create the record when starting the asset
2. Store licence and source for third-party input
3. Check attribution reaches the credits
4. Refuse assets with missing or incompatible records
5. Supply machine-readable records for compliance automation

## Supporting files

- `ledger-format.md`: default record fields with generated and third-party examples
