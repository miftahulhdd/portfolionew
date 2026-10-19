import { Mail, MapPin, Phone } from "lucide-react";
import type { Profile } from "@/lib/profile";
import ContactForm from "./ContactForm";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";
import Photo from "./Photo";
import Reveal from "./Reveal";
import Section from "./Section";

export default function ContactSection({ p }: { p: Profile }) {
  const initials = p.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  const socials = [
    { href: p.github, label: "GitHub", Icon: GithubIcon },
    { href: p.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: p.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  ].filter((s) => s.href);

  return (
    <Section id="contact" index="05" title="Mari terhubung" desc="Ada pertanyaan, proyek, atau sekadar ingin menyapa? Kirim pesan, aku baca langsung.">
      <div className="grid gap-5 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr]">
        <Reveal className="h-full">
          <aside className="card flex h-full flex-col p-5 md:p-6">
            <Photo src={p.contactPhoto} alt={p.name} initials={initials} sizes="64px" className="size-16 rounded-full border border-line text-xl" />
            <h3 className="mt-4 text-lg font-semibold leading-snug">{p.name}</h3>
            <p className="mt-1 text-sm text-muted">{p.headline}</p>

            <p className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
              <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>
              Terbuka untuk kolaborasi
            </p>

            <ul className="mt-5 space-y-3 text-sm">
              {p.location && <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-brand" /><span>{p.location}</span></li>}
              {p.email && <li className="flex items-start gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-brand" /><a href={`mailto:${p.email}`} className="break-all hover:text-brand">{p.email}</a></li>}
              {p.phone && <li className="flex items-start gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-brand" /><span>{p.phone}</span></li>}
            </ul>

            {socials.length > 0 && (
              <div className="mt-auto flex gap-2 pt-6">
                {socials.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-brand hover:text-brand">
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </aside>
        </Reveal>
        <Reveal delay={100} className="h-full">
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
