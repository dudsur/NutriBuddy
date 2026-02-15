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
  const darkMode = useWellnessStore((s) => s.darkMode);
  const setDarkMode = useWellnessStore((s) => s.setDarkMode);
  const textSize = useWellnessStore((s) => s.textSize);
  const setTextSize = useWellnessStore((s) => s.setTextSize);

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
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5] dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10">
          <h2 className="text-2xl font-extrabold text-black dark:text-zinc-100">Profile & Settings</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Customize your avatar, goals, and accessibility options.
          </p>
        </div>

        {/* Daily goals — these set the upper limits in Today's progress */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10">
          <h3 className="text-lg font-extrabold text-black dark:text-zinc-100">Daily goals</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Set targets for each macro, then tap Confirm. They become the upper limits in Today&apos;s progress.
          </p>
          <div className="mt-4 space-y-3">
            {GOAL_KEYS.map((key) => {
              const step = key === "calories" ? 50 : 1;
              const current = draft[key] ?? "";
              const num = typeof current === "number" ? current : (current === "" ? 0 : Number(current));
              const baseVal = current !== "" && !isNaN(num) ? num : (draft[key] ?? 0);
              return (
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-black dark:text-zinc-200 shrink-0 w-28">
                    {LABELS[key]}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      step={step}
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
                      className="w-24 rounded-xl border border-black/10 dark:border-white/20 px-3 py-2 text-sm text-black dark:text-zinc-100 bg-[#F4F7F5] dark:bg-zinc-700 focus:border-[#4F7C6D] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex flex-col rounded-lg border border-black/10 dark:border-white/20 overflow-hidden bg-[#F4F7F5] dark:bg-zinc-700">
                      <button
                        type="button"
                        aria-label={`Increase ${LABELS[key]}`}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            [key]: Math.max(0, (prev[key] ?? baseVal) + step),
                          }))
                        }
                        className="p-1 text-[#4F7C6D] hover:bg-[#4F7C6D]/10 focus:outline-none focus:ring-1 focus:ring-[#4F7C6D]"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label={`Decrease ${LABELS[key]}`}
                        onClick={() =>
                          setDraft((prev) => {
                            const nextVal = (prev[key] ?? baseVal) - step;
                            if (nextVal <= 0) {
                              const next = { ...prev };
                              delete next[key];
                              return next;
                            }
                            return { ...prev, [key]: nextVal };
                          })
                        }
                        className="p-1 text-[#4F7C6D] hover:bg-[#4F7C6D]/10 focus:outline-none focus:ring-1 focus:ring-[#4F7C6D] border-t border-black/10 dark:border-white/20"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="mt-5 w-full py-3 rounded-2xl bg-[#4F7C6D] text-white font-semibold hover:opacity-90 disabled:opacity-70"
          >
            {saved ? "Saved" : "Confirm"}
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black dark:text-zinc-100">Dark Mode</p>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              aria-label={darkMode ? "Dark mode on" : "Dark mode off"}
              onClick={() => {
                const next = !useWellnessStore.getState().darkMode;
                setDarkMode(next);
                if (next) document.documentElement.classList.add("dark");
                else document.documentElement.classList.remove("dark");
              }}
              className={`relative inline-flex h-7 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F7C6D] focus:ring-offset-2 dark:focus:ring-offset-zinc-800 ${
                darkMode
                  ? "bg-[#4F7C6D]"
                  : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`pointer-events-none absolute top-0.5 inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  darkMode ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"
                }`}
              />
            </button>
          </div>
          <div className="h-px bg-black/10 dark:bg-white/10" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black dark:text-zinc-100">Text Size</p>
            <button
              type="button"
              onClick={() => {
                const order: Array<"small" | "medium" | "large"> = ["small", "medium", "large"];
                const i = order.indexOf(textSize);
                setTextSize(order[(i + 1) % 3]);
              }}
              className="text-xs text-[#4F7C6D] font-medium hover:underline"
            >
              {textSize.charAt(0).toUpperCase() + textSize.slice(1)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}