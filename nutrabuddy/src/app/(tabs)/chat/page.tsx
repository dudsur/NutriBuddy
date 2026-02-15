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
      text: "Hey — I’m your NutraBuddy coach. Tell me what you’re feeling today.",
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
          text: "Error connecting to coach.",
          ts: Date.now(),
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-[#F4F7F5]">
      <div className="mx-auto w-full max-w-[420px] flex flex-col flex-1 px-5 pt-6 pb-24">
        
        {/* Coach Header */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-black/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#E3EFE8] border border-black/5">
            <img
              src={coachAvatar}
              alt="coach avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">
              NutraBuddy Coach
            </p>
            <p className="text-lg font-extrabold text-black leading-tight">
              Ask me anything
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="flex-1 mt-5 space-y-3 overflow-y-auto pr-1"
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
                    : "bg-white text-black rounded-bl-xl shadow-sm border border-black/5"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Input */}
      <div className="fixed bottom-[72px] left-0 right-0">
        <div className="mx-auto w-full max-w-[420px] px-5">
          <div className="bg-white rounded-3xl p-3 shadow-sm border border-black/5 flex items-center gap-2">

            {/* Quick Icons */}
            <button
              type="button"
              onClick={() => setInput("I feel tired")}
              className="w-10 h-10 rounded-2xl bg-[#F4F7F5] border border-black/5 flex items-center justify-center"
            >
              😴
            </button>

            <button
              type="button"
              onClick={() => setInput("What should I eat today?")}
              className="w-10 h-10 rounded-2xl bg-[#F4F7F5] border border-black/5 flex items-center justify-center"
            >
              🍽️
            </button>

            <button
              type="button"
              onClick={() => setInput("How do I improve my energy?")}
              className="w-10 h-10 rounded-2xl bg-[#F4F7F5] border border-black/5 flex items-center justify-center"
            >
              ⚡
            </button>

            {/* Input */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are you feeling?"
              className="flex-1 bg-transparent outline-none text-sm text-black placeholder:text-gray-400 px-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />

            {/* Send Button */}
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
  );
}