import { NextResponse } from "next/server";

/**
 * Proxies to the NutriBuddy Express backend (Supabase + USDA/Gemini).
 * Set BACKEND_URL in .env.local (e.g. http://localhost:3002) when using Supabase backend.
 * Backend returns nutrients and saves the food to Supabase food_logs.
 */
export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
  if (!backendUrl) {
    return NextResponse.json({});
  }

  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query) {
      return NextResponse.json(
        { error: "Body must include { query: \"food name\" }" },
        { status: 400 }
      );
    }

    const res = await fetch(`${backendUrl}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || `Backend returned ${res.status}` },
        { status: res.status >= 400 ? res.status : 502 }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to reach backend";
    return NextResponse.json(
      { error: msg + ". Is the NutriBuddy backend running?" },
      { status: 502 }
    );
  }
}
