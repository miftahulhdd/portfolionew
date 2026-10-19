"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/db";
import SmartImage from "./SmartImage";

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close, step]);

  if (!items.length) return <p className="card p-8 text-center text-muted">Foto akan segera ditambahkan.</p>;
  const cur = open !== null ? items[open] : null;

  return (
    <>
      <div className="columns-2 gap-3 md:columns-3 md:gap-4">
        {items.map((g, i) => (
          <button key={g.id} onClick={() => setOpen(i)} className="group relative mb-3 block w-full overflow-hidden rounded-xl border border-line bg-surface-2 md:mb-4" style={{ aspectRatio: `${g.width} / ${g.height}` }} aria-label={g.caption || `Foto ${i + 1}`}>
            <SmartImage src={g.url} alt={g.caption} sizes="(max-width:768px) 50vw, 380px" className="transition duration-500 group-hover:scale-105" />
            {g.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-left text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">{g.caption}</span>
            )}
          </button>
        ))}
      </div>

      {cur && (
        <div role="dialog" aria-modal="true" aria-label="Pratinjau foto" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <button onClick={close} aria-label="Tutup" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="size-5" /></button>
          {items.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Sebelumnya" className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="size-5" /></button>
              <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Berikutnya" className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="size-5" /></button>
            </>
          )}
          <figure className="max-h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            {/* foto penuh (resolusi tertinggi) hanya dimuat saat dibuka */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={cur.id} src={cur.url} alt={cur.caption} className="max-h-[82vh] w-auto rounded-lg object-contain" />
            {cur.caption && <figcaption className="mt-3 text-center text-sm text-white/80">{cur.caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}
