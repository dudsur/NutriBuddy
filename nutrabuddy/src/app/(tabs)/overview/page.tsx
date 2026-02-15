"use client";

import {
  useWellnessStore,
  sumMacros,
  getMacroGaps,
  getEffectiveTargets,
  goalsMetCount,
  type Macros,
} from "@/store/wellnessStore";
import { getAvatarKeyByLack, AVATAR_PATHS as avatarMap, type AvatarKey } from "@/lib/avatarByLack";
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

export default function OverviewPage() {
  const sleepHours = useWellnessStore((s) => s.sleepHours);
  const waterLitres = useWellnessStore((s) => s.waterLitres);
  const activityMins = useWellnessStore((s) => s.activityMins);
  const mood = useWellnessStore((s) => s.mood);
  const dietScore = useWellnessStore((s) => s.dietScore);
  const foodsToday = useWellnessStore((s) => s.foodsToday);
  const goals = useWellnessStore((s) => s.goals);

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

  const targets = useMemo(() => getEffectiveTargets(goals), [goals]);
  const calorieLimit = targets.calories;

  const macroMet = useMemo(
    () => ({
      calories: totals.calories >= targets.calories,
      protein: totals.protein >= targets.protein,
      carbs: totals.carbs >= targets.carbs,
      fat: totals.fat >= targets.fat,
    }),
    [totals, targets]
  );

  const avatarKey = useMemo(
    () =>
      getAvatarKeyByLack({
        sleep: sleepHours,
        water: waterLitres,
        activity: activityMins,
        mood,
        diet: dietScore,
        caloriesToday: totals.calories,
        calorieLimit,
      }),
    [sleepHours, waterLitres, activityMins, mood, dietScore, totals.calories, calorieLimit]
  );

  const moodCopy = copyForAvatar(avatarKey);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5] dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        {/* Mood card */}
        <div className="group bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10 transition-transform duration-200 ease-out hover:scale-[1.02] origin-center">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[#E3EFE8] dark:bg-zinc-700 shadow-sm border border-black/5 dark:border-white/10">
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
              <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium group-hover:text-gray-700 dark:group-hover:text-zinc-300">NutraBuddy mood</p>
              <h2 className="text-3xl font-extrabold leading-tight text-black dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                {moodCopy.title}
              </h2>
              <p className="text-gray-600 dark:text-zinc-300 mt-1 group-hover:text-gray-700 dark:group-hover:text-zinc-200">{moodCopy.desc}</p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group bg-[#F4F7F5] dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10 transition-transform duration-200 ease-out hover:scale-[1.02] origin-center">
            <p className="text-sm text-gray-500 dark:text-zinc-400 group-hover:text-gray-700 dark:group-hover:text-zinc-300">Sleep</p>
            <p className="text-4xl font-extrabold text-black dark:text-zinc-100 mt-2 group-hover:text-black dark:group-hover:text-white">
              {Math.round(sleepHours)}h
            </p>
          </div>

          <div className="group bg-[#F4F7F5] dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10 transition-transform duration-200 ease-out hover:scale-[1.02] origin-center">
            <p className="text-sm text-gray-500 dark:text-zinc-400 group-hover:text-gray-700 dark:group-hover:text-zinc-300">Hydration</p>
            <p className="text-4xl font-extrabold text-black dark:text-zinc-100 mt-2 group-hover:text-black dark:group-hover:text-white">
              {waterLitres.toFixed(1)} <span className="font-extrabold">L</span>
            </p>
          </div>
        </div>

        {/* Today's macros & what's missing */}
        <div className="group bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10 transition-transform duration-200 ease-out hover:scale-[1.02] origin-center">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-black dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">Today&apos;s diet</h2>
            {hasAnyMacros && (
              <span className="text-sm font-semibold text-[#4F7C6D] group-hover:brightness-110">
                {goalsMet} / 8 goals met
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 group-hover:text-gray-700 dark:group-hover:text-zinc-300">
            Based on foods you logged. Tap + to add more.
          </p>

          {hasAnyMacros ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    macroMet.calories
                      ? "bg-[#4F7C6D] text-white"
                      : "bg-[#F4F7F5] dark:bg-zinc-700"
                  }`}
                >
                  <p className={macroMet.calories ? "text-white/90" : "text-gray-500 dark:text-zinc-400"}>
                    Calories
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-black dark:text-zinc-100">
                      {Math.round(totals.calories)} / {targets.calories}
                    </p>
                    {macroMet.calories && (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                        <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#4F7C6D]" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    macroMet.protein
                      ? "bg-[#4F7C6D] text-white"
                      : "bg-[#F4F7F5] dark:bg-zinc-700"
                  }`}
                >
                  <p className={macroMet.protein ? "text-white/90" : "text-gray-500 dark:text-zinc-400"}>
                    Protein
                  </p>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${macroMet.protein ? "text-white" : "text-black dark:text-zinc-100"}`}>
                      {Math.round(totals.protein)}g / {targets.protein}g
                    </p>
                    {macroMet.protein && (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                        <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#4F7C6D]" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    macroMet.carbs
                      ? "bg-[#4F7C6D] text-white"
                      : "bg-[#F4F7F5] dark:bg-zinc-700"
                  }`}
                >
                  <p className={macroMet.carbs ? "text-white/90" : "text-gray-500 dark:text-zinc-400"}>
                    Carbs
                  </p>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${macroMet.carbs ? "text-white" : "text-black dark:text-zinc-100"}`}>
                      {Math.round(totals.carbs)}g / {targets.carbs}g
                    </p>
                    {macroMet.carbs && (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                        <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#4F7C6D]" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    macroMet.fat
                      ? "bg-[#4F7C6D] text-white"
                      : "bg-[#F4F7F5] dark:bg-zinc-700"
                  }`}
                >
                  <p className={macroMet.fat ? "text-white/90" : "text-gray-500 dark:text-zinc-400"}>
                    Fat
                  </p>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${macroMet.fat ? "text-white" : "text-black dark:text-zinc-100"}`}>
                      {Math.round(totals.fat)}g / {targets.fat}g
                    </p>
                    {macroMet.fat && (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                        <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#4F7C6D]" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {suggestions.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                  <p className="text-sm font-semibold text-black dark:text-zinc-100">What&apos;s missing</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                    Try adding these to round out your day:
                  </p>
                  <ul className="mt-2 space-y-2">
                    {suggestions.map((s) => (
                      <li key={s.label} className="text-sm">
                        <span className="font-medium text-[#4F7C6D]">{s.label}:</span>{" "}
                        <span className="text-gray-700 dark:text-zinc-300">
                          {s.foods.slice(0, 3).join(", ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                  <p className="text-sm font-semibold text-[#4F7C6D]">
                    You&apos;re on track
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                    Your logged foods are covering your macro targets well. Keep it up!
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">
              Log foods in the <strong>Log</strong> tab — we&apos;ll look up macros and show what to eat more of.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}