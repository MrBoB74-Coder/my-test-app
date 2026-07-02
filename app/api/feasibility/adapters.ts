// Provider adapters for automated feasibility checks.
// Each adapter receives an address (and lat/lng from geocoding) and returns a
// normalized result. Providers without an adapter fall through to a manual
// response in route.ts.

import type { FeasibilityStatus } from "@/lib/providers";

export interface AdapterInput {
  address: string;
  lat?: number;
  lng?: number;
}

export interface AdapterResult {
  status: FeasibilityStatus;
  detail?: string;
}

type Adapter = (input: AdapterInput) => Promise<AdapterResult>;

const UUID = () => crypto.randomUUID();

// --- Liquid Intelligent Technologies ---------------------------------------
// Endpoint discovered from coverage.za.liquid.tech: it queries
// liquidcoverage-api.telcotech.co/Data/GetNetworkTypes with lat/lng and two
// headers — a static ApiKey (shipped in the site's JS, set via LIQUID_API_KEY)
// and a per-device GUID (any random UUID works). A non-empty networkTypes
// array means coverage is available at that point.
async function liquid({ lat, lng }: AdapterInput): Promise<AdapterResult> {
  if (lat === undefined || lng === undefined) {
    return { status: "unknown", detail: "No coordinates to check" };
  }
  const apiKey = process.env.LIQUID_API_KEY;
  if (!apiKey) {
    return { status: "unknown", detail: "LIQUID_API_KEY not configured" };
  }

  const url = `https://liquidcoverage-api.telcotech.co/Data/GetNetworkTypes?Latitude=${lat}&Longitude=${lng}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ApiKey: apiKey,
      DeviceIdentifier: UUID(),
    },
  });

  if (res.status === 401) {
    return { status: "unknown", detail: "Liquid API rejected the key (401)" };
  }
  if (!res.ok) {
    return { status: "unknown", detail: `Liquid API returned ${res.status}` };
  }

  const data = await res.json();
  const nets: Array<{ name?: string }> = data?.networkTypes ?? [];
  if (nets.length > 0) {
    const names = nets.map((n) => n.name).filter(Boolean).join(", ");
    return { status: "feasible", detail: names || "Coverage available" };
  }
  return { status: "not-feasible", detail: "No Liquid coverage at this location" };
}

export const ADAPTERS: Record<string, Adapter> = {
  liquid,
};
