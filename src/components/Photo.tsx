import SmartImage from "./SmartImage";

/** Foto dengan fallback inisial jika belum diunggah. */
export default function Photo({ src, alt, initials, className = "", priority = false, sizes = "(max-width: 768px) 90vw, 440px" }: { src?: string | null; alt: string; initials?: string; className?: string; priority?: boolean; sizes?: string }) {
  if (!src) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-brand-soft to-surface-2 font-mono text-6xl font-semibold text-brand ${className}`} aria-label={alt}>
        {initials}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <SmartImage src={src} alt={alt} priority={priority} sizes={sizes} />
    </div>
  );
}
