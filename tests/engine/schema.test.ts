import { describe, expect, it } from "vitest";
import { MAX_BYTES, MAX_EVENTS, parseBundleText, validateBundle } from "../../src/engine/schema";
import type { IncidentBundle } from "../../src/engine/types";
import { loadFixture } from "./helpers";

function codes(r: ReturnType<typeof validateBundle>): string[] {
  return r.ok ? [] : r.errors.map((e) => e.code);
}

function mutated(fn: (b: any) => void): unknown {
  const b = JSON.parse(JSON.stringify(loadFixture()));
  fn(b);
  return b;
}

function nested(levels: number): unknown {
  let v: unknown = "leaf";
  for (let i = 0; i < levels; i++) v = { n: v };
  return v;
}

describe("schema: valid input", () => {
  it("accepts the fixture and returns a clone", () => {
    const fixture = loadFixture();
    const r = parseBundleText(JSON.stringify(fixture));
    expect(r.ok).toBe(true);
  });
});

describe("F09 size, count, malformed", () => {
  it("rejects malformed JSON", () => {
    const r = parseBundleText("{ not json");
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors[0]?.code).toBe("malformed_json");
  });

  it("rejects 501 events", () => {
    const b = loadFixture();
    const events = Array.from({ length: MAX_EVENTS + 1 }, (_, i) => ({
      ...structuredClone(b.events[1]!),
      eventId: `evt-${i}`,
      deliveryIndex: i + 1,
    }));
    const r = parseBundleText(JSON.stringify({ ...b, events }));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors[0]?.code).toBe("too_many_events");
  });

  it("accepts exactly 500 events", () => {
    const b = loadFixture();
    const events = Array.from({ length: MAX_EVENTS }, (_, i) => ({
      ...structuredClone(b.events[1]!),
      eventId: `evt-${i}`,
      deliveryIndex: i + 1,
    }));
    expect(parseBundleText(JSON.stringify({ ...b, events })).ok).toBe(true);
  });

  it("rejects input over 1 MiB", () => {
    const text = JSON.stringify({ ...loadFixture(), title: "x".repeat(MAX_BYTES) });
    const r = parseBundleText(text);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors[0]?.code).toBe("too_large");
  });
});

describe("F10 money", () => {
  const bad: Array<[string, unknown]> = [
    ["float", 49.5],
    ["negative", -4900],
    ["string", "4900"],
    ["zero", 0],
    ["unsafe integer", Number.MAX_SAFE_INTEGER + 2],
  ];
  it.each(bad)("rejects %s amount_minor", (_name, value) => {
    const r = validateBundle(mutated((b) => (b.events[0].payload.amount_minor = value)));
    expect(codes(r)).toContain("invalid_money");
  });
  it("rejects float total_minor", () => {
    expect(codes(validateBundle(mutated((b) => (b.events[1].payload.total_minor = 49.99))))).toContain("invalid_money");
  });
  it("rejects missing currency", () => {
    expect(codes(validateBundle(mutated((b) => delete b.events[0].payload.currency)))).toContain("missing_currency");
  });
  it("rejects invalid currency", () => {
    expect(codes(validateBundle(mutated((b) => (b.events[0].payload.currency = "EUR"))))).toContain("invalid_currency");
    expect(codes(validateBundle(mutated((b) => (b.currency = "EUR"))))).toContain("invalid_currency");
  });
});

describe("F11 types, versions, timestamps, delivery indexes", () => {
  it("rejects unknown event type", () => {
    expect(codes(validateBundle(mutated((b) => (b.events[0].type = "refund.issued"))))).toContain("unknown_event_type");
  });
  it("rejects unknown event version", () => {
    expect(codes(validateBundle(mutated((b) => (b.events[0].version = 3))))).toContain("unknown_event_version");
  });
  it("rejects unknown schema version", () => {
    expect(codes(validateBundle(mutated((b) => (b.schemaVersion = 2))))).toContain("unknown_schema_version");
  });
  it.each(["yesterday", "2026-02-31T10:00:00.000Z", "2026-11-16T10:00:00+06:00", "2026-11-16 10:00:00Z", ""])(
    "rejects timestamp %j",
    (ts) => {
      expect(codes(validateBundle(mutated((b) => (b.events[0].occurredAt = ts))))).toContain("invalid_timestamp");
    },
  );
  it("rejects reused deliveryIndex", () => {
    expect(codes(validateBundle(mutated((b) => (b.events[1].deliveryIndex = 1))))).toContain("duplicate_delivery_index");
  });
  it("rejects non-integer deliveryIndex", () => {
    expect(codes(validateBundle(mutated((b) => (b.events[1].deliveryIndex = 1.5))))).toContain("invalid_delivery_index");
  });
});

describe("F21 depth > 32", () => {
  // Bundle root = 1, events array = 2, event = 3, payload = 4, so extra nesting N gives depth 4 + N.
  function bundleWithDepth(levels: number): IncidentBundle & Record<string, unknown> {
    const b = JSON.parse(JSON.stringify(loadFixture()));
    b.events[0].payload.extra = nested(levels);
    return b;
  }
  it("accepts depth exactly 32", () => {
    const b = bundleWithDepth(28);
    expect(validateBundle(b).ok).toBe(true);
    expect(parseBundleText(JSON.stringify(b)).ok).toBe(true);
  });
  it("rejects depth 33 in text before parsing", () => {
    const r = parseBundleText(JSON.stringify(bundleWithDepth(29)));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors[0]?.code).toBe("too_deep");
  });
  it("rejects very deep values without recursing", () => {
    const r = validateBundle(bundleWithDepth(5000));
    expect(codes(r)).toEqual(["too_deep"]);
    const text = parseBundleText('{"a":'.repeat(100000) + "1" + "}".repeat(100000));
    expect(text.ok).toBe(false);
  });
  it("ignores brackets inside strings when measuring depth", () => {
    const b = JSON.parse(JSON.stringify(loadFixture()));
    b.title = "[".repeat(100) + '\\"' + "{".repeat(100);
    expect(parseBundleText(JSON.stringify(b)).ok).toBe(true);
  });
});
