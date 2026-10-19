"use client";
import { useEffect, useRef, useState } from "react";
import { isResponsive, srcSetFor, variantUrl } from "@/lib/images";

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  /** true: gambar mengisi wadah induk (induk harus relative + punya ukuran). false: mengalir natural (lebar penuh). */
  fill?: boolean;
  className?: string;
};

/** Gambar responsif (srcset) dengan skeleton shimmer lalu fade-in saat selesai dimuat. */
export default function SmartImage({ src, alt, sizes = "100vw", priority = false, fill = true, className = "" }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={isResponsive(src) ? variantUrl(src, 960) : src}
      srcSet={srcSetFor(src)}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`${fill ? "absolute inset-0 size-full object-cover" : "block h-auto w-full"} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );

  if (failed) return <div className={fill ? "absolute inset-0 bg-surface-2" : "aspect-video w-full bg-surface-2"} role="img" aria-label={alt} />;

  if (fill) return <><span aria-hidden className={`skeleton absolute inset-0 !rounded-none transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`} />{img}</>;

  return (
    <div className={`relative overflow-hidden ${loaded ? "" : "skeleton min-h-40"}`}>
      {img}
    </div>
  );
}
