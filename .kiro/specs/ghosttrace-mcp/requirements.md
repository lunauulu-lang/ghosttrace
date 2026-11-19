# GhostTrace CLI and MCP server - Requirements
Scope: two more heads on the same pure engine: a read-only CLI and a local stdio MCP server. Covers T11 of `.kiro/specs/ghosttrace/tasks.md`. `src/engine/**`, `src/lib/**` and existing tests are not changed. All data is synthetic; PASS means only that this synthetic replay passed.

## Terms
- Repairs: letters M (normalizeV2Amount), O (causalCheckoutOrder), D (deduplicateDeliveries). Empty or `none` means all off.
- Input file: a path given by the user to an incident bundle JSON or a GhostTrace export file.

## R1 Input safety
- WHEN a tool or command receives a path, THE SYSTEM SHALL reject a file larger than 1 MiB before parsing it.
- THE SYSTEM SHALL validate file content with `parseBundleText` (bundle) or `parseImportText` (export file) and report every validation error without throwing.
- THE SYSTEM SHALL NOT open network connections and SHALL NOT write any file.
- IF the path cannot be read, THEN THE SYSTEM SHALL return a readable error and no result.

## R2 Repairs parsing
- WHEN the repairs string contains only the letters M, O, D (any case, comma separated, duplicates allowed), THE SYSTEM SHALL build the matching RepairConfig.
- IF the repairs string contains anything else, THEN THE SYSTEM SHALL return an error naming the bad token.

## R3 CLI
- WHEN the user runs `ghosttrace replay <file> [--repairs M,O,D] [--json]`, THE SYSTEM SHALL print PASS or FAIL, captured over total minor units, the violations, and the first divergence versus the all-off baseline.
- WHEN `--json` is given, THE SYSTEM SHALL print one JSON object with the same facts.
- THE SYSTEM SHALL exit 0 on a completed replay (PASS or FAIL) and exit 2 on usage or input errors.

## R4 MCP tools (stdio)
- THE SYSTEM SHALL expose `replay_incident` (path, repairs) returning a result summary.
- THE SYSTEM SHALL expose `diff_runs` (path, repairsA, repairsB) returning the first divergence between the two runs.
- THE SYSTEM SHALL expose `export_regression` (path, repairs) returning the redacted export file and the repair preset.
- THE SYSTEM SHALL pass every export through `redact` so no value under a secret key appears in the output.
- IF a tool fails, THEN THE SYSTEM SHALL return `isError: true` with a message instead of crashing.

## R5 Evidence
- THE SYSTEM SHALL be registered as `ghosttrace` in `.kiro/settings/mcp.json`.
- THE SYSTEM SHALL have Vitest tests for the CLI and for each tool handler: G000 FAIL, G110 shows 9800, G111 PASS, secrets never in `export_regression`.
