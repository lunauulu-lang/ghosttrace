import { expect, test } from "@playwright/test";

// F18: G000 FAIL -> G110 over-capture -> G111 PASS -> export -> reimport -> PASS.
test("G000 -> G110 -> G111 -> export -> reimport", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:4173") && !r.url().startsWith("blob:") && !r.url().startsWith("data:")) {
      requests.push(r.url());
    }
  });

  await page.goto("/");
  const verdict = page.getByRole("status");
  await expect(verdict).toContainText("FAIL");
  await expect(page.getByText("schema_drift").first()).toBeVisible();

  await page.getByRole("button", { name: "G110 Over-capture" }).click();
  await expect(page.getByText("Captured: $98.00")).toBeVisible();
  await expect(page.getByText(/Simulated invalid state/)).toBeVisible();
  await expect(verdict).toContainText("FAIL");

  await page.getByRole("button", { name: "G111 Repaired" }).click();
  await expect(verdict).toContainText("PASS");
  await expect(page.getByText("Captured: $49.00")).toBeVisible();
  const fingerprint = (await page.locator(".fingerprint code").textContent()) ?? "";
  expect(fingerprint.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Preview export" }).click();
  await expect(page.getByLabel("Export JSON preview")).toContainText("ghosttrace-export");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download export JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ghosttrace-export.json");
  const filePath = await download.path();

  // Break the state first so the import visibly restores it.
  await page.getByRole("button", { name: "G000 Broken" }).click();
  await expect(verdict).toContainText("FAIL");

  await page.getByLabel("Import export file").setInputFiles(filePath);
  await expect(page.getByTestId("import-status")).toContainText("Imported");
  await expect(verdict).toContainText("PASS");
  await expect(page.getByLabel("Deduplicate applied deliveries")).toBeChecked();
  await expect(page.locator(".fingerprint code")).toHaveText(fingerprint);
  await expect(page.getByRole("alert")).toHaveCount(0);

  expect(requests).toEqual([]);
});

test("a bad import file is rejected with every error and changes nothing", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("file input missing");
    const dt = new DataTransfer();
    dt.items.add(new File(['{"format":"nope","formatVersion":2}'], "bad.json", { type: "application/json" }));
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("format");
  await expect(alert).toContainText("preset.config");
  await expect(alert).toContainText("bundle");
  await expect(page.getByRole("status")).toContainText("FAIL");
});
