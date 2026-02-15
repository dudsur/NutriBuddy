"use client";

import { useEffect } from "react";
import { useWellnessStore } from "@/store/wellnessStore";

const TEXT_SIZE_CLASSES = ["text-size-small", "text-size-medium", "text-size-large"] as const;

export function DarkModeSync() {
  const darkMode = useWellnessStore((s) => s.darkMode);
  const textSize = useWellnessStore((s) => s.textSize);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    TEXT_SIZE_CLASSES.forEach((c) => root.classList.remove(c));
    root.classList.add(`text-size-${textSize}`);
    const sizePx = textSize === "small" ? "8px" : textSize === "large" ? "20.8px" : "16px";
    root.style.fontSize = sizePx;
  }, [textSize]);

  return null;
}
