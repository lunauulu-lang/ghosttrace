import { expect, test, type Page } from "@playwright/test";

async function tabTo(page: Page, name: string): Promise<void> {
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press("Tab");
    const text = await page.evaluate(() => (document.activeElement?.textContent ?? "").trim());
    if (text === name) return;
  }
  throw new Error(`Could not reach "${name}" with Tab`);
}

// F16: the key flow works without a mouse.
test("keyboard only: reach G111 PASS and the export preview", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("FAIL");

  await tabTo(page, "G111 Repaired");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("PASS");

  await tabTo(page, "Preview export");
  await page.keyboard.press("Space");
  await expect(page.getByLabel("Export JSON preview")).toBeVisible();
  await expect(page.getByLabel("Repair spec preview")).toContainText("PASS");

  await tabTo(page, "Download export JSON");
  const focused = await page.evaluate(() => (document.activeElement?.textContent ?? "").trim());
  expect(focused).toBe("Download export JSON");
});
