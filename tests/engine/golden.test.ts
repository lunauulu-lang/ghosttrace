import { describe, expect, it } from "vitest";
import { replay } from "../../src/engine/replay";
import type { ViolationCode } from "../../src/engine/types";
import { cfg, loadFixture } from "./helpers";

type Row = {
  id: string;
  m: 0 | 1;
  o: 0 | 1;
  d: 0 | 1;
  captured: number;
  fulfilled: boolean;
  codes: ViolationCode[];
  pass: boolean;
};

// Exactly as in docs/TEST_MATRIX.md (golden replay matrix).
const TABLE: Row[] = [
  { id: "G000", m: 0, o: 0, d: 0, captured: 0, fulfilled: false, codes: ["schema_drift", "order_violation", "fulfillment_without_capture"], pass: false },
  { id: "G001", m: 0, o: 0, d: 1, captured: 0, fulfilled: false, codes: ["schema_drift", "order_violation", "fulfillment_without_capture"], pass: false },
  { id: "G010", m: 0, o: 1, d: 0, captured: 0, fulfilled: false, codes: ["schema_drift", "fulfillment_without_capture"], pass: false },
  { id: "G011", m: 0, o: 1, d: 1, captured: 0, fulfilled: false, codes: ["schema_drift", "fulfillment_without_capture"], pass: false },
  { id: "G100", m: 1, o: 0, d: 0, captured: 4900, fulfilled: true, codes: ["order_violation"], pass: false },
  { id: "G101", m: 1, o: 0, d: 1, captured: 4900, fulfilled: true, codes: ["order_violation"], pass: false },
  { id: "G110", m: 1, o: 1, d: 0, captured: 9800, fulfilled: false, codes: ["capture_over_total", "fulfillment_amount_mismatch"], pass: false },
  { id: "G111", m: 1, o: 1, d: 1, captured: 4900, fulfilled: true, codes: [], pass: true },
];

describe("golden outcomes G000-G111 on fixtures/haunted-checkout.json", () => {
  it.each(TABLE)("$id", (row) => {
    const result = replay(loadFixture(), cfg(row.m, row.o, row.d));
    const checkout = result.finalState.checkouts.find((c) => c.checkoutId === "demo-001");
    expect(checkout?.capturedMinor).toBe(row.captured);
    expect(checkout?.fulfilled).toBe(row.fulfilled);
    const emitted = new Set(result.violations.map((v) => v.code));
    for (const code of row.codes) expect(emitted.has(code)).toBe(true);
    if (row.codes.length === 0) expect(result.violations).toHaveLength(0);
    expect(result.pass).toBe(row.pass);
    expect(result.halted).toBe(false);
  });

  it("G110 overcapture (9800) vs G111 clean (4900)", () => {
    const f = loadFixture();
    expect(replay(f, cfg(1, 1, 0)).finalState.checkouts[0]?.capturedMinor).toBe(9800);
    expect(replay(f, cfg(1, 1, 1)).finalState.checkouts[0]?.capturedMinor).toBe(4900);
  });

  it("G100/G101: d1 is rejected, retry d3 applies, rejected d1 does not reserve the key", () => {
    for (const d of [0, 1] as const) {
      const r = replay(loadFixture(), cfg(1, 0, d));
      const byIndex = new Map(r.deliveries.map((x) => [x.deliveryIndex, x.decision]));
      expect(byIndex.get(1)).toBe("rejected");
      expect(byIndex.get(3)).toBe("applied");
      expect(r.firstDivergence?.code).toBe("order_violation");
      expect(r.firstDivergence?.deliveryIndex).toBe(1);
    }
  });

  it("G111: later identical delivery is duplicate_skipped", () => {
    const r = replay(loadFixture(), cfg(1, 1, 1));
    expect(r.deliveries.find((x) => x.deliveryIndex === 3)?.decision).toBe("duplicate_skipped");
    expect(r.targetReached).toBe(true);
  });

  it("G000 reports the first divergent delivery (d1)", () => {
    const r = replay(loadFixture(), cfg(0, 0, 0));
    expect(r.firstDivergence?.deliveryIndex).toBe(1);
    expect(r.firstDivergence?.eventId).toBe("evt-payment-001");
  });
});
