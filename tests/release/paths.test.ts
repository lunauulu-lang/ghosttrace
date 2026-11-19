import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = `${dir}/${name}`;
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

describe("sub-path safety (GitHub Pages at /ghosttrace/)", () => {
  const srcFiles = walk("src").filter((f) => /\.(ts|tsx|css)$/.test(f));

  it("src makes no fetch or XHR call and has no root-absolute url()", () => {
    for (const f of srcFiles) {
      const text = readFileSync(f, "utf8");
      expect(text, f).not.toMatch(/\bfetch\s*\(/);
      expect(text, f).not.toMatch(/XMLHttpRequest/);
      expect(text, f).not.toMatch(/url\(\s*["']?\//);
    }
  });

  it("index.html only references the Vite entry as a root path", () => {
    const html = readFileSync("index.html", "utf8");
    const refs = [...html.matchAll(/(?:src|href)="(\/[^"]*)"/g)].map((m) => m[1]);
    expect(refs).toEqual(["/src/main.tsx"]);
  });

  it("the fixture is bundled by import, not loaded at run time", () => {
    expect(readFileSync("src/App.tsx", "utf8")).toContain('from "../fixtures/haunted-checkout.json"');
  });

  it("pages workflow is manual-only with minimal permissions and a /ghosttrace/ base", () => {
    const y = readFileSync(".github/workflows/pages.yml", "utf8");
    expect(y).toMatch(/on:\s*\n\s+workflow_dispatch:/);
    expect(y).not.toMatch(/\n\s+(push|pull_request|schedule):/);
    expect(y).toContain("--base=/ghosttrace/");
    expect(y).toContain("pages: write");
    expect(y).toContain("id-token: write");
  });

  it("the default build script has no base override", () => {
    expect(readFileSync("package.json", "utf8")).toContain('"build": "vite build"');
  });
});
