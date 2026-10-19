import type { TimelineItem } from "@/db";

/** Daftar ringkas dua kolom (urut turun per kolom), 01, 02, ... */
export default function Timeline({ items }: { items: TimelineItem[] }) {
  if (!items.length) return null;
  const rows = Math.ceil(items.length / 2);
  return (
    <div>
      <h3 className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted">Organisasi &amp; Kepanitiaan</h3>
      <ol
        className="grid gap-x-14 md:grid-flow-col md:grid-cols-2 md:[grid-template-rows:repeat(var(--rows),auto)]"
        style={{ "--rows": rows } as React.CSSProperties}
      >
        {items.map((t, i) => {
          const colEnd = (i + 1) % rows === 0 || i === items.length - 1;
          return (
            <li key={t.id} className={`grid grid-cols-[1.75rem_6.5rem_1fr] items-baseline gap-x-3 border-t border-line py-3.5 sm:grid-cols-[2rem_9.5rem_1fr] ${i === items.length - 1 ? "border-b" : ""} ${colEnd ? "md:border-b" : ""}`}>
              <span className="font-mono text-xs text-muted/60">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-xs text-muted sm:text-sm">{t.period}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{t.role}</p>
                <p className="text-xs text-muted">{t.organization}</p>
                {t.description && <p className="mt-1 text-xs text-muted/80">{t.description}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
