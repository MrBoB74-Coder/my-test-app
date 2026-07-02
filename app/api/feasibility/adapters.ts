// Provider adapters for automated feasibility checks.
// Each adapter receives an address (and later lat/lng from Google geocoding)
// and returns a normalized result. Providers without an adapter fall through
// to a "manual" response.

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

// Add adapters here as provider APIs are reverse-engineered / obtained, e.g.:
//
// async function liquid({ lat, lng }: AdapterInput): Promise<AdapterResult> {
//   const res = await fetch(`https://coverage.za.liquid.tech/api/...?lat=${lat}&lng=${lng}`);
//   ...
// }

export const ADAPTERS: Record<string, Adapter> = {
  // liquid,
  // mtn,
  // axxess,
};
