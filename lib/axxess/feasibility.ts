// Fibre feasibility via the Axxess Reseller API.
//
// Flow:
//   1. checkFibreAvailability(lat, lng, address) → array of available fibre
//      network-provider GUIDs (+ pre-order flag).
//   2. getNetworkProviders → GUID→name map (Vuma, Openserve, Frogfoot, …),
//      cached in memory since it rarely changes.
//   3. Return one offer per available provider.

import type { Offer } from "@/lib/providers";
import { callWithSession } from "./client";

interface AvailableProvider {
  guidNetworkProviderId: string;
  intPreOrder?: number | string;
}

let providerNameCache: Map<string, string> | null = null;

async function getProviderNames(): Promise<Map<string, string>> {
  if (providerNameCache) return providerNameCache;
  const data = await callWithSession("getNetworkProviders");
  const arr = (data.arrNetworkProviders as Array<{ guidNetworkProviderId: string; strName: string }>) ?? [];
  const map = new Map<string, string>();
  for (const p of arr) map.set(p.guidNetworkProviderId, p.strName);
  providerNameCache = map;
  return map;
}

export interface FibreFeasibility {
  available: boolean;
  offers: Offer[];
  error?: string;
}

export async function checkFibreFeasibility(
  lat: number,
  lng: number,
  address: string
): Promise<FibreFeasibility> {
  try {
    const data = await callWithSession("checkFibreAvailability", {
      strLatitude: String(lat),
      strLongitude: String(lng),
      strAddress: address,
    });

    if (data.intCode !== 200) {
      return {
        available: false,
        offers: [],
        error: `checkFibreAvailability: ${data.intCode} ${data.strMessage ?? ""}`.trim(),
      };
    }

    const providers = (data.arrAvailableProvidersGuids as AvailableProvider[]) ?? [];
    if (providers.length === 0) {
      return { available: false, offers: [] };
    }

    const names = await getProviderNames();
    const offers: Offer[] = providers.map((p) => {
      const name = names.get(p.guidNetworkProviderId) ?? "Unknown provider";
      const isPreOrder = Number(p.intPreOrder) === 1;
      return { network: name, speed: isPreOrder ? "Pre-order" : "Available" };
    });

    return { available: true, offers };
  } catch (err) {
    return {
      available: false,
      offers: [],
      error: err instanceof Error ? err.message : "Axxess API error",
    };
  }
}
