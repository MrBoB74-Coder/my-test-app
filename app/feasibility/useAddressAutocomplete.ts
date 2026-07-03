"use client";

// Attaches Google Places Autocomplete to an input. Uses the browser-safe,
// referrer-restricted key (NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY). If the key is
// absent, this is a no-op and the plain input + server geocoding still work.

import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any;
    __gmapsLoading?: Promise<void>;
  }
}

function loadGoogleMaps(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__gmapsLoading) return window.__gmapsLoading;
  window.__gmapsLoading = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return window.__gmapsLoading;
}

export interface SelectedPlace {
  address: string;
  lat: number;
  lng: number;
}

export function useAddressAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
  onSelect: (place: SelectedPlace) => void
) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
    if (!key || !inputRef.current) return;

    let autocomplete: any;
    let cancelled = false;

    loadGoogleMaps(key)
      .then(() => {
        if (cancelled || !inputRef.current) return;
        autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "za" },
          fields: ["formatted_address", "geometry"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const loc = place.geometry?.location;
          if (!loc) return;
          onSelectRef.current({
            address: place.formatted_address ?? inputRef.current!.value,
            lat: loc.lat(),
            lng: loc.lng(),
          });
        });
      })
      .catch(() => {
        /* key missing/invalid — silently fall back to manual entry */
      });

    return () => {
      cancelled = true;
      if (autocomplete && window.google) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [inputRef]);
}
