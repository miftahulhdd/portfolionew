"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#portfolio", label: "Portfolio" },
  { href: "/#report", label: "Report" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar({ handle }: { handle: string }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          {handle}<span className="text-brand">_</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink">
              {l.label}
            </Link>
          ))}
          <div className="ml-2"><ThemeToggle /></div>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open} className="grid size-9 place-items-center rounded-full border border-line bg-surface">
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-bg px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-surface-2">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
