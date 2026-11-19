import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { buildExportFile, serializeExport } from "../../src/lib/exportBundle";
import { parseImportText } from "../../src/lib/importBundle";
import { cfg, loadFixture } from "../engine/helpers";

function validFile(): Record<string, unknown> {
  return JSON.parse(serializeExport(buildExportFile(loadFixture(), cfg(1, 1, 1))));
}
function errorsOf(text: string) {
  const r = parseImportText(text);
  expect(r.ok).toBe(false);
  return r.ok ? [] : r.errors;
}
function codesOf(text: string): string[] {
  return errorsOf(text).map((e) => e.code);
}
function withEvent(mut: (e: Record<string, unknown>) => void, index = 0): string {
  const f = validFile();
  const events = (f.bundle as { events: Record<string, unknown>[] }).events;
  mut(events[index]!);
  return JSON.stringify(f);
}

describe("import validation", () => {
  it("accepts a valid export", () => {
    const r = parseImportText(JSON.stringify(validFile()));
    expect(r.ok).toBe(true);
  });

  it("F09: rejects over 1 MiB", () => {
    expect(codesOf(" ".repeat(1_048_577))).toEqual(["too_large"]);
  });

  it("F09: rejects malformed JSON and non-objects", () => {
    expect(codesOf("{not json")).toEqual(["malformed_json"]);
    expect(codesOf("[1,2]")).toEqual(["invalid_export"]);
    expect(codesOf("")).toEqual(["malformed_json"]);
  });

  it("F09: rejects 501 events", () => {
    const f = validFile();
    const b = f.bundle as { events: Record<string, unknown>[] };
    b.events = Array.from({ length: 501 }, (_, i) => ({ ...b.events[0]!, eventId: `e${i}`, deliveryIndex: i + 1 }));
    const errs = errorsOf(JSON.stringify(f));
    expect(errs.map((e) => e.code)).toContain("too_many_events");
  });

  it("F21: rejects depth 33 before parsing, accepts the check at depth 32 boundary logic", () => {
    const deep = "[".repeat(33) + "]".repeat(33);
    expect(codesOf(deep)).toEqual(["too_deep"]);
    const f = validFile();
    let v: unknown = "x";
    for (let i = 0; i < 40; i++) v = { n: v };
    (f.bundle as { events: { payload: Record<string, unknown> }[] }).events[0]!.payload.deep = v;
    expect(codesOf(JSON.stringify(f))).toEqual(["too_deep"]);
  });

  it("rejects wrong format and version", () => {
    const f = validFile();
    f.format = "other";
    f.formatVersion = 2;
    const c = codesOf(JSON.stringify(f));
    expect(c).toContain("unknown_format");
    expect(c).toContain("unknown_format_version");
  });

  it("rejects a missing, non-boolean or extended preset and lists each problem", () => {
    const missing = validFile();
    delete missing.preset;
    expect(errorsOf(JSON.stringify(missing)).map((e) => e.path)).toContain("preset.config");

    const bad = validFile();
    bad.preset = { config: { normalizeV2Amount: "yes", deduplicateDeliveries: true, causalCheckoutOrder: 1, extra: true } };
    const paths = errorsOf(JSON.stringify(bad)).map((e) => e.path);
    expect(paths).toEqual(
      expect.arrayContaining(["preset.config.normalizeV2Amount", "preset.config.causalCheckoutOrder", "preset.config.extra"]),
    );
  });

  it("F10: float, negative, string and zero money are rejected with a bundle. prefix", () => {
    for (const bad of [49.5, -1, "4900", 0]) {
      const text = withEvent((e) => ((e.payload as Record<string, unknown>).amount_minor = bad));
      const errs = errorsOf(text);
      expect(errs.some((e) => e.code === "invalid_money" && e.path.startsWith("bundle.events[0]"))).toBe(true);
    }
  });

  it("F10: invalid currency is rejected", () => {
    const text = withEvent((e) => ((e.payload as Record<string, unknown>).currency = "EUR"));
    expect(codesOf(text)).toContain("invalid_currency");
  });

  it("F11: unknown type, unknown version, bad timestamp, reused deliveryIndex", () => {
    expect(codesOf(withEvent((e) => (e.type = "refund.issued")))).toContain("unknown_event_type");
    expect(codesOf(withEvent((e) => (e.version = 9)))).toContain("unknown_event_version");
    expect(codesOf(withEvent((e) => (e.occurredAt = "2026-02-30T00:00:00Z")))).toContain("invalid_timestamp");
    const dup = withEvent((e) => (e.deliveryIndex = 1), 1);
    expect(codesOf(dup)).toContain("duplicate_delivery_index");
  });

  it("shows every error at once (preset and bundle together)", () => {
    const f = validFile();
    f.format = "nope";
    f.preset = { config: {} };
    (f.bundle as { currency: string }).currency = "EUR";
    const errs = errorsOf(JSON.stringify(f));
    expect(errs.length).toBeGreaterThanOrEqual(5);
    expect(errs.map((e) => e.path)).toEqual(expect.arrayContaining(["format", "preset.config.normalizeV2Amount", "bundle.currency"]));
  });

  it("never throws for arbitrary text (seed 20261117)", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const r = parseImportText(s);
        return typeof r.ok === "boolean";
      }),
      { seed: 20261117, numRuns: 300 },
    );
    fc.assert(
      fc.property(fc.jsonValue(), (v) => {
        const r = parseImportText(JSON.stringify(v));
        return r.ok === false;
      }),
      { seed: 20261117, numRuns: 200 },
    );
  });
});
