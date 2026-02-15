import { NextResponse } from "next/server";

type Context = {
  sleepHours?: number;
  waterLitres?: number;
  activityMins?: number;
  mood?: number;
  dietScore?: number;
};

function fallbackReply(_question: string, context: Context): string {
  const sleep = context?.sleepHours ?? 0;
  const water = context?.waterLitres ?? 0;
  const activity = context?.activityMins ?? 0;
  const mood = context?.mood ?? 3;
  const diet = context?.dietScore ?? 5;
  const sleepTip =
    sleep < 6
      ? "Aim for 7–8 hours tonight. Small step: go to bed 15 min earlier."
      : sleep >= 8
        ? "Your sleep looks solid. Keep the same schedule."
        : "You're in a good range. Consistency helps most.";
  const waterTip =
    water < 1
      ? "Have a glass of water soon. Set a reminder for another in an hour."
      : water >= 2.5
        ? "Hydration is on track. Keep it up."
        : "A bit more water today would help (e.g. 1–2 glasses).";
  const activityTip =
    activity < 20
      ? "A 10–15 min walk can boost energy and mood. Try it next."
      : activity >= 60
        ? "You're moving well today. A light stretch could feel good."
        : "You're doing fine. Add a short walk if you have time.";
  const moodTip =
    mood <= 2
      ? "Be kind to yourself. One small positive action can shift the day."
      : mood >= 4
        ? "Your mood looks steady. Protect that with a bit of rest or fun."
        : "A short walk or a call to someone you like often helps.";
  const dietTip =
    diet <= 3
      ? "Focus on one better choice at your next meal: e.g. add veggies or protein."
      : diet >= 7
        ? "Your choices are supporting you. Keep the variety."
        : "One piece of fruit or a handful of nuts can round out the day.";
  return `TITLE: Quick check-in
SUMMARY: Here are small steps based on your recent logs.

SLEEP: ${sleepTip}
HYDRATION: ${waterTip}
ACTIVITY: ${activityTip}
MOOD: ${moodTip}
DIET: ${dietTip}

NEXT STEP: Pick one tip above and do it in the next 2 hours.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string =
      (body?.message ?? body?.question ?? "") as string;
    const context: Context =
      body?.context ??
      (body?.sleepHours !== undefined
        ? {
            sleepHours: body.sleepHours,
            waterLitres: body.waterLitres,
            activityMins: body.activityMins,
            mood: body.mood,
            dietScore: body.dietScore,
          }
        : {});

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json(
        { reply: fallbackReply(message, context) },
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
Water (L): ${context?.waterLitres ?? "N/A"}
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

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { reply: fallbackReply(message, context) },
        { status: 200 }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      fallbackReply(message, context);

    return NextResponse.json({ reply }, { status: 200 });
  } catch {
    return NextResponse.json(
      { reply: fallbackReply("", { sleepHours: 7, waterLitres: 2, activityMins: 30, mood: 3, dietScore: 5 }) },
      { status: 200 }
    );
  }
}
