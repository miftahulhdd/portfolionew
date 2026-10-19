import { Mail, MapPin } from "lucide-react";
import type { Profile } from "@/lib/profile";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";

const STACK = ["Next.js", "Tailwind CSS", "TypeScript", "MySQL", "Drizzle ORM"];

export default function Footer({ p }: { p: Profile }) {
  const socials = [
    { href: p.github, label: "GitHub", Icon: GithubIcon },
    { href: p.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: p.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: p.email && `mailto:${p.email}`, label: "Email", Icon: Mail },
  ].filter((s) => s.href);
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 md:flex-row md:items-center">
        <div>
          <p className="font-semibold">{p.name}</p>
          {p.location && <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin className="size-3.5" />{p.location}</p>}
        </div>
        <div className="flex gap-2">
          {socials.map(({ href, label, Icon }) => (
            <a key={label} href={href as string} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-brand hover:text-brand">
              <Icon className="size-[18px]" />
            </a>
          ))}
        </div>
        <div className="font-mono text-xs text-muted md:text-right">
          <p>© {new Date().getFullYear()} {p.handle}</p>
          <p className="mt-1.5 text-muted/80">made with {STACK.join(" ∙ ")}</p>
        </div>
      </div>
    </footer>
  );
}
