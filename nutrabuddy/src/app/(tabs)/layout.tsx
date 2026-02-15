"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { motion } from "framer-motion";

const TAB_ORDER: Record<string, number> = {
  "/overview": 0,
  "/trends": 1,
  "/input": 2,
  "/chat": 3,
  "/profile": 4,
};

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition",
        active ? "text-[#4F7C6D]" : "text-zinc-400 hover:text-zinc-600",
      ].join(" ")}
    >
      <span className="h-5 w-5">{icon}</span>
      <span className={["text-xs font-medium", active ? "font-semibold" : ""].join(" ")}>
        {label}
      </span>
    </Link>
  );
}

function IconOverview({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={active ? "" : ""}>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrends() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 16l4-4 3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M20 8V5h-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.3-3.9A8 8 0 1 1 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 12h8M8 9h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function TabsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const tabIndex = TAB_ORDER[pathname] ?? 0;
  const prevIndex =
    prevPathRef.current === null ? tabIndex : (TAB_ORDER[prevPathRef.current] ?? 0);
  const direction = prevPathRef.current === null ? 0 : Math.sign(tabIndex - prevIndex);
  if (prevPathRef.current !== pathname) prevPathRef.current = pathname;

  return (
    <main className="min-h-screen bg-[#F4F7F5] dark:bg-zinc-900 flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-white dark:bg-zinc-900 shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-[#4F7C6D] dark:bg-[#3d6154] text-white text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">NutraBuddy</h1>
          <p className="text-sm opacity-90 mt-1">Your Wellness Companion</p>
        </div>

        {/* Body: slide transition when switching tabs */}
        <div className="flex-1 overflow-hidden relative bg-[#F4F7F5] dark:bg-zinc-900">
          <motion.div
            key={pathname}
            className="w-full min-h-full"
            initial={{
              x: direction === 0 ? 0 : direction > 0 ? "100%" : "-100%",
            }}
            animate={{ x: 0 }}
            transition={{
              type: "tween",
              duration: 0.28,
              ease: [0.32, 0.72, 0, 1],
            }}
          >
            {children}
          </motion.div>
        </div>

        {/* Bottom Nav: plus in center, 2 tabs each side */}
        <div className="sticky bottom-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-t border-black/10 dark:border-white/10">
          <div className="mx-auto w-full max-w-[420px] px-2 pb-3 pt-3">
            <nav className="grid grid-cols-5 items-end gap-0">
              <NavLink href="/overview" label="Overview" icon={<IconOverview active={pathname === "/overview"} />} active={pathname === "/overview"} />
              <NavLink href="/trends" label="Trends" icon={<IconTrends />} active={pathname === "/trends"} />
              <div className="flex justify-center items-center pt-2">
                <Link
                  href="/input"
                  className="h-14 w-14 rounded-full bg-[#4F7C6D] text-white shadow-lg flex items-center justify-center text-2xl font-light -mb-1 hover:opacity-90 transition"
                  aria-label="Log"
                >
                  +
                </Link>
              </div>
              <NavLink href="/chat" label="Chat" icon={<IconChat />} active={pathname === "/chat"} />
              <NavLink href="/profile" label="Profile" icon={<IconProfile />} active={pathname === "/profile"} />
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}