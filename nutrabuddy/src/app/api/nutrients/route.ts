import { NextResponse } from "next/server";

export type NutrientsResponse = {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitaminC: number;
  iron: number;
  calcium: number;
  sodium: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const foodName: string = (body?.foodName ?? body?.query ?? "").trim();
    if (!foodName) {
      return NextResponse.json(
        { error: "Missing foodName or query" },
        { status: 400 }
      );
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const prompt = `For the food "${foodName}", respond with ONLY a valid JSON object (no markdown, no explanation) with these exact keys and numbers for a typical serving: foodName (string), calories (number), protein (number, g), carbs (number, g), fat (number, g), fiber (number, g), vitaminC (number, mg), iron (number, mg), calcium (number, mg), sodium (number, mg). Example: {"foodName":"Apple","calories":95,"protein":0.5,"carbs":25,"fat":0.3,"fiber":4,"vitaminC":8.4,"iron":0.2,"calcium":11,"sodium":2}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Gemini error: ${res.status} ${err}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json(
        { error: "No response from Gemini" },
        { status: 502 }
      );
    }

    const raw = JSON.parse(text.trim());
    const out: NutrientsResponse = {
      foodName: String(raw.foodName ?? foodName),
      calories: Number(raw.calories) || 0,
      protein: Number(raw.protein) || 0,
      carbs: Number(raw.carbs) || 0,
      fat: Number(raw.fat) || 0,
      fiber: Number(raw.fiber) || 0,
      vitaminC: Number(raw.vitaminC) || 0,
      iron: Number(raw.iron) || 0,
      calcium: Number(raw.calcium) || 0,
      sodium: Number(raw.sodium) || 0,
    };
    return NextResponse.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch nutrients";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
