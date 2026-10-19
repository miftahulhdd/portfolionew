import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import type { Profile } from "@/lib/profile";
import Photo from "./Photo";
import Reveal from "./Reveal";

export default function Hero({ p }: { p: Profile }) {
  const first = p.name.split(" ")[0];
  const initials = p.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <header className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-brand/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.25fr_1fr] md:pb-28 md:pt-24">
        <div className="order-2 md:order-1">
          <Reveal><p className="eyebrow mb-5">Halo, saya</p></Reveal>
          <Reveal delay={90}>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">{first}<span className="text-brand">.</span></h1>
          </Reveal>
          <Reveal delay={180}><p className="mt-5 text-xl font-medium md:text-2xl">{p.headline}</p></Reveal>
          <Reveal delay={260}><p className="mt-3 max-w-xl text-lg text-muted">{p.tagline}</p></Reveal>
          <Reveal delay={340}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/reports" className="btn btn-primary">Laporan praktikum <ArrowRight className="size-4" /></Link>
              <Link href="/#contact" className="btn btn-ghost">Hubungi saya <ArrowDownRight className="size-4" /></Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={150} className="order-1 mx-auto w-full max-w-[19rem] md:order-2 md:max-w-sm">
          <div className="relative">
            <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-brand/40" />
            <Photo src={p.heroPhoto} alt={`Foto ${p.name}`} initials={initials} priority className="relative aspect-[4/5] rounded-[2rem] border border-line shadow-sm" />
          </div>
        </Reveal>
      </div>
    </header>
  );
}
