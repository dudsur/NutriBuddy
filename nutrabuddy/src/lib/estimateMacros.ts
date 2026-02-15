import type { Macros } from "@/store/wellnessStore";

/** Rough estimates for common foods (per typical serving) when API is unavailable. */
const COMMON_FOODS: Record<string, Macros> = {
  oatmeal: { calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, vitaminC: 0, iron: 1.4, calcium: 20, sodium: 0 },
  oat: { calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, vitaminC: 0, iron: 1.4, calcium: 20, sodium: 0 },
  apple: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, vitaminC: 8, iron: 0.2, calcium: 11, sodium: 2 },
  chicken: { calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, vitaminC: 0, iron: 1, calcium: 15, sodium: 74 },
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, vitaminC: 0, iron: 1, calcium: 15, sodium: 74 },
  eggs: { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, vitaminC: 0, iron: 1.2, calcium: 56, sodium: 124 },
  egg: { calories: 78, protein: 6, carbs: 0.5, fat: 5.5, fiber: 0, vitaminC: 0, iron: 0.6, calcium: 28, sodium: 62 },
  salad: { calories: 35, protein: 2, carbs: 5, fat: 1, fiber: 2, vitaminC: 15, iron: 0.5, calcium: 30, sodium: 25 },
  banana: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3, vitaminC: 10, iron: 0.3, calcium: 6, sodium: 1 },
  rice: { calories: 205, protein: 4.2, carbs: 45, fat: 0.4, fiber: 0.6, vitaminC: 0, iron: 0.2, calcium: 16, sodium: 1 },
  pasta: { calories: 220, protein: 8, carbs: 43, fat: 1, fiber: 2.5, vitaminC: 0, iron: 1.3, calcium: 10, sodium: 1 },
  bread: { calories: 79, protein: 2.6, carbs: 15, fat: 1, fiber: 0.8, vitaminC: 0, iron: 0.8, calcium: 30, sodium: 170 },
  yogurt: { calories: 100, protein: 6, carbs: 12, fat: 3, fiber: 0, vitaminC: 0.5, iron: 0.1, calcium: 120, sodium: 40 },
  milk: { calories: 103, protein: 8, carbs: 12, fat: 2.4, fiber: 0, vitaminC: 0, iron: 0.1, calcium: 300, sodium: 43 },
  broccoli: { calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5, vitaminC: 90, iron: 1, calcium: 62, sodium: 55 },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, vitaminC: 0, iron: 0.5, calcium: 9, sodium: 59 },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, vitaminC: 0, iron: 2.6, calcium: 18, sodium: 72 },
  cheese: { calories: 113, protein: 7, carbs: 0.4, fat: 9, fiber: 0, vitaminC: 0, iron: 0.1, calcium: 200, sodium: 178 },
  "peanut butter": { calories: 188, protein: 8, carbs: 7, fat: 16, fiber: 2, vitaminC: 0, iron: 0.6, calcium: 15, sodium: 140 },
  nuts: { calories: 173, protein: 5, carbs: 6, fat: 16, fiber: 2, vitaminC: 0, iron: 0.8, calcium: 24, sodium: 0 },
  avocado: { calories: 240, protein: 3, carbs: 13, fat: 22, fiber: 10, vitaminC: 15, iron: 1, calcium: 18, sodium: 11 },
  donut: { calories: 250, protein: 4, carbs: 31, fat: 13, fiber: 1, vitaminC: 0, iron: 1.2, calcium: 30, sodium: 230 },
  pizza: { calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2.5, vitaminC: 0, iron: 2.3, calcium: 180, sodium: 640 },
  sandwich: { calories: 350, protein: 15, carbs: 40, fat: 14, fiber: 2, vitaminC: 2, iron: 2.5, calcium: 100, sodium: 800 },
};

const DEFAULT_MACROS: Macros = {
  calories: 120,
  protein: 5,
  carbs: 15,
  fat: 4,
  fiber: 2,
  vitaminC: 5,
  iron: 0.5,
  calcium: 30,
  sodium: 50,
};

/**
 * Returns estimated macros for a food name when API lookup fails.
 * Used so Today's progress still updates without API keys.
 */
export function estimateMacros(foodName: string): Macros {
  const key = foodName.toLowerCase().trim();
  const exact = COMMON_FOODS[key];
  if (exact) return { ...exact };

  for (const [name, macros] of Object.entries(COMMON_FOODS)) {
    if (key.includes(name) || name.includes(key)) return { ...macros };
  }
  return { ...DEFAULT_MACROS };
}
