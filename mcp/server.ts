import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { handleDiff, handleExport, handleReplay, type Outcome } from "../cli/core";
import { readTextFile } from "../cli/node-io";

function toResult(r: Outcome<unknown>) {
  if (!r.ok) return { isError: true, content: [{ type: "text" as const, text: r.error }] };
  return { content: [{ type: "text" as const, text: JSON.stringify(r.data, null, 2) }] };
}

const path = z.string().min(1).describe("Path to an incident bundle JSON or GhostTrace export file (max 1 MiB)");
const repairs = z.string().optional().describe('Comma list of M, O, D (M=v2 amount mapping, O=causal order, D=dedup). Empty = none.');

export function createServer(): McpServer {
  const server = new McpServer({ name: "ghosttrace", version: "0.0.0" });
  server.registerTool(
    "replay_incident",
    { description: "Replay an incident bundle with chosen repairs; returns PASS/FAIL, captured amount, violations and first divergence vs all-off baseline.", inputSchema: { path, repairs } },
    async (a) => toResult(handleReplay(a.path, a.repairs, readTextFile)),
  );
  server.registerTool(
    "diff_runs",
    { description: "Replay the same bundle with two repair sets and return the first divergence.", inputSchema: { path, repairsA: repairs, repairsB: repairs } },
    async (a) => toResult(handleDiff(a.path, a.repairsA, a.repairsB, readTextFile)),
  );
  server.registerTool(
    "export_regression",
    { description: "Return a sanitized (redacted) export bundle, repair preset and Markdown repair spec. Writes nothing to disk.", inputSchema: { path, repairs } },
    async (a) => toResult(handleExport(a.path, a.repairs, readTextFile)),
  );
  return server;
}

const server = createServer();
await server.connect(new StdioServerTransport());
process.stderr.write("ghosttrace MCP server ready (stdio)\n");
