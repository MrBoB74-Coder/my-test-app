// Headless-browser scraper for Axxess (www.axxess.co.za/find-internet-services).
//
// Axxess's coverage check is a multi-step JS flow whose network calls resist
// direct replication, so we drive the page with Playwright instead. This runs
// ONLY when ENABLE_AXXESS_SCRAPER=true AND the optional `playwright` package is
// installed — otherwise the adapter falls back to a manual check. Playwright
// needs a real browser environment (works locally; on Vercel it needs a
// serverless-Chromium package or a separate browser service).
//
// Scope (first cut): scrapes the top-level available services (Home Fibre plus
// the LTE/5G networks). Drilling into "Home Fibre" for per-FNO speeds
// (Vuma / Openserve / Frogfoot) is a documented next step — see NOTE below.

import type { Offer } from "@/lib/providers";

export interface AxxessResult {
  available: boolean;
  offers: Offer[];
  error?: string;
}

export async function scrapeAxxess(address: string): Promise<AxxessResult> {
  let chromium;
  try {
    // @ts-ignore - playwright is an optional dependency, may not be installed
    ({ chromium } = await import("playwright"));
  } catch {
    return { available: false, offers: [], error: "playwright not installed" };
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.axxess.co.za/find-internet-services", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Type the address and pick the first Google autocomplete suggestion.
    const input = page.locator('input[placeholder*="address" i]').first();
    await input.click();
    await input.fill(address);
    await page.waitForTimeout(2500); // let autocomplete populate
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Results render as .addresssearch-service rows once the check completes.
    await page.waitForSelector(".addresssearch-service", { timeout: 25000 });

    const offers: Offer[] = await page.$$eval(".addresssearch-service", (rows) =>
      rows
        .map((row) => {
          const name = row.querySelector(".name")?.textContent?.trim() || "";
          const kind = row.classList.contains("fibre")
            ? "Fibre"
            : row.classList.contains("mobile")
              ? "LTE / 5G"
              : "";
          return { network: name, speed: kind };
        })
        .filter((o) => o.network),
    );

    // NOTE: to get per-FNO fibre detail (Vuma/Openserve/Frogfoot + speeds),
    // click the "Home Fibre" row's GET IT button, wait for the fibre product
    // page, and scrape its network + speed dropdowns. Add here once mapped.

    return { available: offers.length > 0, offers };
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
