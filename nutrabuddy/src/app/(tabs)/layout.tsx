import type { ReactNode } from "react";
import Link from "next/link";

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
  // Premium layout note:
  // Only ONE header should exist here.
  // Do NOT recreate the header inside individual pages.
  return (
    <main className="min-h-screen bg-[#F4F7F5] flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-[#4F7C6D] text-white text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">NutraBuddy</h1>
          <p className="text-sm opacity-90 mt-1">Your Wellness Companion</p>
        </div>

        {/* Body */}
        <div className="flex-1 bg-[#F4F7F5]">{children}</div>

        {/* Bottom Nav */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-black/10">
          <div className="relative mx-auto w-full max-w-[420px] px-4 pb-4 pt-3">
            {/* Floating + */}
            <Link
              href="/input"
              className="absolute left-1/2 -translate-x-1/2 -top-7
                         h-14 w-14 rounded-full bg-[#4F7C6D] text-white
                         shadow-lg flex items-center justify-center text-2xl
                         ring-8 ring-white"
              aria-label="Log"
            >
              +
            </Link>

            <nav className="grid grid-cols-4 gap-2">
              <NavLink href="/overview" label="Overview" icon={<IconOverview active />} />
              <NavLink href="/trends" label="Trends" icon={<IconTrends />} />
              <NavLink href="/chat" label="Chat" icon={<IconChat />} />
              <NavLink href="/profile" label="Profile" icon={<IconProfile />} />
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}