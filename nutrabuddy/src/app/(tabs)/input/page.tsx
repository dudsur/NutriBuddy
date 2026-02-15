"use client";

import { useMemo, useState } from "react";
import { useWellnessStore } from "@/store/wellnessStore";

function SliderRow(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-black">{props.label}</p>
        <p className="text-sm text-gray-500">
          {props.value}
          {props.suffix ?? ""}
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

  const addFood = useWellnessStore((s) => s.addFood);
  const removeFood = useWellnessStore((s) => s.removeFood);
  const saveTodayToHistory = useWellnessStore((s) => s.saveTodayToHistory);

  const [foodText, setFoodText] = useState("");
  const [foodCat, setFoodCat] = useState<
    "protein" | "veg" | "fruit" | "water" | "carb" | "snack" | "other"
  >("protein");

  const dietLabel = useMemo(() => {
    if (dietScore >= 8) return "On Track";
    if (dietScore >= 5) return "Okay";
    return "Needs Work";
  }, [dietScore]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5]">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <h2 className="text-2xl font-extrabold text-black">Log Today</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sliders + food log update your trends automatically.
          </p>
        </div>

        {/* sliders */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <SliderRow
            label="Sleep"
            value={Number(sleepHours.toFixed(1))}
            min={0}
            max={12}
            step={0.5}
            onChange={setSleepHours}
            suffix="h"
          />
          <div className="h-px bg-black/10" />
          <SliderRow
            label="Hydration"
            value={waterCups}
            min={0}
            max={12}
            step={1}
            onChange={setWaterCups}
            suffix=" cups"
          />
          <div className="h-px bg-black/10" />
          <SliderRow
            label="Activity"
            value={activityMins}
            min={0}
            max={180}
            step={5}
            onChange={setActivityMins}
            suffix=" min"
          />
          <div className="h-px bg-black/10" />
          <SliderRow
            label="Mood"
            value={mood}
            min={1}
            max={5}
            step={1}
            onChange={setMood}
            suffix="/5"
          />
        </div>

        {/* diet derived */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500">Diet (auto)</p>
              <p className="text-2xl font-extrabold text-black mt-1">
                {dietLabel} <span className="text-gray-400 text-base">({dietScore}/10)</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Based on what you log below.
              </p>
            </div>
            <button
              onClick={() => {
                saveTodayToHistory();
              }}
              className="px-4 py-2 rounded-2xl bg-[#4F7C6D] text-white text-sm font-semibold hover:opacity-90 transition"
            >
              Save
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              value={foodText}
              onChange={(e) => setFoodText(e.target.value)}
              placeholder="Add food (e.g., chicken, salad, donut)"
              className="flex-1 bg-[#F4F7F5] rounded-2xl px-3 py-2 text-sm outline-none border border-black/5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const t = foodText.trim();
                  if (!t) return;
                  addFood(t, foodCat);
                  setFoodText("");
                }
              }}
            />

            <select
              value={foodCat}
              onChange={(e) => setFoodCat(e.target.value as any)}
              className="bg-[#F4F7F5] rounded-2xl px-3 py-2 text-sm border border-black/5"
            >
              <option value="protein">Protein</option>
              <option value="veg">Veg</option>
              <option value="fruit">Fruit</option>
              <option value="carb">Carb</option>
              <option value="snack">Snack</option>
              <option value="water">Water</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={() => {
                const t = foodText.trim();
                if (!t) return;
                addFood(t, foodCat);
                setFoodText("");
              }}
              className="px-3 py-2 rounded-2xl bg-white border border-black/5 shadow-sm text-sm font-semibold"
            >
              +
            </button>
          </div>

          {/* quick chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { t: "Chicken", c: "protein" },
              { t: "Eggs", c: "protein" },
              { t: "Salad", c: "veg" },
              { t: "Fruit", c: "fruit" },
              { t: "Donut", c: "snack" },
              { t: "Pasta", c: "carb" },
            ].map((x) => (
              <button
                key={x.t}
                onClick={() => addFood(x.t, x.c as any)}
                className="text-xs px-3 py-2 rounded-2xl bg-[#F4F7F5] border border-black/5"
              >
                {x.t}
              </button>
            ))}
          </div>

          {/* list */}
          <div className="mt-4 space-y-2">
            {foodsToday.length === 0 ? (
              <p className="text-sm text-gray-400">No foods logged yet.</p>
            ) : (
              foodsToday
                .slice()
                .reverse()
                .map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between bg-[#F4F7F5] rounded-2xl px-3 py-2 border border-black/5"
                  >
                    <div>
                    <p className="text-sm font-semibold text-black">{f.text}</p>
                    <p className="text-xs text-gray-500">{f.cat}</p>
                    </div>
                    <button
                      onClick={() => removeFood(f.id)}
                      className="text-xs px-3 py-2 rounded-2xl bg-white border border-black/5"
                    >
                      Remove
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-[#E3EFE8] rounded-3xl p-5 border border-black/5">
          <p className="text-sm text-gray-700">
            Tip: hit <b>Save</b> once you’re done — Trends pulls from saved daily history.
          </p>
        </div>
      </div>
    </div>
  );
}