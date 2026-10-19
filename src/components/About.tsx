import { Code2, Camera, GraduationCap, PenTool, Smartphone, Globe, Layers } from "lucide-react";
import type { Profile } from "@/lib/profile";
import { paragraphs } from "@/lib/utils";
import Photo from "./Photo";
import Reveal from "./Reveal";
import Section from "./Section";
import TechIcon from "./TechIcon";

const icons = { code: Code2, camera: Camera, pen: PenTool, phone: Smartphone, globe: Globe, layers: Layers } as const;

export default function About({ p }: { p: Profile }) {
  const initials = p.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  const ed = p.education;
  const year = ed.period.match(/\d{4}/)?.[0] ?? "";
  return (
    <Section id="about" index="01" title="Sedikit tentang saya">
      <div className="grid gap-10 md:grid-cols-[320px_1fr] md:gap-14">
        <Reveal>
          <Photo src={p.aboutPhoto} alt={p.name} initials={initials} sizes="320px" className="aspect-[4/5] w-full max-w-xs rounded-2xl border border-line md:max-w-none" />
        </Reveal>
        <div>
          {paragraphs(p.about).map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <p className="mb-4 text-lg leading-relaxed text-muted first:text-ink">{t}</p>
            </Reveal>
          ))}

          <div className="mt-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            {/* Pendidikan */}
            <Reveal className="h-full">
              <div className="relative flex h-full min-h-[15rem] flex-col overflow-hidden rounded-2xl bg-brand p-6 text-brand-ink">
                <div aria-hidden className="absolute -bottom-16 -right-16 size-48 rounded-full bg-brand-ink/10" />
                <div className="flex items-start justify-between">
                  <p className="text-5xl font-semibold tracking-tight">{year}</p>
                  <GraduationCap className="size-6 opacity-80" />
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold leading-snug">{ed.degree}</h3>
                  <p className="mt-1 text-sm font-semibold opacity-85">{ed.school}</p>
                  <p className="mt-1 text-xs opacity-70">{ed.period}</p>
                </div>
                {ed.gpa && (
                  <div className="relative mt-auto border-t border-brand-ink/25 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">IPK</p>
                    <p className="text-2xl font-semibold">{ed.gpa}</p>
                  </div>
                )}
              </div>
            </Reveal>

            {/* Keahlian */}
            <Reveal delay={100} className="h-full">
              <div className="card h-full p-5">
                <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold"><Code2 className="size-4 text-brand" /> Keahlian</h3>
                <ul className="divide-y divide-line">
                  {p.skills.map((s) => (
                    <li key={s.group} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{s.group}</p>
                        <p className="text-xs text-muted">{s.items}</p>
                      </div>
                      {s.icons.length > 0 && (
                        <div className="flex shrink-0 items-center gap-2.5 text-brand">
                          {s.icons.slice(0, 4).map((k) => <TechIcon key={k} name={k} className="size-[1.15rem]" />)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div className="mt-4 grid auto-rows-fr grid-cols-2 gap-3 lg:grid-cols-4">
            {p.services.map((s, i) => {
              const Icon = icons[s.icon as keyof typeof icons] ?? Code2;
              return (
                <Reveal key={s.label} delay={i * 70} className="h-full">
                  <div className="card flex h-full min-h-[4.5rem] items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand">
                    <Icon className="size-5 shrink-0 text-brand" />
                    <span className="text-sm font-medium leading-tight">{s.label}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
