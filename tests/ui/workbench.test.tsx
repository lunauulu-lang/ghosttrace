// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixtureJson from "../../fixtures/haunted-checkout.json";
import App from "../../src/App";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function verdict(): string {
  return screen.getByRole("status").textContent ?? "";
}

function press(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("GhostTrace workbench (synthetic data only)", () => {
  it("1. initial render is G000: FAIL with schema_drift and order_violation", () => {
    render(<App />);
    expect(verdict()).toContain("FAIL");
    expect(screen.getAllByText(/schema_drift/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/order_violation/).length).toBeGreaterThan(0);
  });

  it("2. G110 preset: $98.00 captured, simulated invalid state label, capture_over_total, FAIL", () => {
    render(<App />);
    press("G110 Over-capture");
    expect(screen.getByText(/Captured: \$98\.00/)).toBeTruthy();
    expect(screen.getByText(/Simulated invalid state/)).toBeTruthy();
    expect(screen.getAllByText(/capture_over_total/).length).toBeGreaterThan(0);
    expect(verdict()).toContain("FAIL");
  });

  it("3. G111 preset: PASS, $49.00 of $49.00, fulfilled yes", () => {
    render(<App />);
    press("G111 Repaired");
    expect(verdict()).toContain("PASS");
    expect(screen.getByText("Total: $49.00")).toBeTruthy();
    expect(screen.getByText("Captured: $49.00")).toBeTruthy();
    expect(screen.getByText("Fulfilled: yes")).toBeTruthy();
    expect(screen.queryByText(/Simulated invalid state/)).toBeNull();
  });

  it("4. with G111 the row marked First divergence is d1", () => {
    render(<App />);
    press("G111 Repaired");
    const marked = screen.getAllByText("First divergence");
    expect(marked).toHaveLength(1);
    const row = marked[0]!.closest("button");
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText("d1")).toBeTruthy();
  });

  it("5. toggling the three checkboxes one by one reaches the G111 preset result", () => {
    const manual = render(<App />);
    fireEvent.click(screen.getByLabelText("Schema mapping (v2 amount)"));
    fireEvent.click(screen.getByLabelText("Causal ordering"));
    fireEvent.click(screen.getByLabelText("Deduplicate applied deliveries"));
    const manualHtml = manual.container.innerHTML;
    expect(verdict()).toContain("PASS");
    cleanup();

    const preset = render(<App />);
    press("G111 Repaired");
    expect(preset.container.innerHTML).toBe(manualHtml);
  });

  it("6. every checkbox and button has an accessible name", () => {
    render(<App />);
    const names = [
      ...screen.getAllByRole("checkbox").map((e) => e.getAttribute("aria-label") ?? e.closest("label")?.textContent ?? ""),
      ...screen.getAllByRole("button").map((e) => e.textContent ?? ""),
    ];
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    for (const n of names) expect(n.trim().length).toBeGreaterThan(0);
    expect(screen.getByRole("checkbox", { name: "Schema mapping (v2 amount)" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Causal ordering" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Deduplicate applied deliveries" })).toBeTruthy();
    for (const n of ["G000 Broken", "G110 Over-capture", "G111 Repaired"]) {
      expect(screen.getByRole("button", { name: n })).toBeTruthy();
    }
  });

  it("7. fetch is never called", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<App />);
    press("G110 Over-capture");
    press("G111 Repaired");
    fireEvent.click(screen.getByLabelText("Causal ordering"));
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("8. changing toggles does not mutate the imported fixture", () => {
    const before = JSON.stringify(fixtureJson);
    render(<App />);
    fireEvent.click(screen.getByLabelText("Schema mapping (v2 amount)"));
    press("G111 Repaired");
    fireEvent.click(screen.getAllByRole("button").find((b) => b.textContent?.startsWith("d1")) as HTMLElement);
    press("G000 Broken");
    expect(JSON.stringify(fixtureJson)).toBe(before);
  });
});
