import { describe, expect, it } from "vitest";
import { replay } from "../../src/engine/replay";
import type { IncidentBundle } from "../../src/engine/types";
import { buildExportFile, buildRepairSpec, serializeExport } from "../../src/lib/exportBundle";
import { REDACTED } from "../../src/lib/redact";
import { cfg, deepFreeze, loadFixture } from "../engine/helpers";

const SENTINELS = ["SENTINEL_TOKEN", "SENTINEL_APIKEY", "SENTINEL_XSIG", "SENTINEL_WHSIG", "SENTINEL_COOKIE", "SENTINEL_AUTH", "SENTINEL_CARD", "SENTINEL_SECRET"];

function dirtyBundle(): IncidentBundle {
  const b = loadFixture();
  const first = b.events[0]!;
  first.payload = {
    ...first.payload,
    token: "SENTINEL_TOKEN",
    meta: {
      deep: { api_key: "SENTINEL_APIKEY", list: [{ "X-Signature": "SENTINEL_XSIG" }] },
      headers: { "Webhook-Signature": "SENTINEL_WHSIG", Cookie: "SENTINEL_COOKIE", Authorization: "SENTINEL_AUTH" },
    },
    card_number: "SENTINEL_CARD",
    client_secret: "SENTINEL_SECRET",
  };
  return b;
}

describe("export format", () => {
  it("F13: has format fields, preset and bundle", () => {
    const b = loadFixture();
    const file = buildExportFile(b, cfg(1, 1, 1));
    expect(file.format).toBe("ghosttrace-export");
    expect(file.formatVersion).toBe(1);
    expect(file.preset.config).toEqual({ normalizeV2Amount: true, causalCheckoutOrder: true, deduplicateDeliveries: true });
    expect(file.bundle).toEqual(b);
  });

  it("serializes with two-space indent and trailing newline, deterministically", () => {
    const f = buildExportFile(loadFixture(), cfg(0, 0, 0));
    const a = serializeExport(f);
    expect(a.endsWith("}\n")).toBe(true);
    expect(a).toContain('\n  "format"');
    expect(serializeExport(buildExportFile(loadFixture(), cfg(0, 0, 0)))).toBe(a);
  });

  it("F12/F22: no secret value survives in JSON or spec, for nested token, api_key, X-Signature and more", () => {
    const b = dirtyBundle();
    for (const c of [cfg(0, 0, 0), cfg(1, 1, 0), cfg(1, 1, 1)]) {
      const json = serializeExport(buildExportFile(b, c));
      const spec = buildRepairSpec(b, c);
      for (const s of SENTINELS) {
        expect(json).not.toContain(s);
        expect(spec).not.toContain(s);
      }
      expect(json).toContain(REDACTED);
    }
  });

  it("F22: key names X-Signature, signature and Webhook-Signature are scrubbed at depth", () => {
    const b = loadFixture();
    b.events[1]!.payload = { a: { b: { c: { signature: "SENTINEL_XSIG", "x-signature": "SENTINEL_XSIG", "Webhook-Signature": "SENTINEL_WHSIG" } } } };
    const json = serializeExport(buildExportFile(b, cfg(1, 1, 1)));
    expect(json).not.toContain("SENTINEL_");
  });

  it("does not mutate a deep-frozen input and is not the same object", () => {
    const b = deepFreeze(dirtyBundle());
    const before = JSON.stringify(b);
    const file = buildExportFile(b, cfg(1, 1, 1));
    buildRepairSpec(b, cfg(1, 1, 1));
    expect(JSON.stringify(b)).toBe(before);
    expect(file.bundle).not.toBe(b);
  });

  it("F21: very deep payload does not crash the export", () => {
    const b = loadFixture();
    let v: unknown = "leaf";
    for (let i = 0; i < 100; i++) v = { n: v };
    b.events[0]!.payload = { ...b.events[0]!.payload, deep: v };
    const text = serializeExport(buildExportFile(b, cfg(1, 1, 1)));
    expect(text).toContain("[MAX_DEPTH_EXCEEDED]");
  });
});

describe("repair spec", () => {
  it("G000 lists failing invariants, no repairs, FAIL", () => {
    const b = loadFixture();
    const spec = buildRepairSpec(b, cfg(0, 0, 0));
    expect(spec).toContain("# Kiro repair spec:");
    for (const code of ["schema_drift", "order_violation", "fulfillment_without_capture"]) expect(spec).toContain(code);
    expect(spec).toContain("- [ ] Schema mapping (v2 amount)");
    expect(spec).toContain("**FAIL**");
    expect(spec).toContain("simulated");
  });

  it("G110 still fails with capture_over_total and shows $98.00", () => {
    const spec = buildRepairSpec(loadFixture(), cfg(1, 1, 0));
    expect(spec).toContain("## Still failing");
    expect(spec).toContain("- capture_over_total");
    expect(spec).toContain("$98.00");
    expect(spec).toContain("**FAIL**");
  });

  it("G111 passes, lists fixed codes and nothing still failing", () => {
    const b = loadFixture();
    const spec = buildRepairSpec(b, cfg(1, 1, 1));
    expect(spec).toContain("**PASS**");
    expect(spec).toContain("$49.00 of $49.00");
    const fixed = spec.split("## Fixed")[1]!.split("## Still failing")[0]!;
    expect(fixed).toContain("schema_drift");
    expect(fixed).toContain("order_violation");
    expect(spec.split("## Still failing")[1]!.split("## Result")[0]).toContain("None.");
    expect(replay(b, cfg(1, 1, 1)).pass).toBe(true);
  });

  it("has no payload amounts from events (only engine messages and state)", () => {
    const spec = buildRepairSpec(loadFixture(), cfg(1, 1, 1));
    expect(spec).not.toContain("payload");
  });
});
