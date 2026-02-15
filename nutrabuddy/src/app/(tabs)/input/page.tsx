"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useWellnessStore,
  sumMacros,
  getEffectiveTargets,
  goalsMetCount,
} from "@/store/wellnessStore";
import { estimateMacros } from "@/lib/estimateMacros";

function ProgressBar({
  current,
  target,
  label,
  unit,
}: {
  current: number;
  target: number;
  label: string;
  unit: string;
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const met = current >= target;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600 dark:text-zinc-400">{label}</span>
        <span className={met ? "text-[#4F7C6D] font-medium" : "text-gray-500 dark:text-zinc-400"}>
          {Math.round(current)}{unit} / {Math.round(target)}{unit}
          {met && " ✓"}
        </span>
      </div>
      <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${met ? "bg-[#4F7C6D]" : "bg-[#4F7C6D]/60"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const CUPS_TO_LITRES = 0.236588;

function SliderRow(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  displayText?: string;
}) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-black dark:text-zinc-100">{props.label}</p>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {props.displayText ?? `${props.value}${props.suffix ?? ""}`}
        </p>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="w-full accent-[#4F7C6D]"
      />
    </div>
  );
}

export default function InputPage() {
  const sleepHours = useWellnessStore((s) => s.sleepHours);
  const waterCups = useWellnessStore((s) => s.waterCups);
  const activityMins = useWellnessStore((s) => s.activityMins);
  const mood = useWellnessStore((s) => s.mood);
  const dietScore = useWellnessStore((s) => s.dietScore);
  const foodsToday = useWellnessStore((s) => s.foodsToday);

  const setSleepHours = useWellnessStore((s) => s.setSleepHours);
  const setWaterCups = useWellnessStore((s) => s.setWaterCups);
  const setActivityMins = useWellnessStore((s) => s.setActivityMins);
  const setMood = useWellnessStore((s) => s.setMood);

  const goals = useWellnessStore((s) => s.goals);
  const addFood = useWellnessStore((s) => s.addFood);
  const updateFoodMacros = useWellnessStore((s) => s.updateFoodMacros);
  const removeFood = useWellnessStore((s) => s.removeFood);
  const saveTodayToHistory = useWellnessStore((s) => s.saveTodayToHistory);

  const [foodText, setFoodText] = useState("");
  const [loadingMacroIds, setLoadingMacroIds] = useState<Set<string>>(new Set());
  const [savedFeedback, setSavedFeedback] = useState(false);

  const totals = useMemo(() => sumMacros(foodsToday), [foodsToday]);
  const targets = useMemo(() => getEffectiveTargets(goals), [goals]);
  const goalsMet = useMemo(() => goalsMetCount(totals, targets), [totals, targets]);
  const totalGoals = 8;

  // Backfill estimates for any logged foods that have no macros (e.g. added before API/estimate existed)
  useEffect(() => {
    for (const f of foodsToday) {
      if (!f.macros || f.macros.calories === 0) {
        updateFoodMacros(f.id, estimateMacros(f.text));
      }
    }
  }, [foodsToday, updateFoodMacros]);

  const addFoodWithMacros = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t) return;
      const id = addFood(t, "other");
      setFoodText("");
      setLoadingMacroIds((prev) => new Set(prev).add(id));
      try {
        // Use Supabase backend (USDA/Gemini) when BACKEND_URL is set; else use Next.js /api/nutrients
        let data: Record<string, unknown> = {};
        const backendRes = await fetch("/api/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: t }),
        });
        data = await backendRes.json().catch(() => ({}));

        if (!backendRes.ok || data.calories === undefined) {
          const fallbackRes = await fetch("/api/nutrients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foodName: t }),
          });
          data = await fallbackRes.json().catch(() => ({}));
        }

        if (data && (typeof data.calories === "number" || typeof data.calories === "string")) {
          updateFoodMacros(id, {
            calories: Number(data.calories) || 0,
            protein: Number(data.protein) || 0,
            carbs: Number(data.carbs) || 0,
            fat: Number(data.fat) || 0,
            fiber: Number(data.fiber) || 0,
            vitaminC: Number(data.vitaminC) || 0,
            iron: Number(data.iron) || 0,
            calcium: Number(data.calcium) || 0,
            sodium: Number(data.sodium) || 0,
          });
        } else {
          // API not configured or failed — use estimates so Today's progress still updates
          updateFoodMacros(id, estimateMacros(t));
        }
      } catch {
        // Network error — still apply estimates so progress updates
        updateFoodMacros(id, estimateMacros(t));
      } finally {
        setLoadingMacroIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [addFood, updateFoodMacros]
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5] dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        {/* What did you eat — one line + Add */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10">
          <h2 className="text-xl font-extrabold text-black dark:text-zinc-100">What did you eat?</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Type what you ate — we’ll look up nutrients and track them.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={foodText}
              onChange={(e) => setFoodText(e.target.value)}
              placeholder="e.g. chicken breast, oatmeal, apple"
              className="flex-1 bg-[#F4F7F5] dark:bg-zinc-700 rounded-2xl px-4 py-2.5 text-sm text-black dark:text-zinc-100 outline-none border border-black/5 dark:border-white/20 focus:border-[#4F7C6D] placeholder:text-gray-400 dark:placeholder:text-zinc-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFoodWithMacros(foodText);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addFoodWithMacros(foodText)}
              className="px-5 py-2.5 rounded-2xl bg-[#4F7C6D] text-white text-sm font-semibold hover:opacity-90 shrink-0"
              aria-label="Add food"
            >
              Add
            </button>
          </div>
        </div>

        {/* Today's progress toward goals */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-black dark:text-zinc-100">Today’s progress</h2>
            <span className="text-sm font-semibold text-[#4F7C6D]">
              {goalsMet} / {totalGoals} goals met
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Based on logged foods. Add items above to update.
          </p>
          <div className="mt-4 space-y-3">
            <ProgressBar
              current={totals.calories}
              target={targets.calories}
              label="Calories"
              unit=""
            />
            <ProgressBar
              current={totals.protein}
              target={targets.protein}
              label="Protein"
              unit="g"
            />
            <ProgressBar
              current={totals.carbs}
              target={targets.carbs}
              label="Carbs"
              unit="g"
            />
            <ProgressBar
              current={totals.fat}
              target={targets.fat}
              label="Fat"
              unit="g"
            />
            <ProgressBar
              current={totals.fiber ?? 0}
              target={targets.fiber}
              label="Fiber"
              unit="g"
            />
            <ProgressBar
              current={totals.vitaminC}
              target={targets.vitaminC}
              label="Vitamin C"
              unit=" mg"
            />
            <ProgressBar
              current={totals.iron}
              target={targets.iron}
              label="Iron"
              unit=" mg"
            />
            <ProgressBar
              current={totals.calcium ?? 0}
              target={targets.calcium}
              label="Calcium"
              unit=" mg"
            />
          </div>
        </div>

        {/* Logged foods with full nutrients */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10">
          <h2 className="text-lg font-extrabold text-black dark:text-zinc-100">Logged today</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Nutrients per item (macros + micronutrients).
          </p>
          <div className="mt-4 space-y-3">
            {foodsToday.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-zinc-500 py-4">No foods yet. Add something above.</p>
            ) : (
              foodsToday
                .slice()
                .reverse()
                .map((f) => (
                  <div
                    key={f.id}
                    className="bg-[#F4F7F5] dark:bg-zinc-700 rounded-2xl px-4 py-3 border border-black/5 dark:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-black dark:text-zinc-100">{f.text}</p>
                        {loadingMacroIds.has(f.id) ? (
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Looking up nutrients…</p>
                        ) : f.macros ? (
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-zinc-400">
                            <span>Cal {Math.round(f.macros.calories)}</span>
                            <span>P {f.macros.protein}g</span>
                            <span>C {f.macros.carbs}g</span>
                            <span>F {f.macros.fat}g</span>
                            {"fiber" in f.macros && <span>Fiber {f.macros.fiber}g</span>}
                            <span>Vit C {f.macros.vitaminC}mg</span>
                            <span>Iron {f.macros.iron}mg</span>
                            {"calcium" in f.macros && <span>Ca {f.macros.calcium}mg</span>}
                            {"sodium" in f.macros && <span>Na {f.macros.sodium}mg</span>}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">{f.cat}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFood(f.id)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-white border border-black/10 text-red-600 hover:bg-red-50 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Sleep, hydration, activity, mood — compact */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-black dark:text-zinc-100">Also log</h2>
            <button
              type="button"
              onClick={() => {
                saveTodayToHistory();
                setSavedFeedback(true);
                setTimeout(() => setSavedFeedback(false), 2000);
              }}
              className="px-4 py-2 rounded-2xl bg-[#4F7C6D] text-white text-sm font-semibold hover:opacity-90"
            >
              {savedFeedback ? "Saved!" : "Save day"}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Sleep, hydration, activity, mood — used for trends.
          </p>
          <div className="mt-3 space-y-0 divide-y divide-black/5 dark:divide-white/10">
            <SliderRow
              label="Sleep"
              value={Number(sleepHours.toFixed(1))}
              min={0}
              max={12}
              step={0.5}
              onChange={setSleepHours}
              suffix="h"
            />
            <SliderRow label="Hydration" value={waterCups} min={0} max={12} step={1} onChange={setWaterCups} displayText={`${(waterCups * CUPS_TO_LITRES).toFixed(1)} L`} />
            <SliderRow label="Activity" value={activityMins} min={0} max={180} step={5} onChange={setActivityMins} suffix=" m" />
            <SliderRow label="Mood" value={mood} min={1} max={5} step={1} onChange={setMood} suffix="/5" />
          </div>
        </div>
      </div>
    </div>
  );
}