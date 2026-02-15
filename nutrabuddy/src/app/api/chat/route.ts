import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string = body?.message ?? "";
    const context = body?.context ?? {};

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json(
        { reply: "DEBUG: Missing GEMINI_API_KEY" },
        { status: 200 }
      );
    }

    // Use a model that works for your API project.
    // If your current one is working already, keep it.
    const model = "gemini-2.0-flash";

    const prompt = `
You are NutraBuddy Coach. Be practical, friendly, and concise.
No diagnosis, no medical claims. If symptoms are severe or persistent, suggest seeing a professional.

Formatting rules:
- DO NOT use markdown (no **, no ##).
- Use short lines, not one giant paragraph.
- Output EXACTLY in this structure:

TITLE: <one short title>
SUMMARY: <1 sentence>

SLEEP: <1 short tip>
HYDRATION: <1 short tip>
ACTIVITY: <1 short tip>
MOOD: <1 short tip>
DIET: <1 short tip>

NEXT STEP: <one clear action for the next 2 hours>

User logs:
Sleep hours: ${context?.sleepHours ?? "N/A"}
Water cups: ${context?.waterCups ?? "N/A"}
Activity minutes: ${context?.activityMins ?? "N/A"}
Mood (1-5): ${context?.mood ?? "N/A"}
Diet score (0-10): ${context?.dietScore ?? "N/A"}

User question: ${message}
`.trim();

    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 220,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { reply: `DEBUG ERROR: ${JSON.stringify(data)}` },
        { status: 200 }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I couldn't generate a response right now.";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { reply: `DEBUG ERROR: ${err?.message ?? "Unknown error"}` },
      { status: 200 }
    );
  }
}