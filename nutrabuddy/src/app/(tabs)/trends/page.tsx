"use client";

import { useMemo } from "react";
import { useWellnessStore, type Snap } from "@/store/wellnessStore";

function lastN<T>(arr: T[], n: number) {
  return arr.slice(Math.max(0, arr.length - n));
}

const CUPS_TO_LITRES = 0.236588;

function formatBarValue(value: number, unit: string): string {
  if (unit === "h") return `${value}h`;
  if (unit === " L") return `${Number(value).toFixed(1)} L`;
  if (unit === " m") return `${value} m`;
  if (unit === "/5") return `${value}/5`;
  if (unit === "/10") return `${value}/10`;
  return `${value}${unit}`;
}

function MiniBarChart({
  title,
  unit,
  values,
  max,
}: {
  title: string;
  unit: string;
  values: number[];
  max: number;
}) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">{title}</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Last {values.length} logs</p>
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500">{unit}</p>
      </div>

      <div className="mt-4 flex items-end gap-2" style={{ height: "100px" }}>
        {values.map((v, i) => {
          const fillPx = max > 0 ? Math.round((v / max) * 100) : 0;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end rounded-t-2xl bg-[#E3EFE8] dark:bg-zinc-700 overflow-hidden border border-black/5 dark:border-white/10 h-full min-w-0"
              title={`${v}${unit}`}
            >
              <div
                className="w-full bg-[#4F7C6D] rounded-t-2xl"
                style={{ height: fillPx ? `${fillPx}px` : "0px" }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-2">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 text-center text-xs text-gray-600 dark:text-zinc-400 truncate"
          >
            {formatBarValue(v, unit)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrendsPage() {
  // ✅ Select primitives individually (avoids getSnapshot loop)
  const history = useWellnessStore((s) => s.history);
  const saveTodayToHistory = useWellnessStore((s) => s.saveTodayToHistory);

  const sleepHours = useWellnessStore((s) => s.sleepHours);
  const waterCups = useWellnessStore((s) => s.waterCups);
  const activityMins = useWellnessStore((s) => s.activityMins);
  const mood = useWellnessStore((s) => s.mood);

  // Only show saved logs — no auto-save. Bars appear only after user clicks "Save today's snapshot".
  const recent = useMemo(() => lastN(history, 10), [history]);

  const sleepSeries = recent.map((s) => s.sleepHours);
  const waterSeriesLitres = useMemo(() => recent.map((s) => s.waterCups * CUPS_TO_LITRES), [recent]);
  const activitySeries = recent.map((s) => s.activityMins);
  const moodSeries = recent.map((s) => s.mood);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5] dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10">
          <h2 className="text-2xl font-extrabold text-black dark:text-zinc-100">Trends</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Visualize your last few check-ins.
          </p>

          <div className="mt-4 rounded-3xl bg-[#E3EFE8] dark:bg-zinc-700 p-4 border border-black/5 dark:border-white/10">
            <p className="text-sm text-gray-700 dark:text-zinc-300">
              Current: <b>{Math.round(sleepHours)}h</b> sleep · <b>{(waterCups * CUPS_TO_LITRES).toFixed(1)} L</b> · <b>{activityMins}</b> m · <b>{mood}/5</b> mood
            </p>

            <button
              type="button"
              onClick={() => saveTodayToHistory()}
              className="mt-3 w-full rounded-2xl bg-[#4F7C6D] text-white py-2 text-sm font-semibold hover:opacity-90 transition"
            >
              Save today’s snapshot
            </button>
          </div>
        </div>

        <MiniBarChart title="Sleep" unit="h" values={sleepSeries} max={12} />
        <MiniBarChart title="Hydration" unit=" L" values={waterSeriesLitres} max={12 * CUPS_TO_LITRES} />
        <MiniBarChart title="Activity" unit=" m" values={activitySeries} max={180} />
        <MiniBarChart title="Mood" unit="/5" values={moodSeries} max={5} />
      </div>
    </div>
  );
}