"use client";

import {
  useWellnessStore,
  sumMacros,
  getMacroGaps,
  DAILY_TARGETS,
  goalsMetCount,
  type Macros,
} from "@/store/wellnessStore";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

function getWhatToEat(gaps: Macros): { label: string; foods: string[] }[] {
  const out: { label: string; foods: string[] }[] = [];
  if (gaps.protein >= 15) {
    out.push({
      label: "Protein",
      foods: ["chicken breast", "eggs", "Greek yogurt", "tofu", "lentils"],
    });
  }
  if (gaps.carbs >= 50) {
    out.push({
      label: "Carbs",
      foods: ["oatmeal", "rice", "sweet potato", "whole-grain bread", "banana"],
    });
  }
  if (gaps.fat >= 20) {
    out.push({
      label: "Healthy fats",
      foods: ["avocado", "nuts", "olive oil", "salmon", "nut butter"],
    });
  }
  if (gaps.vitaminC >= 30) {
    out.push({
      label: "Vitamin C",
      foods: ["oranges", "bell peppers", "broccoli", "strawberries", "kiwi"],
    });
  }
  if (gaps.iron >= 5) {
    out.push({
      label: "Iron",
      foods: ["spinach", "lean beef", "beans", "fortified cereal", "dark chocolate"],
    });
  }
  if ((gaps.fiber ?? 0) >= 8) {
    out.push({
      label: "Fiber",
      foods: ["beans", "oats", "berries", "broccoli", "whole grains"],
    });
  }
  if ((gaps.calcium ?? 0) >= 200) {
    out.push({
      label: "Calcium",
      foods: ["milk", "yogurt", "cheese", "tofu", "leafy greens"],
    });
  }
  if (gaps.calories >= 400 && out.length === 0) {
    out.push({
      label: "More calories",
      foods: ["nutrient-dense snacks", "extra serving at meals", "smoothie"],
    });
  }
  return out;
}

type AvatarKey =
  | "well-rested"
  | "sleep-deprived"
  | "balanced-diet"
  | "overindulging"
  | "consistent-exercise"
  | "sedentary"
  | "fully-hydrated"
  | "dehydrated"
  | "mindful-calm";

function determineAvatar({
  sleep,
  water,
  activity,
  mood,
  diet,
}: {
  sleep: number;
  water: number;
  activity: number;
  mood: number;
  diet: number;
}): AvatarKey {
  // Priority order: strongest signals first
  if (sleep <= 5) return "sleep-deprived";
  if (sleep >= 7.5) return "well-rested";

  if (water <= 3) return "dehydrated";
  if (water >= 8) return "fully-hydrated";

  if (activity <= 10) return "sedentary";
  if (activity >= 90) return "consistent-exercise";

  if (diet <= 3) return "overindulging";
  if (diet >= 8) return "balanced-diet";

  if (mood >= 4) return "mindful-calm";

  return "well-rested";
}

function copyForAvatar(a: AvatarKey) {
  switch (a) {
    case "well-rested":
      return { title: "Well Rested", desc: "Nice — your recovery looks solid today." };
    case "sleep-deprived":
      return { title: "Sleep Deprived", desc: "Try a slightly earlier night — it’ll help fast." };
    case "fully-hydrated":
      return { title: "Fully Hydrated", desc: "Great — hydration is supporting your energy." };
    case "dehydrated":
      return { title: "Dehydrated", desc: "Drink a couple cups soon — quick win." };
    case "consistent-exercise":
      return { title: "Consistent Exercise", desc: "Momentum is strong — keep it steady." };
    case "sedentary":
      return { title: "Sedentary", desc: "A short walk can instantly improve your day." };
    case "balanced-diet":
      return { title: "Balanced Diet", desc: "Good choices — your meals look on track." };
    case "overindulging":
      return { title: "Overindulging", desc: "No stress — small swaps can turn it around fast." };
    case "mindful-calm":
      return { title: "Mindful & Calm", desc: "Your mood looks steady — protect that calm." };
  }
}

const avatarMap: Record<AvatarKey, string> = {
  "well-rested": "/avatars/human1/well-rested.png",
  "sleep-deprived": "/avatars/human1/sleep-deprived.png",
  "balanced-diet": "/avatars/human1/balanced-diet.png",
  "overindulging": "/avatars/human1/overindulging.png",
  "consistent-exercise": "/avatars/human1/consistent-exercise.png",
  sedentary: "/avatars/human1/sedentary.png",
  "fully-hydrated": "/avatars/human1/fully-hydrated.png",
  dehydrated: "/avatars/human1/dehydrated.png",
  "mindful-calm": "/avatars/human1/mindful-calm.png",
};

