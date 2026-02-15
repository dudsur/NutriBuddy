"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useWellnessStore, sumMacros, getEffectiveTargets } from "@/store/wellnessStore";
import { getAvatarPathByLack } from "@/lib/avatarByLack";

type Msg = {
  id: string;
  role: "user" | "coach";
  text: string;
  ts: number;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatPage() {
  const sleepHours = useWellnessStore((s) => s.sleepHours);
  const waterLitres = useWellnessStore((s) => s.waterLitres);
  const activityMins = useWellnessStore((s) => s.activityMins);
  const mood = useWellnessStore((s) => s.mood);
  const dietScore = useWellnessStore((s) => s.dietScore);
  const foodsToday = useWellnessStore((s) => s.foodsToday);
  const goals = useWellnessStore((s) => s.goals);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: uid(),
      role: "coach",
      text: "Hey — I'm your NutraBuddy coach. Tell me what you're feeling today.",
      ts: Date.now(),
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const { caloriesToday, calorieLimit } = useMemo(() => {
    const tot = sumMacros(foodsToday);
    const limit = getEffectiveTargets(goals).calories;
    return { caloriesToday: tot.calories, calorieLimit: limit };
  }, [foodsToday, goals]);

  const coachAvatar = useMemo(
    () =>
      getAvatarPathByLack({
        sleep: sleepHours,
        water: waterLitres,
        activity: activityMins,
        mood,
        diet: dietScore,
        caloriesToday,
        calorieLimit,
      }),
    [sleepHours, waterLitres, activityMins, mood, dietScore, caloriesToday, calorieLimit]
  );

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { id: uid(), role: "user", text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          sleepHours,
          waterLitres,
          activityMins,
          mood,
          dietScore,
        }),
      });

      const data = await res.json();

      const coachMsg: Msg = {
        id: uid(),
        role: "coach",
        text: data.reply || "Something went wrong.",
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "coach",
          text: "Couldn't reach the coach. Make sure the app is running (npm run dev) and open http://localhost:3000, then try again.",
          ts: Date.now(),
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-[#F4F7F5] dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-[420px] flex flex-col flex-1 min-h-0 px-5 pt-6 pb-24">
        {/* Coach Header */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-4 shadow-sm border border-black/5 dark:border-white/10 flex items-center gap-4 flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#E3EFE8] dark:bg-zinc-700 border border-black/5 dark:border-white/10">
            <img
              src={coachAvatar}
              alt="coach avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
              NutraBuddy Coach
            </p>
            <p className="text-lg font-extrabold text-black dark:text-zinc-100 leading-tight">
              Ask me anything
            </p>
          </div>
        </div>

        {/* Messages - scrollable */}
        <div
          ref={listRef}
          className="flex-1 mt-5 space-y-3 overflow-y-auto pr-1 min-h-0 pb-2"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#4F7C6D] text-white rounded-br-xl"
                    : "bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 rounded-bl-xl shadow-sm border border-black/5 dark:border-white/10"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat input bar - fixed just above the plus so the plus stays visible */}
        <div className="fixed left-0 right-0 bottom-[72px] z-[9999] flex justify-center px-5">
          <div className="w-full max-w-[420px]">
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-3 shadow-lg border border-black/5 dark:border-white/10 flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() => setInput("I feel tired")}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-10 h-10 rounded-2xl bg-[#F4F7F5] dark:bg-zinc-700 border border-black/5 dark:border-white/10 flex items-center justify-center select-none touch-manipulation"
              >
                😴
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setInput("What should I eat today?")}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-10 h-10 rounded-2xl bg-[#F4F7F5] dark:bg-zinc-700 border border-black/5 dark:border-white/10 flex items-center justify-center select-none touch-manipulation"
              >
                🍽️
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setInput("How do I improve my energy?")}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-10 h-10 rounded-2xl bg-[#F4F7F5] dark:bg-zinc-700 border border-black/5 dark:border-white/10 flex items-center justify-center select-none touch-manipulation"
              >
                ⚡
              </motion.button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What are you feeling?"
                className="flex-1 bg-transparent outline-none text-sm text-black dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 px-2 min-w-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <motion.button
                type="button"
                onClick={send}
                disabled={loading}
                initial={{ boxShadow: "0 2px 8px rgba(79, 124, 109, 0.25)" }}
                whileTap={loading ? undefined : { scale: 0.92, boxShadow: "0 6px 22px rgba(79, 124, 109, 0.55)" }}
                whileHover={loading ? undefined : { scale: 1.02, boxShadow: "0 4px 16px rgba(79, 124, 109, 0.35)" }}
                transition={{
                  scale: { type: "spring", stiffness: 500, damping: 28 },
                  boxShadow: { duration: 0.18 },
                }}
                className="px-4 py-2 rounded-2xl bg-[#4F7C6D] text-white text-sm font-semibold disabled:opacity-50 min-w-[4rem] h-9 flex items-center justify-center select-none touch-manipulation cursor-pointer"
              >
                {loading ? (
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                    aria-hidden
                  />
                ) : (
                  "Send"
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
