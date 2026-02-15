"use client";

import { useEffect } from "react";
import { useWellnessStore } from "@/store/wellnessStore";

export function DarkModeSync() {
  const darkMode = useWellnessStore((s) => s.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return null;
}
