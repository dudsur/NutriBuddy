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

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitaminC: number;
  iron: number;
  calcium: number;
  sodium: number;
};

export type FoodItem = {
  id: string;
  text: string;
  cat: FoodCategory;
  ts: number;
  macros?: Macros;
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

  // User-set daily goals (Profile). Merged with DAILY_TARGETS for upper limits.
  goals: Partial<Macros>;

  // Trends
  history: Snap[];

  darkMode: boolean;
};

type WellnessActions = {
  setSleepHours: (v: number) => void;
  setWaterCups: (v: number) => void;
  setActivityMins: (v: number) => void;
  setMood: (v: number) => void;

  addFood: (text: string, cat: FoodCategory) => string;
  updateFoodMacros: (id: string, macros: Macros) => void;
  removeFood: (id: string) => void;

  recomputeDietScore: () => void;

  addSnapshot: (snap?: Partial<Snap>) => void;
  saveTodayToHistory: () => void;
  clearFoodsToday: () => void;

  setGoal: (key: keyof Macros, value: number) => void;
  setGoals: (partial: Partial<Macros>) => void;
  resetGoals: () => void;

  setDarkMode: (v: boolean) => void;
};

/** Daily targets (typical RDI). */
export const DAILY_TARGETS: Macros = {
  calories: 2000,
  protein: 50,
  carbs: 300,
  fat: 65,
  fiber: 28,
  vitaminC: 90,
  iron: 18,
  calcium: 1000,
  sodium: 2300,
};

export function sumMacros(foods: FoodItem[]): Macros {
  const out: Macros = {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
    vitaminC: 0, iron: 0, calcium: 0, sodium: 0,
  };
  for (const f of foods) {
    if (f.macros) {
      out.calories += f.macros.calories;
      out.protein += f.macros.protein;
      out.carbs += f.macros.carbs;
      out.fat += f.macros.fat;
      out.fiber += f.macros.fiber ?? 0;
      out.vitaminC += f.macros.vitaminC;
      out.iron += f.macros.iron;
      out.calcium += f.macros.calcium ?? 0;
      out.sodium += f.macros.sodium ?? 0;
    }
  }
  return out;
}

/** Merge user goals with defaults. Used as upper limits in Today's progress. */
export function getEffectiveTargets(goals: Partial<Macros> | undefined): Macros {
  if (!goals || Object.keys(goals).length === 0) return { ...DAILY_TARGETS };
  return {
    calories: goals.calories ?? DAILY_TARGETS.calories,
    protein: goals.protein ?? DAILY_TARGETS.protein,
    carbs: goals.carbs ?? DAILY_TARGETS.carbs,
    fat: goals.fat ?? DAILY_TARGETS.fat,
    fiber: goals.fiber ?? DAILY_TARGETS.fiber,
    vitaminC: goals.vitaminC ?? DAILY_TARGETS.vitaminC,
    iron: goals.iron ?? DAILY_TARGETS.iron,
    calcium: goals.calcium ?? DAILY_TARGETS.calcium,
    sodium: goals.sodium ?? DAILY_TARGETS.sodium,
  };
}

/** What's still needed to meet targets (only positive values). */
export function getMacroGaps(totals: Macros, targets: Macros = DAILY_TARGETS): Macros {
  return {
    calories: Math.max(0, targets.calories - totals.calories),
    protein: Math.max(0, targets.protein - totals.protein),
    carbs: Math.max(0, targets.carbs - totals.carbs),
    fat: Math.max(0, targets.fat - totals.fat),
    fiber: Math.max(0, targets.fiber - (totals.fiber ?? 0)),
    vitaminC: Math.max(0, targets.vitaminC - totals.vitaminC),
    iron: Math.max(0, targets.iron - totals.iron),
    calcium: Math.max(0, targets.calcium - (totals.calcium ?? 0)),
    sodium: Math.max(0, targets.sodium - (totals.sodium ?? 0)),
  };
}

/** Number of daily goals met (at or over target). Sodium excluded (upper limit). */
export function goalsMetCount(totals: Macros, targets: Macros = DAILY_TARGETS): number {
  let n = 0;
  if (totals.calories >= targets.calories) n++;
  if (totals.protein >= targets.protein) n++;
  if (totals.carbs >= targets.carbs) n++;
  if (totals.fat >= targets.fat) n++;
  if ((totals.fiber ?? 0) >= targets.fiber) n++;
  if (totals.vitaminC >= targets.vitaminC) n++;
  if (totals.iron >= targets.iron) n++;
  if ((totals.calcium ?? 0) >= targets.calcium) n++;
  return n;
}

export const GOAL_KEYS = ["calories", "protein", "carbs", "fat", "fiber", "vitaminC", "iron", "calcium"] as const;

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

      goals: {},

      history: [],

      darkMode: false,

      setDarkMode: (v) => set({ darkMode: !!v }),

      setGoal: (key, value) =>
        set((s) => ({
          goals: { ...s.goals, [key]: Math.max(0, Number(value) || 0) },
        })),
      setGoals: (partial) =>
        set((s) => ({
          goals: { ...s.goals, ...partial },
        })),
      resetGoals: () => set({ goals: {} }),

      setSleepHours: (v) => set({ sleepHours: clamp(v, 0, 12) }),
      setWaterCups: (v) => set({ waterCups: clamp(v, 0, 12) }),
      setActivityMins: (v) => set({ activityMins: clamp(v, 0, 180) }),
      setMood: (v) => set({ mood: clamp(v, 1, 5) }),

      addFood: (text, cat) => {
        const id = uid();
        set((s) => {
          const foodsToday = [
            ...s.foodsToday,
            { id, text: text.trim(), cat, ts: Date.now() },
          ];
          return { foodsToday, dietScore: scoreFromFoods(foodsToday) };
        });
        return id;
      },

      updateFoodMacros: (id, macros) =>
        set((s) => ({
          foodsToday: s.foodsToday.map((f) =>
            f.id === id ? { ...f, macros } : f
          ),
        })),

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

      saveTodayToHistory: () =>
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
          const history = [...s.history, base].slice(-14);
          return { history };
        }),
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
        goals: s.goals,
        history: s.history,
        darkMode: s.darkMode,
      }),
    }
  )
);
