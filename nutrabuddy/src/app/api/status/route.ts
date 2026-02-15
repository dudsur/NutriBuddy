import { NextResponse } from "next/server";

export type StatusPayload = {
  totals?: { calories: number; protein: number; carbs: number; fat: number; fiber?: number; vitaminC: number; iron: number; calcium?: number; sodium?: number };
  targets?: { calories: number; protein: number; carbs: number; fat: number; fiber: number; vitaminC: number; iron: number; calcium: number; sodium: number };
  sleepHours?: number;
  waterLitres?: number;
  activityMins?: number;
  mood?: number;
};

export type StatusResponse = {
  ok: boolean;
  summary: string;
  whatsMissing: { label: string; amount: string; foods: string[] }[];
  tips: string[];
};

function buildWhatsMissing(payload: StatusPayload): StatusResponse["whatsMissing"] {
  const totals = payload.totals ?? {};
  const targets = payload.targets ?? {};
  const out: StatusResponse["whatsMissing"] = [];
  if ((targets.protein ?? 0) > 0 && (totals.protein ?? 0) < (targets.protein ?? 0)) {
    const need = Math.round((targets.protein ?? 0) - (totals.protein ?? 0));
    if (need >= 15) out.push({ label: "Protein", amount: `${need}g`, foods: ["chicken breast", "eggs", "Greek yogurt", "tofu", "lentils"] });
  }
  if ((targets.carbs ?? 0) > 0 && (totals.carbs ?? 0) < (targets.carbs ?? 0)) {
    const need = Math.round((targets.carbs ?? 0) - (totals.carbs ?? 0));
    if (need >= 50) out.push({ label: "Carbs", amount: `${need}g`, foods: ["oatmeal", "rice", "sweet potato", "whole-grain bread", "banana"] });
  }
  if ((targets.fat ?? 0) > 0 && (totals.fat ?? 0) < (targets.fat ?? 0)) {
    const need = Math.round((targets.fat ?? 0) - (totals.fat ?? 0));
    if (need >= 20) out.push({ label: "Healthy fats", amount: `${need}g`, foods: ["avocado", "nuts", "olive oil", "salmon"] });
  }
  if ((targets.fiber ?? 0) > 0 && (totals.fiber ?? 0) < (targets.fiber ?? 0)) {
    const need = Math.round((targets.fiber ?? 0) - (totals.fiber ?? 0));
    if (need >= 8) out.push({ label: "Fiber", amount: `${need}g`, foods: ["beans", "oats", "berries", "broccoli", "whole grains"] });
  }
  if ((targets.vitaminC ?? 0) > 0 && (totals.vitaminC ?? 0) < (targets.vitaminC ?? 0)) {
    const need = Math.round((targets.vitaminC ?? 0) - (totals.vitaminC ?? 0));
    if (need >= 30) out.push({ label: "Vitamin C", amount: `${need} mg`, foods: ["oranges", "bell peppers", "broccoli", "strawberries", "kiwi"] });
  }
  if ((targets.iron ?? 0) > 0 && (totals.iron ?? 0) < (targets.iron ?? 0)) {
    const need = Math.round((targets.iron ?? 0) - (totals.iron ?? 0));
    if (need >= 5) out.push({ label: "Iron", amount: `${need} mg`, foods: ["spinach", "lean beef", "beans", "fortified cereal"] });
  }
  if ((targets.calcium ?? 0) > 0 && (totals.calcium ?? 0) < (targets.calcium ?? 0)) {
    const need = Math.round((targets.calcium ?? 0) - (totals.calcium ?? 0));
    if (need >= 200) out.push({ label: "Calcium", amount: `${need} mg`, foods: ["milk", "yogurt", "cheese", "tofu", "leafy greens"] });
  }
  if ((targets.calories ?? 0) > 0 && (totals.calories ?? 0) < (targets.calories ?? 0)) {
    const need = Math.round((targets.calories ?? 0) - (totals.calories ?? 0));
    if (need >= 400 && out.length === 0) out.push({ label: "More calories", amount: `${need} cal`, foods: ["nutrient-dense snacks", "extra serving at meals", "smoothie"] });
  }
  return out;
}

function buildTips(payload: StatusPayload): string[] {
  const tips: string[] = [];
  const sleep = payload.sleepHours ?? 0;
  const water = payload.waterLitres ?? 0;
  const activity = payload.activityMins ?? 0;
  if (sleep < 7) tips.push("Aim for 7+ hours of sleep tonight.");
  if (water < 2) tips.push("Have a glass of water soon — small steps add up.");
  if (activity < 30) tips.push("A 10–15 min walk can boost energy and mood.");
  if (tips.length === 0) tips.push("You're on track. Keep the momentum going.");
  return tips;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    summary: "System ok. Send POST with your wellness data for a personalized status.",
    whatsMissing: [],
    tips: ["Add foods in the Log tab to see what's missing here."],
  } as StatusResponse);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as StatusPayload;
    const whatsMissing = buildWhatsMissing(body);
    const tips = buildTips(body);
    const summary =
      whatsMissing.length === 0
        ? "Your day is looking balanced. Keep it up."
        : `You have ${whatsMissing.length} area${whatsMissing.length === 1 ? "" : "s"} to focus on.`;
    return NextResponse.json({
      ok: true,
      summary,
      whatsMissing,
      tips,
    } as StatusResponse);
  } catch {
    return NextResponse.json(
      { ok: false, summary: "Something went wrong.", whatsMissing: [], tips: [] } as StatusResponse,
      { status: 400 }
    );
  }
}
