// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { buildExportFile, serializeExport } from "../../src/lib/exportBundle";
import { cfg, loadFixture } from "../engine/helpers";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function press(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}
function verdict(): string {
  return screen.getByRole("status").textContent ?? "";
}
function chooseFile(text: string, name = "in.json") {
  const input = screen.getByLabelText("Import export file") as HTMLInputElement;
  const file = new File([text], name, { type: "application/json" });
  fireEvent.change(input, { target: { files: [file] } });
}

describe("export panel", () => {
  it("downloads are hidden until the preview is open, then show the exact text", () => {
    render(<App />);
    expect(screen.queryByRole("button", { name: "Download export JSON" })).toBeNull();
    press("G111 Repaired");
    press("Preview export");
    expect(screen.getByRole("button", { name: "Download export JSON" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download Kiro repair spec" })).toBeTruthy();
    const expected = serializeExport(buildExportFile(loadFixture(), cfg(1, 1, 1)));
    expect(screen.getByLabelText("Export JSON preview").textContent).toBe(expected);
    expect(screen.getByLabelText("Repair spec preview").textContent).toContain("**PASS**");
  });

  it("preview follows config changes", () => {
    render(<App />);
    press("Preview export");
    expect(screen.getByLabelText("Repair spec preview").textContent).toContain("**FAIL**");
    press("G111 Repaired");
    expect(screen.getByLabelText("Repair spec preview").textContent).toContain("**PASS**");
  });

  it("download creates a Blob with the previewed text and no fetch", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const blobs: Blob[] = [];
    URL.createObjectURL = vi.fn((b: Blob | MediaSource) => {
      blobs.push(b as Blob);
      return "blob:test";
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<App />);
    press("G111 Repaired");
    press("Preview export");
    press("Download export JSON");
    expect(blobs).toHaveLength(1);
    const expected = serializeExport(buildExportFile(loadFixture(), cfg(1, 1, 1)));
    expect(await blobs[0]!.text()).toBe(expected);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("importing a valid G111 export restores PASS and all three repairs", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<App />);
    expect(verdict()).toContain("FAIL");
    chooseFile(serializeExport(buildExportFile(loadFixture(), cfg(1, 1, 1))));
    await waitFor(() => expect(screen.getByTestId("import-status").textContent).toMatch(/^Imported /));
    expect(verdict()).toContain("PASS");
    for (const n of ["Schema mapping (v2 amount)", "Causal ordering", "Deduplicate applied deliveries"]) {
      expect((screen.getByLabelText(n) as HTMLInputElement).checked).toBe(true);
    }
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("a bad file shows every error and leaves the workbench unchanged", async () => {
    render(<App />);
    press("G110 Over-capture");
    const f = JSON.parse(serializeExport(buildExportFile(loadFixture(), cfg(1, 1, 1))));
    f.format = "x";
    f.preset.config = {};
    chooseFile(JSON.stringify(f));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("format:");
    expect(alert.textContent).toContain("preset.config.normalizeV2Amount");
    expect(verdict()).toContain("FAIL");
    expect((screen.getByLabelText("Deduplicate applied deliveries") as HTMLInputElement).checked).toBe(false);
  });

  it("malformed JSON is rejected with an alert", async () => {
    render(<App />);
    chooseFile("{oops");
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("not valid JSON");
  });

  it("a file over 1 MiB is rejected from its size alone", async () => {
    render(<App />);
    chooseFile("x".repeat(1_048_577));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("exceeds");
  });
});
