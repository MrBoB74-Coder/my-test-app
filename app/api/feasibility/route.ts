import { NextResponse } from "next/server";
import { PROVIDERS } from "@/lib/providers";
import { ADAPTERS } from "./adapters";

// POST /api/feasibility
// Body: { address: string, providerId: string, lat?: number, lng?: number }
// Runs the provider's adapter if one exists; otherwise reports that a
// manual check is required.
export async function POST(request: Request) {
  let body: { address?: string; providerId?: string; lat?: number; lng?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { address, providerId, lat, lng } = body;
  if (!address || !providerId) {
    return NextResponse.json(
      { error: "address and providerId are required" },
      { status: 400 }
    );
  }

  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const adapter = ADAPTERS[providerId];
  if (!adapter) {
    return NextResponse.json({
      providerId,
      status: "pending",
      manual: true,
      detail: "No automated check available — check the provider site manually.",
    });
  }

  try {
    const result = await adapter({ address, lat, lng });
    return NextResponse.json({ providerId, manual: false, ...result });
  } catch (err) {
    return NextResponse.json({
      providerId,
      status: "unknown",
      manual: false,
      detail: `Automated check failed: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}
