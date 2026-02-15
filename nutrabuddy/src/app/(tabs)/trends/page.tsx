"use client";

import { useEffect, useMemo, useRef } from "react";
import { useWellnessStore, type Snap } from "@/store/wellnessStore";

function lastN<T>(arr: T[], n: number) {
  return arr.slice(Math.max(0, arr.length - n));
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
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-xs text-gray-400 mt-1">Last {values.length} logs</p>
        </div>
        <p className="text-xs text-gray-400">{unit}</p>
      </div>

      <div className="mt-4 flex items-end gap-2 h-20">
        {values.map((v, i) => {
          const h = Math.max(4, Math.round((v / max) * 80));
          return (
            <div
              key={i}
              className="flex-1 rounded-2xl bg-[#E3EFE8] overflow-hidden border border-black/5"
              title={`${v}${unit}`}
            >
              <div
                className="w-full bg-[#4F7C6D]"
                style={{ height: `${h}px`, marginTop: `${80 - h}px` }}
              />
            </div>
          );
        })}
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
  const dietScore = useWellnessStore((s) => s.dietScore);

  // take 1 initial snapshot so the chart isn't empty
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // only auto-save if history empty
    if (history.length === 0) saveTodayToHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recent = useMemo(() => lastN(history, 10), [history]);

  const sleepSeries = recent.map((s) => s.sleepHours);
  const waterSeries = recent.map((s) => s.waterCups);
  const activitySeries = recent.map((s) => s.activityMins);
  const moodSeries = recent.map((s) => s.mood);
  const dietSeries = recent.map((s) => s.dietScore);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5]">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <h2 className="text-2xl font-extrabold text-black">Trends</h2>
          <p className="text-sm text-gray-500 mt-1">
            Visualize your last few check-ins.
          </p>

          <div className="mt-4 rounded-3xl bg-[#E3EFE8] p-4 border border-black/5">
            <p className="text-sm text-gray-700">
              Current: <b>{Math.round(sleepHours)}h</b> sleep · <b>{waterCups}</b>{" "}
              cups · <b>{activityMins}</b> min · <b>{mood}/5</b> mood ·{" "}
              <b>{dietScore}/10</b> diet
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
        <MiniBarChart title="Hydration" unit=" cups" values={waterSeries} max={12} />
        <MiniBarChart title="Activity" unit=" min" values={activitySeries} max={180} />
        <MiniBarChart title="Mood" unit="/5" values={moodSeries} max={5} />
        <MiniBarChart title="Diet score" unit="/10" values={dietSeries} max={10} />
      </div>
    </div>
  );
}