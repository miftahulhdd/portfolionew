"use client";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/db";
import { GithubIcon } from "./icons";
import Reveal from "./Reveal";
import SmartImage from "./SmartImage";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const cats = useMemo(() => ["Semua", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const [active, setActive] = useState("Semua");
  const list = active === "Semua" ? projects : projects.filter((p) => p.category === active);

  if (projects.length === 0) return <Reveal><p className="card p-8 text-center text-muted">Proyek akan segera ditambahkan.</p></Reveal>;

  return (
    <div>
      {cats.length > 2 && (
        <Reveal>
          <div className="mb-6 flex flex-wrap gap-2">
            {cats.map((c) => (
              <button key={c} className="chip" data-active={c === active} onClick={() => setActive(c)}>{c}</button>
            ))}
          </div>
        </Reveal>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 80} className="h-full">
            <article className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-brand">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-soft to-surface-2">
                {p.imageUrl && <SmartImage src={p.imageUrl} alt={p.title} sizes="(max-width:768px) 100vw, 380px" />}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="badge mb-3 self-start">{p.category}</span>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted">{p.description}</p>
                {p.tags.length > 0 && <p className="mt-3 font-mono text-[11px] text-muted">{p.tags.join(" · ")}</p>}
                {(p.link || p.repo) && (
                  <div className="mt-4 flex gap-2">
                    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Buka <ArrowUpRight className="size-3.5" /></a>}
                    {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><GithubIcon width={14} height={14} /> Kode</a>}
                  </div>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
