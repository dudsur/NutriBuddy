/**
 * Picks avatar based on what's lacking the most (biggest gap to a simple target).
 * Returns the avatar that represents the area needing the most attention.
 */

export type AvatarKey =
  | "well-rested"
  | "sleep-deprived"
  | "balanced-diet"
  | "overindulging"
  | "consistent-exercise"
  | "sedentary"
  | "fully-hydrated"
  | "dehydrated"
  | "mindful-calm";

const AVATAR_PATHS: Record<AvatarKey, string> = {
  "well-rested": "/avatars/human1/well-rested.png",
  "sleep-deprived": "/avatars/human1/sleep-deprived.png",
  "balanced-diet": "/avatars/human1/balanced-diet.png",
  "overindulging": "/avatars/human1/overindulging.png",
  "consistent-exercise": "/avatars/human1/consistent-exercise.png",
  sedentary: "/avatars/human1/sedentary.png",
  "fully-hydrated": "/avatars/human1/fully-hydrated.png",
  dehydrated: "/avatars/human1/dehydrated.png",
  "mindful-calm": "/avatars/human1/mindful-calm.png",
};

/** Targets: sleep >= 7h, hydration >= 3 L, activity >= 30 min. Mood and diet ignored. */
const TARGETS = {
  sleep: 7,
  waterLitres: 3,
  activity: 30,
} as const;

function lackScore(value: number, target: number, maxPossibleLack: number): number {
  const lack = Math.max(0, target - value);
  return maxPossibleLack > 0 ? (lack / maxPossibleLack) * 10 : 0;
}

/**
 * Returns the avatar key for the area that is lacking the most.
 * - If calorie intake > user's calorie limit → "overindulging".
 * - Else considers sleep, hydration, activity; if nothing is lacking → "mindful-calm".
 */
export function getAvatarKeyByLack(params: {
  sleep: number;
  water: number;
  activity: number;
  mood?: number;
  diet?: number;
  /** Today's total calories from food log. */
  caloriesToday?: number;
  /** User-set daily calorie limit (from Profile goals). */
  calorieLimit?: number;
}): AvatarKey {
  const { sleep, water, activity, caloriesToday, calorieLimit } = params;

  if (
    calorieLimit != null &&
    calorieLimit > 0 &&
    caloriesToday != null &&
    caloriesToday > calorieLimit
  ) {
    return "overindulging";
  }

  const sleepLack = lackScore(sleep, TARGETS.sleep, TARGETS.sleep);
  const waterLack = lackScore(water, TARGETS.waterLitres, TARGETS.waterLitres);
  const activityLack = lackScore(activity, TARGETS.activity, TARGETS.activity);

  const maxLack = Math.max(sleepLack, waterLack, activityLack);
  if (maxLack <= 0) return "mindful-calm";

  if (maxLack === sleepLack) return "sleep-deprived";
  if (maxLack === waterLack) return "dehydrated";
  if (maxLack === activityLack) return "sedentary";

  return "mindful-calm";
}

export function getAvatarPathByLack(params: {
  sleep: number;
  water: number;
  activity: number;
  mood?: number;
  diet?: number;
  caloriesToday?: number;
  calorieLimit?: number;
}): string {
  return AVATAR_PATHS[getAvatarKeyByLack(params)];
}

export { AVATAR_PATHS };
