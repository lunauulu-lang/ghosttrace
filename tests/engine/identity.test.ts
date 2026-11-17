import { describe, expect, it } from "vitest";
import { canonicalEventContent, canonicalJson } from "../../src/engine/identity";
import { replay } from "../../src/engine/replay";
import { validateBundle } from "../../src/engine/schema";
import type { IncidentBundle } from "../../src/engine/types";
import { cfg, deepFreeze, loadFixture } from "./helpers";

function withEvents(mutate: (b: IncidentBundle) => void): IncidentBundle {
  const b = loadFixture();
  mutate(b);
  const r = validateBundle(b);
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.bundle;
}

describe("identity", () => {
  it("canonical JSON is key-order independent and ignores deliveryIndex", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: [3, { z: 1, y: 2 }] } })).toBe(
      canonicalJson({ a: { c: [3, { y: 2, z: 1 }], d: 2 }, b: 1 }),
    );
    const f = loadFixture();
    const [d1, , d3] = f.events;
    expect(d1 && d3 && canonicalEventContent(d1) === canonicalEventContent(d3)).toBe(true);
  });

  it("F07: same ID, identical content, different deliveryIndex -> skipped after successful apply, input untouched", () => {
    const bundle = deepFreeze(loadFixture());
    const before = JSON.stringify(bundle);
    const r = replay(bundle, cfg(1, 1, 1));
    expect(r.deliveries.filter((x) => x.decision === "duplicate_skipped").map((x) => x.deliveryIndex)).toEqual([3]);
    expect(JSON.stringify(bundle)).toBe(before);
  });

  it("F07: with dedup off the later identical delivery applies again", () => {
    const r = replay(loadFixture(), cfg(1, 1, 0));
    expect(r.deliveries.find((x) => x.deliveryIndex === 3)?.decision).toBe("applied");
  });

  it("F07b: rejected first attempt, retry applies (D=1), initial order violation stays logged", () => {
    const r = replay(loadFixture(), cfg(1, 0, 1));
    expect(r.deliveries.find((x) => x.deliveryIndex === 1)?.decision).toBe("rejected");
    expect(r.deliveries.find((x) => x.deliveryIndex === 3)?.decision).toBe("applied");
    expect(r.violations.some((v) => v.code === "order_violation" && v.deliveryIndex === 1)).toBe(true);
    expect(r.targetReached).toBe(true);
    expect(r.pass).toBe(false);
  });

  it("F08: same ID, changed canonical content (unknown payload field) is a hard conflict for every config", () => {
    const bundle = withEvents((b) => {
      const e = b.events[2];
      if (e) e.payload = { ...e.payload, extra_note: "changed" };
    });
    for (let bits = 0; bits < 8; bits++) {
      const r = replay(bundle, cfg(((bits >> 2) & 1) as 0 | 1, ((bits >> 1) & 1) as 0 | 1, (bits & 1) as 0 | 1));
      expect(r.halted).toBe(true);
      expect(r.conflicts.map((g) => g.eventId)).toEqual(["evt-payment-001"]);
      expect(r.deliveries.every((x) => x.decision === "hard_conflict")).toBe(true);
      expect(r.executionOrder).toHaveLength(0);
      expect(r.pass).toBe(false);
    }
  });
});
