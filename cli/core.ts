import { compareReplays } from "../src/engine/compare";
import { NO_REPAIRS } from "../src/engine/repair";
import { replay } from "../src/engine/replay";
import { MAX_BYTES, parseBundleText } from "../src/engine/schema";
import type { IncidentBundle, RepairConfig, ReplayResult, ValidationError } from "../src/engine/types";
import { buildExportFile, buildRepairSpec, serializeExport } from "../src/lib/exportBundle";
import { parseImportText } from "../src/lib/importBundle";

export type FileReader = (path: string) => { ok: true; text: string } | { ok: false; error: string };
export type Outcome<T> = { ok: true; data: T } | { ok: false; error: string };

const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });
const fmtErrors = (errs: ValidationError[]): string =>
  "Invalid input: " + errs.map((e) => `${e.path} ${e.code}: ${e.message}`).join("; ");

/** "M,O,D" (any case) -> RepairConfig. M=normalizeV2Amount, O=causalCheckoutOrder, D=deduplicateDeliveries. */
export function parseRepairs(text: string | undefined): Outcome<RepairConfig> {
  const t = (text ?? "").trim();
  if (t === "" || t.toLowerCase() === "none") return { ok: true, data: { ...NO_REPAIRS } };
  const cfg = { ...NO_REPAIRS };
  for (const raw of t.split(",")) {
    const tok = raw.trim().toUpperCase();
    if (tok === "M") cfg.normalizeV2Amount = true;
    else if (tok === "O") cfg.causalCheckoutOrder = true;
    else if (tok === "D") cfg.deduplicateDeliveries = true;
    else return fail(`Unknown repair "${raw.trim()}". Use M, O, D separated by commas.`);
  }
  return { ok: true, data: cfg };
}

/** Reads a bundle file or a GhostTrace export file. Never throws. */
export function loadBundle(path: string, read: FileReader): Outcome<{ bundle: IncidentBundle; preset: RepairConfig | null }> {
  if (typeof path !== "string" || path === "") return fail("A file path is required.");
  const r = read(path);
  if (!r.ok) return fail(r.error);
  if (r.text.length > MAX_BYTES) return fail(`File exceeds ${MAX_BYTES} bytes.`);
  const plain = parseBundleText(r.text);
  if (plain.ok) return { ok: true, data: { bundle: plain.bundle, preset: null } };
  const exported = parseImportText(r.text);
  if (exported.ok) return { ok: true, data: { bundle: exported.bundle, preset: exported.config } };
  return fail(fmtErrors(plain.errors));
}

export function summarizeReplay(r: ReplayResult, baseline: ReplayResult) {
  const cmp = compareReplays(baseline, r);
  const totalMinor = r.finalState.checkouts.reduce((s, c) => s + c.totalMinor, 0);
  const capturedMinor = r.finalState.checkouts.reduce((s, c) => s + c.capturedMinor, 0);
  const first = cmp.firstDivergence;
  return {
    result: r.pass ? ("PASS" as const) : ("FAIL" as const),
    config: r.config,
    halted: r.halted,
    capturedMinor,
    totalMinor,
    fulfilled: r.finalState.checkouts.map((c) => ({ checkoutId: c.checkoutId, fulfilled: c.fulfilled })),
    violations: r.violations.map((v) => ({ code: v.code, deliveryIndex: v.deliveryIndex, eventId: v.eventId, message: v.message })),
    firstViolation: r.firstDivergence
      ? { code: r.firstDivergence.code, deliveryIndex: r.firstDivergence.deliveryIndex, eventId: r.firstDivergence.eventId }
      : null,
    firstDivergenceVsBaseline: first
      ? {
          eventId: first.eventId,
          deliveryIndex: first.deliveryIndex,
          baseline: first.baseline?.decision ?? null,
          repaired: first.repaired?.decision ?? null,
        }
      : null,
    inputHash: r.inputHash,
  };
}
export type ReplaySummary = ReturnType<typeof summarizeReplay>;

export function handleReplay(path: string, repairs: string | undefined, read: FileReader): Outcome<ReplaySummary> {
  const cfg = parseRepairs(repairs);
  if (!cfg.ok) return cfg;
  const loaded = loadBundle(path, read);
  if (!loaded.ok) return loaded;
  const { bundle } = loaded.data;
  return { ok: true, data: summarizeReplay(replay(bundle, cfg.data), replay(bundle, NO_REPAIRS)) };
}

export function handleDiff(path: string, repairsA: string | undefined, repairsB: string | undefined, read: FileReader) {
  const a = parseRepairs(repairsA);
  if (!a.ok) return a;
  const b = parseRepairs(repairsB);
  if (!b.ok) return b;
  const loaded = loadBundle(path, read);
  if (!loaded.ok) return loaded;
  const { bundle } = loaded.data;
  const runA = replay(bundle, a.data);
  const runB = replay(bundle, b.data);
  const cmp = compareReplays(runA, runB);
  const slim = (d: typeof cmp.divergences[number]) => ({
    eventId: d.eventId,
    deliveryIndex: d.deliveryIndex,
    a: d.baseline ? { decision: d.baseline.decision, violations: d.baseline.violations.map((v) => v.code), after: d.baseline.after } : null,
    b: d.repaired ? { decision: d.repaired.decision, violations: d.repaired.violations.map((v) => v.code), after: d.repaired.after } : null,
  });
  const data = {
    a: { config: a.data, result: runA.pass ? ("PASS" as const) : ("FAIL" as const) },
    b: { config: b.data, result: runB.pass ? ("PASS" as const) : ("FAIL" as const) },
    identical: cmp.divergences.length === 0,
    divergenceCount: cmp.divergences.length,
    firstDivergence: cmp.firstDivergence ? slim(cmp.firstDivergence) : null,
  };
  return { ok: true as const, data };
}

export function handleExport(path: string, repairs: string | undefined, read: FileReader) {
  const cfg = parseRepairs(repairs);
  if (!cfg.ok) return cfg;
  const loaded = loadBundle(path, read);
  if (!loaded.ok) return loaded;
  const file = buildExportFile(loaded.data.bundle, cfg.data);
  return {
    ok: true as const,
    data: {
      preset: file.preset,
      exportFile: file,
      exportText: serializeExport(file),
      repairSpec: buildRepairSpec(loaded.data.bundle, cfg.data),
    },
  };
}


