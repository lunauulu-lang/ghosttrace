import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { handleReplay } from "../../cli/core";
import { readTextFile } from "../../cli/node-io";
import { isInside } from "../../cli/paths";
import { runCli } from "../../cli/run";

const fixtureText = readFileSync("fixtures/haunted-checkout.json", "utf8");
let dir = "";
let outside = "";

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "ghosttrace-outside-"));
  outside = join(dir, "bundle.json");
  writeFileSync(outside, fixtureText);
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("isInside (pure)", () => {
  it("accepts the root and children, rejects siblings and prefix look-alikes", () => {
    expect(isInside("/repo", "/repo")).toBe(true);
    expect(isInside("/repo", "/repo/fixtures/a.json")).toBe(true);
    expect(isInside("/repo", "/repo-other/a.json")).toBe(false);
    expect(isInside("/repo", "/etc/passwd")).toBe(false);
    expect(isInside("/repo", "/")).toBe(false);
  });
  it("handles Windows separators and case", () => {
    expect(isInside("C:\\Work\\repo", "c:\\work\\REPO\\fixtures\\a.json")).toBe(true);
    expect(isInside("C:\\Work\\repo", "C:\\Work\\repo2\\a.json")).toBe(false);
    expect(isInside("C:\\Work\\repo", "D:\\Work\\repo\\a.json")).toBe(false);
  });
});

describe("readTextFile confinement", () => {
  it("reads a normal fixture path inside the repository", () => {
    const r = readTextFile("fixtures/haunted-checkout.json");
    expect(r.ok).toBe(true);
    expect(readTextFile("fixtures/../fixtures/haunted-checkout.json").ok).toBe(true);
  });
  it("rejects an absolute path outside the repository", () => {
    const r = readTextFile(outside);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("outside the repository");
  });
  it("rejects a relative .. traversal that leaves the repository", () => {
    const rel = relative(process.cwd(), outside);
    expect(rel.startsWith("..") || /^[A-Za-z]:|^\//.test(rel)).toBe(true);
    const r = readTextFile(rel);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("outside the repository");
  });
  it("returns a readable error for a missing file", () => {
    const r = readTextFile("fixtures/does-not-exist.json");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("Cannot read file");
  });
});

describe("CLI and handlers use the confined reader", () => {
  it("CLI exits 2 for an outside path and 0 for the fixture", () => {
    const bad = runCli(["replay", outside]);
    expect(bad.code).toBe(2);
    expect(bad.stderr).toContain("outside the repository");
    expect(bad.stdout).toBe("");
    const ok = runCli(["replay", "fixtures/haunted-checkout.json", "--repairs", "M,O,D"]);
    expect(ok.code).toBe(0);
    expect(ok.stdout).toContain("PASS");
  });
  it("tool handlers (shared by MCP) reject an outside path", () => {
    const r = handleReplay(outside, "M,O,D", readTextFile);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("outside the repository");
  });
});
