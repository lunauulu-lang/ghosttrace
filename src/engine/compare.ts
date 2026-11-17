import { canonicalJson } from "./identity";
import type { DeliveryRecord, ReplayResult } from "./types";

export type DivergencePoint = {
  eventId: string;
  deliveryIndex: number;
  /** null if this (eventId, deliveryIndex) pair has no record in that run. */
  baseline: DeliveryRecord | null;
  repaired: DeliveryRecord | null;
};

export type CompareResult = {
  inputHashMatch: boolean;
  /** Ascending deliveryIndex (original delivery order). */
  divergences: readonly DivergencePoint[];
  /** divergences[0] ?? null */
  firstDivergence: DivergencePoint | null;
};

function pairKey(r: { eventId: string; deliveryIndex: number }): string {
  return JSON.stringify([r.eventId, r.deliveryIndex]);
}

function violationCodes(r: DeliveryRecord): string[] {
  return r.violations.map((v) => v.code).sort();
}

function sameRecord(a: DeliveryRecord, b: DeliveryRecord): boolean {
  return (
    a.decision === b.decision &&
    canonicalJson(a.before) === canonicalJson(b.before) &&
    canonicalJson(a.after) === canonicalJson(b.after) &&
    JSON.stringify(violationCodes(a)) === JSON.stringify(violationCodes(b))
  );
}

/**
 * Compare two replays of the SAME bundle (baseline vs repaired config). Records are paired
 * by (eventId, deliveryIndex), never by array position, and reported in original delivery
 * order. Pure: no mutation, no I/O. Different input hashes yield no divergences (not an error).
 */
export function compareReplays(baseline: ReplayResult, repaired: ReplayResult): CompareResult {
  if (baseline.inputHash !== repaired.inputHash) {
    return { inputHashMatch: false, divergences: [], firstDivergence: null };
  }
  const base = new Map<string, DeliveryRecord>();
  for (const d of baseline.deliveries) base.set(pairKey(d), d);
  const rep = new Map<string, DeliveryRecord>();
  for (const d of repaired.deliveries) rep.set(pairKey(d), d);

  const keys = new Set<string>([...base.keys(), ...rep.keys()]);
  const out: DivergencePoint[] = [];
  for (const key of keys) {
    const b = base.get(key) ?? null;
    const r = rep.get(key) ?? null;
    if (b !== null && r !== null && sameRecord(b, r)) continue;
    const id = (b ?? r) as DeliveryRecord;
    out.push({ eventId: id.eventId, deliveryIndex: id.deliveryIndex, baseline: b, repaired: r });
  }
  out.sort((x, y) =>
    x.deliveryIndex !== y.deliveryIndex
      ? x.deliveryIndex - y.deliveryIndex
      : x.eventId < y.eventId
        ? -1
        : x.eventId > y.eventId
          ? 1
          : 0,
  );
  return { inputHashMatch: true, divergences: out, firstDivergence: out[0] ?? null };
}
