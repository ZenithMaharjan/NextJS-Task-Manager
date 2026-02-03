"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";

export default function ThemeToggler() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const isLight = useMemo(() => theme === "light", [theme]);
  const nextThemeLabel = useMemo(() => (isLight ? "dark" : "light"), [isLight]);
  const buttonTitle = useMemo(() => `Switch to ${nextThemeLabel} mode`, [nextThemeLabel]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 shadow-sm flex items-center justify-center"
      aria-label="Toggle Theme"
      title={buttonTitle}
    >
      {isLight ? (
        <Moon className="w-5 h-5 transition-all duration-300 rotate-0 scale-100" />
      ) : (
        <Sun className="w-5 h-5 transition-all duration-300 rotate-0 scale-100 text-yellow-300" />
      )}
    </button>
  );
}
