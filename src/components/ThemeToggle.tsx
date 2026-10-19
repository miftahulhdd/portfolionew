"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  function toggle() {
    const root = document.documentElement;
    root.classList.add("theme-anim"); // aktifkan transisi warna halus
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    setDark(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    window.setTimeout(() => root.classList.remove("theme-anim"), 450);
  }

  // Geometri (px): wadah 60x32, border 1 -> area dalam 58x30. Bulatan 24 -> jarak 3px ke semua sisi.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Mode gelap"
      onClick={toggle}
      className="relative block h-8 w-[3.75rem] shrink-0 rounded-full border border-line bg-surface-2"
    >
      <span className="absolute left-[3px] top-[3px] size-6 rounded-full bg-brand shadow-sm transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] dark:translate-x-7" />
      <span className="absolute left-[3px] top-[3px] grid size-6 place-items-center text-brand-ink transition-colors duration-300 dark:text-muted"><Sun className="size-3.5" /></span>
      <span className="absolute right-[3px] top-[3px] grid size-6 place-items-center text-muted transition-colors duration-300 dark:text-brand-ink"><Moon className="size-3.5" /></span>
    </button>
  );
}
