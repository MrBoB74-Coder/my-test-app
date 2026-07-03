// Shared client for the telcotech coverage platform, which powers several SA
// providers' coverage checkers behind different subdomains:
//   Liquid  → liquidcoverage-api.telcotech.co
//   Herotel → herotel-api.telcotech.co
// Same endpoint shape for all: GET /Data/GetNetworkTypes?Latitude=&Longitude=
// with ApiKey + DeviceIdentifier headers. A non-empty networkTypes array means
// coverage is available; each entry has a human name we surface as an offer.

import type { Offer } from "@/lib/providers";

export interface TelcotechResult {
  available: boolean;
  offers: Offer[];
  error?: string;
}

interface NetworkType {
  id?: number;
  name?: string;
  code?: string;
  isLte?: boolean;
}

const UUID = () => crypto.randomUUID();

export async function checkTelcotechCoverage(
  apiBase: string,
  lat: number,
  lng: number,
  apiKey: string
): Promise<TelcotechResult> {
  if (lat === undefined || lng === undefined) {
    return { available: false, offers: [], error: "No coordinates to check" };
  }
  if (!apiKey) {
    return { available: false, offers: [], error: "telcotech API key not configured" };
  }

  const url = `https://${apiBase}/Data/GetNetworkTypes?Latitude=${lat}&Longitude=${lng}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json", ApiKey: apiKey, DeviceIdentifier: UUID() },
    });
  } catch (err) {
    return {
      available: false,
      offers: [],
      error: err instanceof Error ? err.message : "network error",
    };
  }

  if (res.status === 401) {
    return { available: false, offers: [], error: "telcotech API rejected the key (401)" };
  }
  if (!res.ok) {
    return { available: false, offers: [], error: `telcotech API returned ${res.status}` };
  }

  const data = await res.json();
  const nets: NetworkType[] = data?.networkTypes ?? [];
  if (nets.length === 0) {
    return { available: false, offers: [] };
  }
  const offers: Offer[] = nets
    .filter((n) => n.name)
    .map((n) => ({ network: n.name as string, speed: n.isLte ? "LTE / Wireless" : "Fibre" }));
  return { available: true, offers };
}
