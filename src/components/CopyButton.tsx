"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {}
      }}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition hover:bg-surface-2 hover:text-ink"
      aria-label="Salin kode"
    >
      {done ? <><Check className="size-3.5" /> Tersalin</> : <><Copy className="size-3.5" /> Salin</>}
    </button>
  );
}
