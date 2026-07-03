// Shared headless-browser helper for interim provider scrapers.
//
// These run only when ENABLE_HEADLESS_SCRAPERS=true and the optional
// `playwright` package is installed. Playwright needs a real browser
// environment — works locally (npm run dev); on Vercel it needs a
// serverless-Chromium package or a separate browser service.
//
// Each scraper opens a page, drives the provider's coverage checker, reads the
// result, and returns a normalized shape. Slower and more fragile than a real
// API — this is a bridge until official API access is granted.

export const HEADLESS_ENABLED = process.env.ENABLE_HEADLESS_SCRAPERS === "true";

// Returns a launched Chromium browser, or null if playwright isn't available.
export async function launchBrowser() {
  try {
    // @ts-ignore - playwright is an optional dependency
    const { chromium } = await import("playwright");
    return await chromium.launch({ headless: true });
  } catch {
    return null;
  }
}
