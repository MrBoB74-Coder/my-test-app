// Interim headless scraper for MTN fibre (fibre.mtn.co.za).
// Flow: open home → type address → pick MTN's autocomplete suggestion →
// "Show me my deals" → read the result. Covered → "You're covered!" + plan
// cards on /packages; not covered → a "No packages" modal.
//
// Runs locally (npm run dev) or in the future Docker scraper service. Text-based
// locators so it survives CSS changes. See lib/scrapers/browser.ts.

import type { Offer } from "@/lib/providers";
import { launchBrowser } from "./browser";

export interface ScrapeResult {
  available: boolean;
  offers: Offer[];
  error?: string;
}

export async function scrapeMtn(address: string): Promise<ScrapeResult> {
  const browser = await launchBrowser();
  if (!browser) return { available: false, offers: [], error: "playwright not installed" };

  try {
    const page = await browser.newPage();
    await page.goto("https://fibre.mtn.co.za/home", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const input = page.getByPlaceholder(/enter your location/i).first();
    await input.click();
    await input.fill(address);
    await page.waitForTimeout(2500); // let MTN's autocomplete populate
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    await page
      .getByRole("button", { name: /show me my deals/i })
      .first()
      .click()
      .catch(async () => {
        await page.getByText(/show me my deals/i).first().click();
      });

    // Wait until a definitive result is on screen.
    await page
      .waitForFunction(
        () => {
          const t = document.body.innerText.toLowerCase();
          return (
            t.includes("you're covered") ||
            t.includes("you are covered") ||
            t.includes("select your plan") ||
            t.includes("no packages") ||
            t.includes("no fibre packages") ||
            t.includes("sorry there are no")
          );
        },
        { timeout: 25000 }
      )
      .catch(() => {});

    const info = await page.evaluate(() => {
      const low = document.body.innerText.toLowerCase();
      const noPackages = /no packages|no fibre packages|sorry there are no/.test(low);
      const covered = /you're covered|you are covered|select your plan/.test(low);

      const cards = Array.from(document.querySelectorAll("div")).filter(
        (d) => /starting from/i.test(d.textContent || "") && d.querySelectorAll("div").length < 8
      );
      const seen = new Set<string>();
      const offers: { network: string; speed?: string }[] = [];
      for (const c of cards) {
        const h = c.querySelector("h1,h2,h3,h4,strong,b");
        const title = (h?.textContent || "").trim();
        const priceMatch = (c.textContent || "").match(/R\s?[\d ,]+/i);
        const price = priceMatch ? priceMatch[0].trim() : "";
        const key = title + price;
        if (title && !/starting from/i.test(title) && !seen.has(key)) {
          seen.add(key);
          offers.push({ network: title, speed: price ? `from ${price}` : undefined });
        }
      }
      return { noPackages, covered, offers };
    });

    if (info.noPackages) return { available: false, offers: [] };
    if (info.covered) {
      const offers: Offer[] =
        info.offers.length > 0 ? info.offers : [{ network: "MTN Fibre", speed: "Available" }];
      return { available: true, offers };
    }
    return { available: false, offers: [], error: "Could not read MTN result" };
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
