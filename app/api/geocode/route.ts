import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";

// POST /api/geocode  Body: { address: string }
export async function POST(request: Request) {
  let body: { address?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  const result = await geocodeAddress(body.address);
  if (!result) {
    return NextResponse.json(
      { error: "Address not found — try adding suburb and city" },
      { status: 404 }
    );
  }
  return NextResponse.json(result);
}
