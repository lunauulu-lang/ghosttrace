import { handleReplay, type ReplaySummary } from "./core";
import { readTextFile } from "./node-io";

const USAGE = "Usage: ghosttrace replay <bundle.json> [--repairs M,O,D] [--json]";

export type CliOutput = { code: number; stdout: string; stderr: string };

function usd(minor: number): string {
  return "$" + (minor / 100).toFixed(2);
}

export function formatText(s: ReplaySummary): string {
  const lines = [
    `${s.result}  captured ${s.capturedMinor}/${s.totalMinor} minor units (${usd(s.capturedMinor)} of ${usd(s.totalMinor)})`,
    `repairs: M=${s.config.normalizeV2Amount} O=${s.config.causalCheckoutOrder} D=${s.config.deduplicateDeliveries}`,
  ];
  if (s.halted) lines.push("replay halted: identity conflict");
  lines.push(s.violations.length === 0 ? "violations: none" : "violations:");
  for (const v of s.violations) lines.push(`  - ${v.code} at d${v.deliveryIndex} (${v.eventId}): ${v.message}`);
  const d = s.firstDivergenceVsBaseline;
  lines.push(
    d
      ? `first divergence vs all-off baseline: d${d.deliveryIndex} ${d.eventId} (baseline ${d.baseline}, repaired ${d.repaired})`
      : "first divergence vs all-off baseline: none",
  );
  lines.push("Simulated synthetic data; no real payment.");
  return lines.join("\n") + "\n";
}

/** Pure entry: argv without node/script. Returns output instead of printing. */
export function runCli(args: string[], read = readTextFile): CliOutput {
  const usage = (msg: string): CliOutput => ({ code: 2, stdout: "", stderr: `${msg}\n${USAGE}\n` });
  const [cmd, ...rest] = args;
  if (cmd !== "replay") return usage(cmd ? `Unknown command "${cmd}".` : "Missing command.");
  let file: string | undefined;
  let repairs: string | undefined;
  let json = false;
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i] as string;
    if (a === "--json") json = true;
    else if (a === "--repairs") {
      repairs = rest[++i];
      if (repairs === undefined) return usage("--repairs needs a value.");
    } else if (a.startsWith("--")) return usage(`Unknown option "${a}".`);
    else if (file === undefined) file = a;
    else return usage(`Unexpected argument "${a}".`);
  }
  if (file === undefined) return usage("Missing bundle path.");
  const r = handleReplay(file, repairs, read);
  if (!r.ok) return { code: 2, stdout: "", stderr: r.error + "\n" };
  return { code: 0, stdout: json ? JSON.stringify(r.data, null, 2) + "\n" : formatText(r.data), stderr: "" };
}

