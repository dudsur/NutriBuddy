import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FoodCategory =
  | "protein"
  | "veg"
  | "fruit"
  | "water"
  | "carb"
  | "snack"
  | "other";

export type FoodItem = {
  id: string;
  text: string;
  cat: FoodCategory;
  ts: number;
};

export type Snap = {
  id: string;
  ts: number;
  sleepHours: number;
  waterCups: number;
  activityMins: number;
  mood: number;
  dietScore: number;
};

export type WellnessState = {
  sleepHours: number; // 0–12
  waterCups: number; // 0–12
  activityMins: number; // 0–180
  mood: number; // 1–5

  // "Diet" becomes derived from food logging (not a slider)
  dietScore: number; // 0–10 (auto)
  foodsToday: FoodItem[];

  // Trends
  history: Snap[];
};

type WellnessActions = {
  setSleepHours: (v: number) => void;
  setWaterCups: (v: number) => void;
  setActivityMins: (v: number) => void;
  setMood: (v: number) => void;

  addFood: (text: string, cat: FoodCategory) => void;
  removeFood: (id: string) => void;

  recomputeDietScore: () => void;

  addSnapshot: (snap?: Partial<Snap>) => void;
  saveTodayToHistory: () => void;
  clearFoodsToday: () => void;
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * Super simple scoring just for demo UI:
 * - protein/veg/fruit/water increases score
 * - snack lowers score
 */
function scoreFromFoods(foods: FoodItem[]) {
  let score = 5;

  for (const f of foods) {
    if (f.cat === "protein") score += 1.2;
    if (f.cat === "veg") score += 1.1;
    if (f.cat === "fruit") score += 0.9;
    if (f.cat === "water") score += 0.7;
    if (f.cat === "carb") score += 0.2;
    if (f.cat === "snack") score -= 1.0;
    if (f.cat === "other") score += 0.0;
  }

  return clamp(Math.round(score), 0, 10);
}

export const useWellnessStore = create<WellnessState & WellnessActions>()(
  persist(
    (set, get) => ({
      sleepHours: 7,
      waterCups: 6,
      activityMins: 20,
      mood: 3,

      foodsToday: [],
      dietScore: 5,

      history: [],

      setSleepHours: (v) => set({ sleepHours: clamp(v, 0, 12) }),
      setWaterCups: (v) => set({ waterCups: clamp(v, 0, 12) }),
      setActivityMins: (v) => set({ activityMins: clamp(v, 0, 180) }),
      setMood: (v) => set({ mood: clamp(v, 1, 5) }),

      addFood: (text, cat) =>
        set((s) => {
          const foodsToday = [
            ...s.foodsToday,
            { id: uid(), text: text.trim(), cat, ts: Date.now() },
          ];
          return { foodsToday, dietScore: scoreFromFoods(foodsToday) };
        }),

      removeFood: (id) =>
        set((s) => {
          const foodsToday = s.foodsToday.filter((f) => f.id !== id);
          return { foodsToday, dietScore: scoreFromFoods(s.foodsToday) };
        }),

      clearFoodsToday: () => set({ foodsToday: [], dietScore: 5 }),

      recomputeDietScore: () =>
        set((s) => ({ dietScore: scoreFromFoods(s.foodsToday) })),

      addSnapshot: (snap) =>
        set((s) => {
          const base: Snap = {
            id: uid(),
            ts: Date.now(),
            sleepHours: s.sleepHours,
            waterCups: s.waterCups,
            activityMins: s.activityMins,
            mood: s.mood,
            dietScore: s.dietScore,
          };

          const merged: Snap = { ...base, ...snap, id: base.id, ts: base.ts };
          const history = [...s.history, merged].slice(-14); // keep last 14 entries
          return { history };
        }),

      saveTodayToHistory: () => {
        get().addSnapshot();
      },
    }),
    {
      name: "nutrabuddy-wellness",
      partialize: (s) => ({
        sleepHours: s.sleepHours,
        waterCups: s.waterCups,
        activityMins: s.activityMins,
        mood: s.mood,
        foodsToday: s.foodsToday,
        dietScore: s.dietScore,
        history: s.history,
      }),
    }
  )
);
