import { describe, expect, it } from "vitest";
import { compareReplays } from "../../src/engine/compare";
import { replay } from "../../src/engine/replay";
import { validateBundle } from "../../src/engine/schema";
import type { IncidentBundle } from "../../src/engine/types";
import { cfg, deepFreeze, loadFixture } from "./helpers";

function ev(eventId: string, deliveryIndex: number, extra: Record<string, unknown> = {}) {
  return {
    eventId,
    deliveryIndex,
    occurredAt: "2026-11-16T10:00:00.000Z",
    type: "checkout.created",
    version: 1,
    checkoutId: "c1",
    payload: { total_minor: 1000, currency: "USD", ...extra },
  };
}

function inlineBundle(events: unknown[], incidentId = "inline-1"): IncidentBundle {
  const r = validateBundle({ schemaVersion: 1, incidentId, title: "t", currency: "USD", events });
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.bundle;
}

describe("compareReplays", () => {
  it("F24: G000 vs G111 on the fixture", () => {
    const bundle = loadFixture();
    const a = replay(bundle, cfg(0, 0, 0));
    const b = replay(bundle, cfg(1, 1, 1));
    const c = compareReplays(a, b);
    expect(c.inputHashMatch).toBe(true);
    expect(a.executionOrder).not.toEqual(b.executionOrder);
    const idx = c.divergences.map((d) => d.deliveryIndex);
    expect(idx).toEqual([...idx].sort((x, y) => x - y));
    expect(idx.length).toBeGreaterThan(0);
    expect(c.firstDivergence).toBe(c.divergences[0]);
    expect(c.firstDivergence?.deliveryIndex).toBe(1);
    expect(c.firstDivergence?.eventId).toBe("evt-payment-001");
    expect(c.firstDivergence?.baseline?.decision).toBe("rejected");
    expect(c.firstDivergence?.baseline?.violations.length).toBeGreaterThan(0);
    expect(c.firstDivergence?.repaired?.decision).toBe("applied");
  });

  it("G110 vs G111: first divergence is retry d3 (applied vs duplicate_skipped)", () => {
    const bundle = loadFixture();
    const c = compareReplays(replay(bundle, cfg(1, 1, 0)), replay(bundle, cfg(1, 1, 1)));
    expect(c.firstDivergence?.deliveryIndex).toBe(3);
    expect(c.firstDivergence?.baseline?.decision).toBe("applied");
    expect(c.firstDivergence?.repaired?.decision).toBe("duplicate_skipped");
  });

  it("a result compared with itself has zero divergences for all 8 configs", () => {
    const bundle = loadFixture();
    for (let bits = 0; bits < 8; bits++) {
      const r = replay(bundle, cfg(((bits >> 2) & 1) as 0 | 1, ((bits >> 1) & 1) as 0 | 1, (bits & 1) as 0 | 1));
      const c = compareReplays(r, r);
      expect(c.inputHashMatch).toBe(true);
      expect(c.divergences).toHaveLength(0);
      expect(c.firstDivergence).toBeNull();
    }
  });

  it("mismatched input hash: inputHashMatch false, no divergences, no throw", () => {
    const a = replay(loadFixture(), cfg(0, 0, 0));
    const other = inlineBundle([ev("e1", 1)]);
    const b = replay(other, cfg(0, 0, 0));
    const c = compareReplays(a, b);
    expect(c.inputHashMatch).toBe(false);
    expect(c.divergences).toHaveLength(0);
    expect(c.firstDivergence).toBeNull();
  });

  it("halted runs (hard identity conflict): both halted, same hash, zero divergences", () => {
    const bundle = inlineBundle([ev("e1", 1), ev("e1", 2, { note: "changed" })]);
    const a = replay(bundle, cfg(0, 0, 0));
    const b = replay(bundle, cfg(1, 1, 1));
    expect(a.halted).toBe(true);
    expect(b.halted).toBe(true);
    expect(a.inputHash).toBe(b.inputHash);
    const c = compareReplays(a, b);
    expect(c.inputHashMatch).toBe(true);
    expect(c.divergences).toHaveLength(0);
  });

  it("does not mutate deep-frozen inputs", () => {
    const bundle = loadFixture();
    const a = deepFreeze(replay(bundle, cfg(0, 0, 0)));
    const b = deepFreeze(replay(bundle, cfg(1, 1, 1)));
    const before = JSON.stringify([a, b]);
    const c1 = compareReplays(a, b);
    const c2 = compareReplays(a, b);
    expect(JSON.stringify([a, b])).toBe(before);
    expect(JSON.stringify(c1)).toBe(JSON.stringify(c2));
  });
});
