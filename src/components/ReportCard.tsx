import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Report } from "@/db";
import { formatDate } from "@/lib/utils";
import Reveal from "./Reveal";
import SmartImage from "./SmartImage";

export default function ReportCard({ r, delay = 0 }: { r: Report; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link href={`/reports/${r.slug}`} className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-brand">
        <div className="relative aspect-[16/8] bg-gradient-to-br from-brand-soft to-surface-2">
          {r.coverUrl ? (
            <SmartImage src={r.coverUrl} alt="" sizes="(max-width:768px) 100vw, 380px" />
          ) : (
            <span className="absolute bottom-3 left-4 font-mono text-4xl font-semibold text-brand/40">
              {r.number != null ? String(r.number).padStart(2, "0") : "#"}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="badge">{r.course}</span>
            <span className="font-mono text-[11px] text-muted">{formatDate(r.createdAt)}</span>
          </div>
          <h3 className="text-lg font-semibold leading-snug">
            {r.number != null && <span className="text-muted">Praktikum {r.number} · </span>}
            {r.title}
          </h3>
          {r.summary && <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{r.summary}</p>}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
            Baca laporan <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
