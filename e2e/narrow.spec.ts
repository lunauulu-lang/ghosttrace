import { expect, test, type Page } from "@playwright/test";

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

// F16: responsive check at 375 px.
test.use({ viewport: { width: 375, height: 667 } });

test("375 px: no horizontal scroll and the main controls are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "GhostTrace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "G111 Repaired" })).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  await page.getByRole("button", { name: "G111 Repaired" }).click();
  await expect(page.getByRole("status")).toContainText("PASS");
  await page.getByRole("button", { name: "Preview export" }).click();
  await expect(page.getByRole("button", { name: "Download export JSON" })).toBeVisible();
  await expect(page.getByLabel("Import export file")).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});
