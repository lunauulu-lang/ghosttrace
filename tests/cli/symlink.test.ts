import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readTextFile } from "../../cli/node-io";

// A link inside the working directory that points to a folder outside it must not be followed.
const linkDir = ".tmp-symlink-test";
let outsideDir = "";
let linked = false;

beforeAll(() => {
  outsideDir = mkdtempSync(join(tmpdir(), "ghosttrace-symlink-target-"));
  writeFileSync(join(outsideDir, "secret.json"), "{}");
  mkdirSync(linkDir, { recursive: true });
  try {
    // "junction" works on Windows without admin rights; other platforms ignore the argument.
    symlinkSync(outsideDir, join(linkDir, "escape"), "junction");
    linked = true;
  } catch {
    linked = false;
  }
});
afterAll(() => {
  rmSync(linkDir, { recursive: true, force: true });
  rmSync(outsideDir, { recursive: true, force: true });
});

describe("readTextFile symlink confinement", () => {
  it("rejects a file reached through a link that leaves the working directory", (ctx) => {
    if (!linked) ctx.skip();
    const r = readTextFile(`${linkDir}/escape/secret.json`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("outside the repository");
  });
});
