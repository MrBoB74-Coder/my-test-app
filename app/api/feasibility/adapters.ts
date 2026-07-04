// Provider adapters for automated feasibility checks.
// Each adapter receives an address (and lat/lng from geocoding) and returns a
// normalized result. Providers without an adapter fall through to a manual
// response in route.ts.

import type { FeasibilityStatus, Offer } from "@/lib/providers";
import { checkTelcotechCoverage } from "@/lib/telcotech";

export interface AdapterInput {
  address: string;
  lat?: number;
  lng?: number;
}

export interface AdapterResult {
  status: FeasibilityStatus;
  detail?: string;
  /** Aggregator providers return the list of available networks here. */
  offers?: Offer[];
}

type Adapter = (input: AdapterInput) => Promise<AdapterResult>;

// telcotech powers both Liquid and Herotel coverage checkers (different
// subdomains, same GetNetworkTypes endpoint). One shared key works across them.
const TELCOTECH_KEY = process.env.TELCOTECH_API_KEY ?? process.env.LIQUID_API_KEY ?? "";

// --- Liquid Intelligent Technologies (telcotech) ---------------------------
async function liquid({ lat, lng }: AdapterInput): Promise<AdapterResult> {
  if (lat === undefined || lng === undefined) {
    return { status: "unknown", detail: "No coordinates to check" };
  }
  const res = await checkTelcotechCoverage("liquidcoverage-api.telcotech.co", lat, lng, TELCOTECH_KEY);
  if (res.error) return { status: "unknown", detail: `Liquid: ${res.error}` };
  return {
    status: res.available ? "feasible" : "not-feasible",
    detail: res.available ? "" : "No Liquid coverage at this location",
    offers: res.offers,
  };
}

// --- Axxess (official Reseller API) ----------------------------------------
// Uses the Axxess Business Partner API to check fibre availability. Requires
// AXXESS_* credentials in the environment (see .env.example). Falls back to a
// manual note if not configured. (Superseded the earlier Playwright scraper.)
async function axxess({ address, lat, lng }: AdapterInput): Promise<AdapterResult> {
  if (!process.env.AXXESS_CP_USER) {
    return {
      status: "pending",
      detail: "Axxess API not configured — check manually.",
    };
  }
  if (lat === undefined || lng === undefined) {
    return { status: "unknown", detail: "No coordinates to check" };
  }
  const { checkFibreFeasibility } = await import("@/lib/axxess/feasibility");
  const res = await checkFibreFeasibility(lat, lng, address);
  if (res.error) {
    return { status: "unknown", detail: `Axxess API: ${res.error}` };
  }
  return {
    status: res.available ? "feasible" : "not-feasible",
    detail: res.available ? "" : "No Axxess fibre at this address",
    offers: res.offers,
  };
}

// --- Herotel (telcotech) ---------------------------------------------------
// Herotel's checker is the same telcotech platform as Liquid, at
// herotel-api.telcotech.co. Coordinate-based; no scraping needed.
async function herotel({ lat, lng }: AdapterInput): Promise<AdapterResult> {
  if (lat === undefined || lng === undefined) {
    return { status: "unknown", detail: "No coordinates to check" };
  }
  const res = await checkTelcotechCoverage("herotel-api.telcotech.co", lat, lng, TELCOTECH_KEY);
  if (res.error) return { status: "unknown", detail: `Herotel: ${res.error}` };
  return {
    status: res.available ? "feasible" : "not-feasible",
    detail: res.available ? "" : "No Herotel coverage at this location",
    offers: res.offers,
  };
}

// --- MTN (interim headless scraper) ----------------------------------------
// Runs only when ENABLE_HEADLESS_SCRAPERS=true and playwright is installed.
// Drives fibre.mtn.co.za and reads the covered/no-packages result. Bridge until
// official API access; portable into the future Docker scraper service.
async function mtn({ address }: AdapterInput): Promise<AdapterResult> {
  if (process.env.ENABLE_HEADLESS_SCRAPERS !== "true") {
    return { status: "pending", detail: "Automated MTN check disabled — check manually." };
  }
  const { scrapeMtn } = await import("@/lib/scrapers/mtn");
  const res = await scrapeMtn(address);
  if (res.error) return { status: "unknown", detail: `MTN scrape: ${res.error}` };
  return {
    status: res.available ? "feasible" : "not-feasible",
    detail: res.available ? "" : "No MTN fibre at this address",
    offers: res.offers,
  };
}

export const ADAPTERS: Record<string, Adapter> = {
  liquid,
  axxess,
  herotel,
  mtn,
};
