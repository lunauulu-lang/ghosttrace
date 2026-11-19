import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { handleDiff, handleExport, handleReplay, loadBundle, parseRepairs, type FileReader } from "../../cli/core";
import { runCli } from "../../cli/run";

const fixtureText = readFileSync("fixtures/haunted-checkout.json", "utf8");
const SENTINEL = "SENTINEL_SECRET_VALUE_12345";

function reader(files: Record<string, string>): FileReader {
  return (p) => (p in files ? { ok: true, text: files[p] as string } : { ok: false, error: `Cannot read file: ${p}` });
}
const files = { "f.json": fixtureText };
const read = reader(files);

function withSecrets(): string {
  const b = JSON.parse(fixtureText);
  b.events[0].payload.api_key = SENTINEL;
  b.events[0].payload.nested = { token: SENTINEL, "X-Signature": SENTINEL };
  return JSON.stringify(b);
}

describe("parseRepairs", () => {
  it("parses letters, case-insensitive, empty and none", () => {
    expect(parseRepairs("m, O,d")).toEqual({ ok: true, data: { normalizeV2Amount: true, causalCheckoutOrder: true, deduplicateDeliveries: true } });
    expect(parseRepairs("")).toMatchObject({ ok: true, data: { normalizeV2Amount: false } });
    expect(parseRepairs("none")).toMatchObject({ ok: true });
    expect(parseRepairs(undefined)).toMatchObject({ ok: true });
  });
  it("rejects unknown tokens", () => {
    const r = parseRepairs("M,X");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('"X"');
  });
});

describe("loadBundle", () => {
  it("reports unreadable and invalid files without throwing", () => {
    expect(loadBundle("missing.json", read).ok).toBe(false);
    expect(loadBundle("bad.json", reader({ "bad.json": "{not json" })).ok).toBe(false);
    expect(loadBundle("", read).ok).toBe(false);
  });
  it("rejects oversized text", () => {
    const big = reader({ "big.json": " ".repeat(1_048_577) });
    const r = loadBundle("big.json", big);
    expect(r.ok).toBe(false);
  });
});

describe("replay_incident handler", () => {
  it("G000 FAILS", () => {
    const r = handleReplay("f.json", "", read);
    expect(r.ok && r.data.result).toBe("FAIL");
  });
  it("G110 shows 9800", () => {
    const r = handleReplay("f.json", "M,O", read);
    expect(r.ok && r.data.capturedMinor).toBe(9800);
    expect(r.ok && r.data.result).toBe("FAIL");
  });
  it("G111 PASSES with 4900", () => {
    const r = handleReplay("f.json", "M,O,D", read);
    expect(r.ok && r.data.result).toBe("PASS");
    expect(r.ok && r.data.capturedMinor).toBe(4900);
    expect(r.ok && r.data.violations).toHaveLength(0);
  });
  it("returns an error for a bad path or repairs", () => {
    expect(handleReplay("nope.json", "", read).ok).toBe(false);
    expect(handleReplay("f.json", "Z", read).ok).toBe(false);
  });
});

describe("diff_runs handler", () => {
  it("first divergence between G000 and G111 is at d1", () => {
    const r = handleDiff("f.json", "", "M,O,D", read);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.identical).toBe(false);
      expect(r.data.firstDivergence?.deliveryIndex).toBe(1);
      expect(r.data.a.result).toBe("FAIL");
      expect(r.data.b.result).toBe("PASS");
    }
  });
  it("G110 vs G111 first divergence is d3", () => {
    const r = handleDiff("f.json", "M,O", "M,O,D", read);
    expect(r.ok && r.data.firstDivergence?.deliveryIndex).toBe(3);
  });
  it("identical sets have no divergence", () => {
    const r = handleDiff("f.json", "M", "m", read);
    expect(r.ok && r.data.identical).toBe(true);
    expect(r.ok && r.data.firstDivergence).toBeNull();
  });
});

describe("export_regression handler", () => {
  it("returns preset, export file and spec", () => {
    const r = handleExport("f.json", "M,O,D", read);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.preset.config.deduplicateDeliveries).toBe(true);
      expect(r.data.exportFile.format).toBe("ghosttrace-export");
      expect(r.data.repairSpec).toContain("**PASS**");
    }
  });
  it("secrets never appear in any output", () => {
    const r = handleExport("s.json", "M,O,D", reader({ "s.json": withSecrets() }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(JSON.stringify(r.data)).not.toContain(SENTINEL);
  });
  it("accepts an export file as input", () => {
    const first = handleExport("f.json", "M,O,D", read);
    if (!first.ok) throw new Error("setup");
    const r = handleReplay("e.json", "M,O,D", reader({ "e.json": first.data.exportText }));
    expect(r.ok && r.data.result).toBe("PASS");
  });
});

describe("CLI", () => {
  it("prints FAIL for no repairs and exits 0", () => {
    const o = runCli(["replay", "f.json"], read);
    expect(o.code).toBe(0);
    expect(o.stdout).toContain("FAIL");
    expect(o.stdout).toContain("first divergence vs all-off baseline");
  });
  it("prints PASS and 4900/4900 for M,O,D", () => {
    const o = runCli(["replay", "f.json", "--repairs", "M,O,D"], read);
    expect(o.stdout).toContain("PASS");
    expect(o.stdout).toContain("captured 4900/4900");
  });
  it("prints 9800 for M,O", () => {
    expect(runCli(["replay", "f.json", "--repairs", "M,O"], read).stdout).toContain("captured 9800/4900");
  });
  it("--json prints one parseable object", () => {
    const o = runCli(["replay", "f.json", "--repairs", "M,O,D", "--json"], read);
    const j = JSON.parse(o.stdout);
    expect(j.result).toBe("PASS");
    expect(j.capturedMinor).toBe(4900);
  });
  it("exits 2 on usage and input errors", () => {
    expect(runCli([], read).code).toBe(2);
    expect(runCli(["bogus"], read).code).toBe(2);
    expect(runCli(["replay"], read).code).toBe(2);
    expect(runCli(["replay", "f.json", "--repairs"], read).code).toBe(2);
    expect(runCli(["replay", "f.json", "--wat"], read).code).toBe(2);
    expect(runCli(["replay", "missing.json"], read).code).toBe(2);
    expect(runCli(["replay", "f.json", "--repairs", "Q"], read).code).toBe(2);
  });
});
