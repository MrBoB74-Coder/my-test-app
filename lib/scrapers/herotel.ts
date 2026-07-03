// Interim headless scraper for Herotel Business coverage.
// Flow: open checker → fill address → pick Google autocomplete suggestion →
// click "Check Coverage" → read the result popup ("Good news!" = available).
// Uses text/placeholder locators so it survives CSS class changes.

import type { Offer } from "@/lib/providers";
import { launchBrowser } from "./browser";

export interface ScrapeResult {
  available: boolean;
  offers: Offer[];
  error?: string;
}

export async function scrapeHerotel(address: string): Promise<ScrapeResult> {
  const browser = await launchBrowser();
  if (!browser) return { available: false, offers: [], error: "playwright not installed" };

  try {
    const page = await browser.newPage();
    await page.goto("https://herotelbusiness.com/check-coverage/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Address input: placeholder "Enter an address or XY (latitude, longitude)".
    const input = page.getByPlaceholder(/enter an address/i).first();
    await input.click();
    await input.fill(address);
    await page.waitForTimeout(2500); // let Google autocomplete populate
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    // Click the "Check Coverage" action nearest the input (not the header link).
    await page.getByRole("button", { name: /check coverage/i }).last().click()
      .catch(async () => {
        await page.getByText(/check coverage/i).last().click();
      });

    // Result popup: "Good news! Connectivity available" or a negative message.
    await page.waitForTimeout(4000);
    const bodyText = (await page.locator("body").innerText()).toLowerCase();

    const positive = /good news|connectivity is available|connectivity available|coverage available/.test(bodyText);
    const negative = /no coverage|not available|sorry|no connectivity/.test(bodyText);

    if (positive && !negative) {
      return { available: true, offers: [{ network: "Herotel", speed: "Available" }] };
    }
    if (negative) {
      return { available: false, offers: [] };
    }
    return { available: false, offers: [], error: "Could not read Herotel result" };
  } catch (err) {
    return {
      available: false,
      offers: [],
      error: err instanceof Error ? err.message : "scrape failed",
    };
  } finally {
    await browser.close();
  }
}
