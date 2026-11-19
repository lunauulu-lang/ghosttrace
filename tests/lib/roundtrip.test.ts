import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { replay } from "../../src/engine/replay";
import { buildExportFile, serializeExport } from "../../src/lib/exportBundle";
import { parseImportText } from "../../src/lib/importBundle";
import { cfg, loadFixture } from "../engine/helpers";

describe("export then import", () => {
  it("F13: G111 round trip restores bundle and preset, PASS, identical fingerprint", () => {
    const bundle = loadFixture();
    const config = cfg(1, 1, 1);
    const before = replay(bundle, config);
    const r = parseImportText(serializeExport(buildExportFile(bundle, config)));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.bundle).toEqual(bundle);
    expect(r.config).toEqual(config);
    const after = replay(r.bundle, r.config);
    expect(after.pass).toBe(true);
    expect(after.inputHash).toBe(before.inputHash);
    expect(after).toEqual(before);
  });

  it("round trip holds for all eight configs (property, seed 20261117)", () => {
    const bundle = loadFixture();
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), fc.boolean(), (m, o, d) => {
        const config = { normalizeV2Amount: m, causalCheckoutOrder: o, deduplicateDeliveries: d };
        const r = parseImportText(serializeExport(buildExportFile(bundle, config)));
        if (!r.ok) return false;
        const a = replay(bundle, config);
        const b = replay(r.bundle, r.config);
        return r.config.normalizeV2Amount === m && r.config.causalCheckoutOrder === o && r.config.deduplicateDeliveries === d && a.inputHash === b.inputHash && a.pass === b.pass;
      }),
      { seed: 20261117, numRuns: 50 },
    );
  });

  it("an exported file contains no secret even when the source bundle had some, and still re-imports", () => {
    const bundle = loadFixture();
    bundle.events[0]!.payload = { ...bundle.events[0]!.payload, api_key: "SENTINEL_APIKEY", nested: { token: "SENTINEL_TOKEN" } };
    const text = serializeExport(buildExportFile(bundle, cfg(1, 1, 1)));
    expect(text).not.toContain("SENTINEL_");
    expect(parseImportText(text).ok).toBe(true);
  });
});
