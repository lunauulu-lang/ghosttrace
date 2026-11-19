# GhostTrace CLI and MCP server - Design
## Layout
- `cli/core.ts`: pure-ish shared logic (no I/O except an injected file reader). `parseRepairs`, `loadBundle`, `summarizeReplay`, `handleReplay`, `handleDiff`, `handleExport`.
- `cli/node-io.ts`: the only module that touches `node:fs`; reads with a size check.
- `cli/main.ts`: argument parsing, prints text or JSON. Run with `npm run ghosttrace -- replay <file>`.
- `mcp/server.ts`: `@modelcontextprotocol/sdk` McpServer on stdio, zod input schemas, thin wrappers over the core handlers.
- `cli/node.d.ts`: minimal ambient typings for `node:fs` and `process`, because `@types/node` is not an allowed dependency.
## Decisions
1. Handlers return plain data (`{ok:true,data}` or `{ok:false,error}`) so tests call them without a transport.
2. Size is checked from `statSync` before reading; the text length is checked again by the parser.
3. A file is first tried as a bundle, then as an export file (its bundle is used; repairs default to the file preset only when none are passed).
4. `diff_runs` uses `compareReplays` on two replays of the same bundle.
5. `export_regression` uses `buildExportFile` and `serializeExport`, plus `buildRepairSpec`; nothing is written to disk.
6. stdout is reserved for MCP protocol in the server; logs go to stderr.
