"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() { return useContext(Ctx); }

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
      {theme === "dark" ? "☀ Light" : "🌙 Dark"}
    </button>
  );
}
