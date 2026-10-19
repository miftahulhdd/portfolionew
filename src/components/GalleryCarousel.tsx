"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryItem } from "@/db";
import SmartImage from "./SmartImage";

const INTERVAL = 5500; // jeda antar foto (ms)
const FADE = 1100; // durasi fade (ms)

/** Carousel foto acak: fade halus, otomatis berganti, panah kiri/kanan (tanpa indikator titik). */
export default function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const n = items.length;
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const startX = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => {
      setPrev(i);
      setI((i + d + n) % n);
    },
    [i, n],
  );

  // setelah fade selesai, foto sebelumnya tak perlu ditahan lagi
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), FADE + 100);
    return () => clearTimeout(t);
  }, [prev, i]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // ganti otomatis; timer diulang setiap kali foto berubah (juga saat diklik manual)
  useEffect(() => {
    if (n < 2 || hover || hidden || reduced) return;
    const t = setTimeout(() => go(1), INTERVAL);
    return () => clearTimeout(t);
  }, [i, n, hover, hidden, reduced, go]);

  if (!n) return <p className="card p-8 text-center text-muted">Foto akan segera ditambahkan.</p>;

  // hanya pasang foto aktif + tetangganya (preload), bukan semuanya
  const mounted = Array.from(new Set([(i - 1 + n) % n, i, (i + 1) % n]));
  const cur = items[i];

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface-2 sm:aspect-[16/9] md:aspect-[21/9]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Galeri foto"
    >
      {mounted.map((idx) => {
        const g = items[idx];
        const visible = idx === i || idx === prev;
        return (
          <div
            key={g.id}
            aria-hidden={idx !== i}
            className="absolute inset-0 ease-in-out"
            style={{ opacity: visible ? 1 : 0, zIndex: idx === i ? 2 : 1, transition: `opacity ${FADE}ms ease-in-out` }}
          >
            <SmartImage src={g.url} alt={g.caption || `Foto ${idx + 1}`} sizes="(max-width: 1152px) 100vw, 1152px" priority={idx === i && i === 0} />
          </div>
        );
      })}

      {cur.caption && (
        <p key={cur.id} className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-12 text-sm font-medium text-white">
          {cur.caption}
        </p>
      )}

      {n > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Foto sebelumnya" className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100">
            <ChevronLeft className="size-5" />
          </button>
          <button onClick={() => go(1)} aria-label="Foto berikutnya" className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100">
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
