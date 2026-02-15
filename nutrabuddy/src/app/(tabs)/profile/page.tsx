"use client";

import { useState } from "react";
import {
  useWellnessStore,
  DAILY_TARGETS,
  GOAL_KEYS,
  type Macros,
} from "@/store/wellnessStore";

const LABELS: Record<keyof Macros, string> = {
  calories: "Calories",
  protein: "Protein (g)",
  carbs: "Carbs (g)",
  fat: "Fat (g)",
  fiber: "Fiber (g)",
  vitaminC: "Vitamin C (mg)",
  iron: "Iron (mg)",
  calcium: "Calcium (mg)",
  sodium: "Sodium (mg)",
};

export default function ProfilePage() {
  const setGoals = useWellnessStore((s) => s.setGoals);

  const [draft, setDraft] = useState<Partial<Macros>>(() => ({
    ...useWellnessStore.getState().goals,
  }));
  const [saved, setSaved] = useState(false);

  const handleConfirm = () => {
    setGoals(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5]">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <h2 className="text-2xl font-extrabold text-black">Profile & Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Customize your avatar, goals, and accessibility options.
          </p>
        </div>

        {/* Daily goals — these set the upper limits in Today's progress */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <h3 className="text-lg font-extrabold text-black">Daily goals</h3>
          <p className="text-sm text-gray-500 mt-1">
            Set targets for each macro, then tap Confirm. They become the upper limits in Today&apos;s progress.
          </p>
          <div className="mt-4 space-y-3">
            {GOAL_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-black shrink-0 w-28">
                  {LABELS[key]}
                </label>
                <input
                  type="number"
                  min={0}
                  step={key === "calories" ? 50 : 1}
                  value={draft[key] ?? ""}
                  placeholder={String(DAILY_TARGETS[key])}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setDraft((prev) => {
                        const next = { ...prev };
                        delete next[key];
                        return next;
                      });
                      return;
                    }
                    const v = Number(raw);
                    setDraft((prev) => ({
                      ...prev,
                      [key]: isNaN(v) ? undefined : Math.max(0, v),
                    }));
                  }}
                  className="w-24 rounded-xl border border-black/10 px-3 py-2 text-sm text-black bg-[#F4F7F5] focus:border-[#4F7C6D] focus:outline-none"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="mt-5 w-full py-3 rounded-2xl bg-[#4F7C6D] text-white font-semibold hover:opacity-90 disabled:opacity-70"
          >
            {saved ? "Saved" : "Confirm"}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">Dark Mode</p>
            <span className="text-xs text-gray-500">Later</span>
          </div>
          <div className="h-px bg-black/10" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">Text Size</p>
            <span className="text-xs text-gray-500">Medium</span>
          </div>
          <div className="h-px bg-black/10" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">Units</p>
            <span className="text-xs text-gray-500">Metric</span>
          </div>
        </div>
      </div>
    </div>
  );
}