export default function OverviewPage() {
  const sleepHours = useWellnessStore((s) => s.sleepHours);
  const waterCups = useWellnessStore((s) => s.waterCups);
  const activityMins = useWellnessStore((s) => s.activityMins);
  const mood = useWellnessStore((s) => s.mood);
  const dietScore = useWellnessStore((s) => s.dietScore);
  const foodsToday = useWellnessStore((s) => s.foodsToday);

  const { totals, gaps, suggestions, goalsMet } = useMemo(() => {
    const tot = sumMacros(foodsToday);
    const g = getMacroGaps(tot);
    return {
      totals: tot,
      gaps: g,
      suggestions: getWhatToEat(g),
      goalsMet: goalsMetCount(tot),
    };
  }, [foodsToday]);

  const hasAnyMacros = useMemo(
    () => foodsToday.some((f) => f.macros && (f.macros.calories > 0 || f.macros.protein > 0)),
    [foodsToday]
  );

  const avatarKey = useMemo(() => {
    return determineAvatar({
      sleep: sleepHours,
      water: waterCups,
      activity: activityMins,
      mood,
      diet: dietScore,
    });
  }, [sleepHours, waterCups, activityMins, mood, dietScore]);

  const moodCopy = copyForAvatar(avatarKey);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5]">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        {/* Mood card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[#E3EFE8] shadow-sm border border-black/5">
              <AnimatePresence mode="wait">
                <motion.img
                  key={avatarKey}
                  src={avatarMap[avatarKey]}
                  alt={avatarKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">NutraBuddy mood</p>
              <h2 className="text-3xl font-extrabold leading-tight text-black">
                {moodCopy.title}
              </h2>
              <p className="text-gray-600 mt-1">{moodCopy.desc}</p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F4F7F5] rounded-3xl p-5 shadow-sm border border-black/5">
            <p className="text-sm text-gray-500">Sleep</p>
            <p className="text-4xl font-extrabold text-black mt-2">
              {Math.round(sleepHours)}h
            </p>
          </div>

          <div className="bg-[#F4F7F5] rounded-3xl p-5 shadow-sm border border-black/5">
            <p className="text-sm text-gray-500">Hydration</p>
            <p className="text-4xl font-extrabold text-black mt-2">
              {waterCups} <span className="font-extrabold">cups</span>
            </p>
          </div>
        </div>

        {/* Today's macros & what's missing */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-black">Today&apos;s diet</h2>
            {hasAnyMacros && (
              <span className="text-sm font-semibold text-[#4F7C6D]">
                {goalsMet} / 8 goals met
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Based on foods you logged. Tap + to add more.
          </p>

          {hasAnyMacros ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#F4F7F5] rounded-2xl px-3 py-2">
                  <p className="text-gray-500">Calories</p>
                  <p className="font-bold text-black">
                    {Math.round(totals.calories)} / {DAILY_TARGETS.calories}
                  </p>
                </div>
                <div className="bg-[#F4F7F5] rounded-2xl px-3 py-2">
                  <p className="text-gray-500">Protein</p>
                  <p className="font-bold text-black">
                    {Math.round(totals.protein)}g / {DAILY_TARGETS.protein}g
                  </p>
                </div>
                <div className="bg-[#F4F7F5] rounded-2xl px-3 py-2">
                  <p className="text-gray-500">Carbs</p>
                  <p className="font-bold text-black">
                    {Math.round(totals.carbs)}g / {DAILY_TARGETS.carbs}g
                  </p>
                </div>
                <div className="bg-[#F4F7F5] rounded-2xl px-3 py-2">
                  <p className="text-gray-500">Fat</p>
                  <p className="font-bold text-black">
                    {Math.round(totals.fat)}g / {DAILY_TARGETS.fat}g
                  </p>
                </div>
              </div>

              {suggestions.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-black/10">
                  <p className="text-sm font-semibold text-black">What&apos;s missing</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try adding these to round out your day:
                  </p>
                  <ul className="mt-2 space-y-2">
                    {suggestions.map((s) => (
                      <li key={s.label} className="text-sm">
                        <span className="font-medium text-[#4F7C6D]">{s.label}:</span>{" "}
                        <span className="text-gray-700">
                          {s.foods.slice(0, 3).join(", ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-black/10">
                  <p className="text-sm font-semibold text-[#4F7C6D]">
                    You&apos;re on track
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your logged foods are covering your macro targets well. Keep it up!
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Log foods in the <strong>Log</strong> tab — we&apos;ll look up macros and show what to eat more of.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}