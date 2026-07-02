// Provider registry for the feasibility study.
// checkType "api" providers are auto-checked via /api/feasibility;
// "manual" providers require checking the linked coverage site by hand.
// To promote a provider to auto-check: set checkType to "api" and add an
// adapter in app/api/feasibility/adapters.ts.

export type CheckType = "api" | "manual";

export type FeasibilityStatus =
  | "pending" // not yet checked
  | "checking" // auto-check in flight
  | "feasible"
  | "not-feasible"
  | "unknown"; // checked but inconclusive

export interface Provider {
  id: string;
  name: string;
  /** Coverage-check page opened in a new tab for manual checks */
  coverageUrl: string;
  checkType: CheckType;
  /** Notes about the provider's checker / future API potential */
  notes?: string;
}

export interface ProviderResult {
  status: FeasibilityStatus;
  /** Package / product found to be available, captured manually */
  packageInfo: string;
  /** Monthly price, captured manually */
  price: string;
  notes: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: "metrofibre",
    name: "Metro Fibre (Business)",
    coverageUrl: "https://ftthorder.metrofibre.co.za/fttbservicemap",
    checkType: "manual",
    notes: "FTTB service map — search the address on the map.",
  },
  {
    id: "herotel",
    name: "Herotel Business",
    coverageUrl: "https://herotelbusiness.com/check-coverage/",
    checkType: "manual",
    notes: "Address-based coverage checker.",
  },
  {
    id: "vox",
    name: "Vox Business Fibre",
    coverageUrl: "https://www.vox.co.za/fibre-to-the-business/",
    checkType: "manual",
    notes: "FTTB packages page with coverage lookup.",
  },
  {
    id: "liquid",
    name: "Liquid Intelligent Technologies",
    coverageUrl: "https://coverage.za.liquid.tech/coverage",
    checkType: "manual",
    notes: "Dedicated coverage map — API candidate for auto-check.",
  },
  {
    id: "mtn",
    name: "MTN Air Fibre",
    coverageUrl: "https://fibre.mtn.co.za/home",
    checkType: "manual",
    notes: "Fixed wireless / air fibre availability — API candidate.",
  },
  {
    id: "bitco",
    name: "BitCo",
    coverageUrl: "https://bitco-customer.agilitygis.com/#/",
    checkType: "manual",
    notes: "AgilityGIS-hosted coverage map.",
  },
  {
    id: "axxess",
    name: "Axxess",
    coverageUrl: "https://www.axxess.co.za/find-internet-services",
    checkType: "manual",
    notes: "Multi-network availability search — API candidate.",
  },
];

export const STATUS_LABELS: Record<FeasibilityStatus, string> = {
  pending: "Pending",
  checking: "Checking…",
  feasible: "Feasible",
  "not-feasible": "Not feasible",
  unknown: "Unknown",
};

export function emptyResult(): ProviderResult {
  return { status: "pending", packageInfo: "", price: "", notes: "" };
}
