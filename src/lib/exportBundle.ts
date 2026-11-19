import { replay } from "../engine/replay";
import type { IncidentBundle, RepairConfig, ReplayResult } from "../engine/types";
import { redact } from "./redact";

export const EXPORT_FORMAT = "ghosttrace-export";
export const EXPORT_FORMAT_VERSION = 1;

export const ALL_REPAIRS_OFF: RepairConfig = {
  normalizeV2Amount: false,
  deduplicateDeliveries: false,
  causalCheckoutOrder: false,
};

export type ExportFile = {
  format: typeof EXPORT_FORMAT;
  formatVersion: typeof EXPORT_FORMAT_VERSION;
  preset: { config: RepairConfig };
  bundle: unknown;
};

/** Builds the export object. The bundle is redacted and so is the whole file. Pure, never mutates input. */
export function buildExportFile(bundle: IncidentBundle, config: RepairConfig): ExportFile {
  const file = {
    format: EXPORT_FORMAT,
    formatVersion: EXPORT_FORMAT_VERSION,
    preset: {
      config: {
        normalizeV2Amount: config.normalizeV2Amount,
        deduplicateDeliveries: config.deduplicateDeliveries,
        causalCheckoutOrder: config.causalCheckoutOrder,
      },
    },
    bundle: redact(bundle),
  };
  return redact(file) as ExportFile;
}

/** The exact text that is previewed and downloaded. */
export function serializeExport(file: ExportFile): string {
  return JSON.stringify(file, null, 2) + "\n";
}

function usd(minor: number): string {
  return "$" + (minor / 100).toFixed(2);
}

function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function codes(r: ReplayResult): string[] {
  return [...new Set(r.violations.map((v) => v.code))];
}

const REPAIR_LABELS: { key: keyof RepairConfig; label: string }[] = [
  { key: "normalizeV2Amount", label: "Schema mapping (v2 amount)" },
  { key: "causalCheckoutOrder", label: "Causal ordering" },
  { key: "deduplicateDeliveries", label: "Deduplicate applied deliveries" },
];

/** Short Markdown spec. Contains codes, delivery indexes and engine messages only; no payload values. */
export function buildRepairSpec(bundle: IncidentBundle, config: RepairConfig): string {
  const baseline = replay(bundle, ALL_REPAIRS_OFF);
  const current = replay(bundle, config);
  const currentCodes = new Set(codes(current));
  const fixed = codes(baseline).filter((c) => !currentCodes.has(c));
  const lines: string[] = [];
  lines.push(`# Kiro repair spec: ${cell(bundle.title)}`);
  lines.push("");
  lines.push("All amounts are simulated synthetic values. No real payment occurred.");
  lines.push("");
  lines.push("## Failing invariants (all repairs off)");
  lines.push("");
  if (baseline.violations.length === 0) {
    lines.push("None.");
  } else {
    lines.push("| Code | Delivery | Message |");
    lines.push("|---|---|---|");
    for (const v of baseline.violations) {
      lines.push(`| ${v.code} | d${v.deliveryIndex} | ${cell(v.message)} |`);
    }
  }
  lines.push("");
  lines.push("## Repairs applied");
  lines.push("");
  for (const r of REPAIR_LABELS) lines.push(`- [${config[r.key] ? "x" : " "}] ${r.label}`);
  lines.push("");
  lines.push("## Fixed");
  lines.push("");
  if (fixed.length === 0) lines.push("None.");
  else for (const c of fixed) lines.push(`- ${c}`);
  lines.push("");
  lines.push("## Still failing");
  lines.push("");
  const remaining = codes(current);
  if (remaining.length === 0) lines.push("None.");
  else for (const c of remaining) lines.push(`- ${c}`);
  lines.push("");
  lines.push("## Result");
  lines.push("");
  lines.push(`**${current.pass ? "PASS" : "FAIL"}**`);
  lines.push("");
  if (current.finalState.checkouts.length === 0) {
    lines.push("Final simulated state: no checkouts.");
  } else {
    for (const c of current.finalState.checkouts) {
      lines.push(
        `- Checkout ${cell(c.checkoutId)}: captured ${usd(c.capturedMinor)} of ${usd(c.totalMinor)}, fulfilled ${c.fulfilled ? "yes" : "no"}`,
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}
