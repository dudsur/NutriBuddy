"use client";

import { useWellnessStore } from "@/store/wellnessStore";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

type AvatarKey =
  | "well-rested"
  | "sleep-deprived"
  | "balanced-diet"
  | "overindulging"
  | "consistent-exercise"
  | "sedentary"
  | "fully-hydrated"
  | "dehydrated"
  | "mindful-calm";

function determineAvatar({
  sleep,
  water,
  activity,
  mood,
  diet,
}: {
  sleep: number;
  water: number;
  activity: number;
  mood: number;
  diet: number;
}): AvatarKey {
  // Priority order: strongest signals first
  if (sleep <= 5) return "sleep-deprived";
  if (sleep >= 7.5) return "well-rested";

  if (water <= 3) return "dehydrated";
  if (water >= 8) return "fully-hydrated";

  if (activity <= 10) return "sedentary";
  if (activity >= 90) return "consistent-exercise";

  if (diet <= 3) return "overindulging";
  if (diet >= 8) return "balanced-diet";

  if (mood >= 4) return "mindful-calm";

  return "well-rested";
}

function copyForAvatar(a: AvatarKey) {
  switch (a) {
    case "well-rested":
      return { title: "Well Rested", desc: "Nice — your recovery looks solid today." };
    case "sleep-deprived":
      return { title: "Sleep Deprived", desc: "Try a slightly earlier night — it’ll help fast." };
    case "fully-hydrated":
      return { title: "Fully Hydrated", desc: "Great — hydration is supporting your energy." };
    case "dehydrated":
      return { title: "Dehydrated", desc: "Drink a couple cups soon — quick win." };
    case "consistent-exercise":
      return { title: "Consistent Exercise", desc: "Momentum is strong — keep it steady." };
    case "sedentary":
      return { title: "Sedentary", desc: "A short walk can instantly improve your day." };
    case "balanced-diet":
      return { title: "Balanced Diet", desc: "Good choices — your meals look on track." };
    case "overindulging":
      return { title: "Overindulging", desc: "No stress — small swaps can turn it around fast." };
    case "mindful-calm":
      return { title: "Mindful & Calm", desc: "Your mood looks steady — protect that calm." };
  }
}

const avatarMap: Record<AvatarKey, string> = {
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

export default function OverviewPage() {
  const sleepHours = useWellnessStore((s) => s.sleepHours);
  const waterCups = useWellnessStore((s) => s.waterCups);
  const activityMins = useWellnessStore((s) => s.activityMins);
  const mood = useWellnessStore((s) => s.mood);
  const dietScore = useWellnessStore((s) => s.dietScore);

  const avatarKey = useMemo(() => {
    return determineAvatar({
      sleep: sleepHours,
      water: waterCups,
      activity: activityMins,
      mood,
      diet: dietScore,
    });
  }, [sleepHours, waterCups, activityMins, mood, dietScore]);

  const moodCopy = copyForAvatar(avatarKey);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5]">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        {/* Mood card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[#E3EFE8] shadow-sm border border-black/5">
              <AnimatePresence mode="wait">
                <motion.img
                  key={avatarKey}
                  src={avatarMap[avatarKey]}
                  alt={avatarKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">NutraBuddy mood</p>
              <h2 className="text-3xl font-extrabold leading-tight text-black">
                {moodCopy.title}
              </h2>
              <p className="text-gray-600 mt-1">{moodCopy.desc}</p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F4F7F5] rounded-3xl p-5 shadow-sm border border-black/5">
            <p className="text-sm text-gray-500">Sleep</p>
            <p className="text-4xl font-extrabold text-black mt-2">
              {Math.round(sleepHours)}h
            </p>
          </div>

          <div className="bg-[#F4F7F5] rounded-3xl p-5 shadow-sm border border-black/5">
            <p className="text-sm text-gray-500">Hydration</p>
            <p className="text-4xl font-extrabold text-black mt-2">
              {waterCups} <span className="font-extrabold">cups</span>
            </p>
          </div>
        </div>

        {/* Optional quick debug badge (delete later) */}
      
      </div>
    </div>
  );
}