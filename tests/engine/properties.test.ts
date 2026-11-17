import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { replay } from "../../src/engine/replay";
import type { IncidentBundle, IncidentEvent } from "../../src/engine/types";
import { cfg, deepFreeze, loadFixture } from "./helpers";

const PARAMS = { seed: 20261117, numRuns: 200 } as const;

/** Rebuild the fixture with its events in a new delivery order (and extra identical retries of the payment). */
function reorder(perm: number[], extraRetries: number): IncidentBundle {
  const base = loadFixture();
  const events: IncidentEvent[] = [];
  for (const i of perm) events.push(structuredClone(base.events[i]!));
  const payment = base.events[0]!;
  for (let k = 0; k < extraRetries; k++) events.push(structuredClone(payment));
  events.forEach((e, idx) => (e.deliveryIndex = idx + 1));
  return { ...base, events };
}

const permutation = fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 });
const config = fc.record({
  normalizeV2Amount: fc.boolean(),
  deduplicateDeliveries: fc.boolean(),
  causalCheckoutOrder: fc.boolean(),
});

describe("properties (seed 20261117, 200 runs)", () => {
  it("F14: all repairs on, any delivery permutation -> same final state, zero violations", () => {
    fc.assert(
      fc.property(permutation, fc.integer({ min: 0, max: 3 }), (perm, extra) => {
        const r = replay(reorder(perm, extra), cfg(1, 1, 1));
        expect(r.violations).toHaveLength(0);
        expect(r.pass).toBe(true);
        expect(r.finalState).toEqual({
          checkouts: [{ checkoutId: "demo-001", totalMinor: 4900, capturedMinor: 4900, fulfilled: true }],
        });
      }),
      PARAMS,
    );
  });

  it("F15: identical input and config -> identical decisions, snapshots and hash", () => {
    fc.assert(
      fc.property(permutation, config, (perm, c) => {
        const bundle = reorder(perm, 1);
        const a = replay(bundle, c);
        const b = replay(structuredClone(bundle), c);
        expect(b).toEqual(a);
        expect(b.inputHash).toBe(a.inputHash);
      }),
      PARAMS,
    );
  });

  it("deep-frozen input is never mutated, for any config and permutation", () => {
    fc.assert(
      fc.property(permutation, config, (perm, c) => {
        const bundle = deepFreeze(reorder(perm, 2));
        const snapshot = JSON.stringify(bundle);
        expect(() => replay(bundle, c)).not.toThrow();
        expect(JSON.stringify(bundle)).toBe(snapshot);
      }),
      PARAMS,
    );
  });

  it("input hash changes when input content changes", () => {
    const a = replay(loadFixture(), cfg(1, 1, 1)).inputHash;
    const b = loadFixture();
    b.events[3]!.payload = { destination: "other" };
    expect(replay(b, cfg(1, 1, 1)).inputHash).not.toBe(a);
  });
});
