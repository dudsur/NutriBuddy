"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWellnessStore } from "@/store/wellnessStore";

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
  const waterCups = useWellnessStore((s) => s.waterCups);
  const activityMins = useWellnessStore((s) => s.activityMins);
  const mood = useWellnessStore((s) => s.mood);
  const dietScore = useWellnessStore((s) => s.dietScore);

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

  const coachAvatar = useMemo(() => {
    if (sleepHours <= 5) return "/avatars/human1/sleep-deprived.png";
    if (waterCups <= 3) return "/avatars/human1/dehydrated.png";
    if (dietScore <= 3) return "/avatars/human1/overindulging.png";
    if (activityMins >= 90) return "/avatars/human1/consistent-exercise.png";
    if (waterCups >= 8) return "/avatars/human1/fully-hydrated.png";
    return "/avatars/human1/mindful-calm.png";
  }, [sleepHours, waterCups, activityMins, dietScore]);

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
          waterCups,
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
              <button
                type="button"
                onClick={() => setInput("I feel tired")}
                className="w-10 h-10 rounded-2xl bg-[#F4F7F5] dark:bg-zinc-700 border border-black/5 dark:border-white/10 flex items-center justify-center"
              >
                😴
              </button>
              <button
                type="button"
                onClick={() => setInput("What should I eat today?")}
                className="w-10 h-10 rounded-2xl bg-[#F4F7F5] dark:bg-zinc-700 border border-black/5 dark:border-white/10 flex items-center justify-center"
              >
                🍽️
              </button>
              <button
                type="button"
                onClick={() => setInput("How do I improve my energy?")}
                className="w-10 h-10 rounded-2xl bg-[#F4F7F5] dark:bg-zinc-700 border border-black/5 dark:border-white/10 flex items-center justify-center"
              >
                ⚡
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What are you feeling?"
                className="flex-1 bg-transparent outline-none text-sm text-black dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 px-2 min-w-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <button
                type="button"
                onClick={send}
                disabled={loading}
                className="px-4 py-2 rounded-2xl bg-[#4F7C6D] text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
