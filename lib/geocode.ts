// Address → coordinates. Uses Google Geocoding when GOOGLE_MAPS_API_KEY is
// set, otherwise falls back to OpenStreetMap Nominatim (free, ~1 req/sec —
// fine for development, use Google in production).

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  source: "google" | "nominatim";
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  return key ? geocodeGoogle(address, key) : geocodeNominatim(address);
}

async function geocodeGoogle(address: string, key: string): Promise<GeocodeResult | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&region=za&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) return null;
  return {
    lat: hit.geometry.location.lat,
    lng: hit.geometry.location.lng,
    formattedAddress: hit.formatted_address,
    source: "google",
  };
}

async function geocodeNominatim(address: string): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=za&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "bitspace-feasibility-study/0.1 (byron@bitspace.co.za)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.[0];
  if (!hit) return null;
  return {
    lat: parseFloat(hit.lat),
    lng: parseFloat(hit.lon),
    formattedAddress: hit.display_name,
    source: "nominatim",
  };
}
