"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Images, LayoutDashboard, LogOut, Mail, Briefcase, UserRound, ExternalLink } from "lucide-react";
import { logout } from "@/actions/admin";
import ThemeToggle from "@/components/ThemeToggle";

const items = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/reports", label: "Laporan", Icon: FileText },
  { href: "/admin/portfolio", label: "Portofolio", Icon: Briefcase },
  { href: "/admin/gallery", label: "Galeri", Icon: Images },
  { href: "/admin/messages", label: "Pesan", Icon: Mail },
  { href: "/admin/profile", label: "Profil", Icon: UserRound },
];

export default function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface p-4 md:flex">
        <p className="mb-6 px-2 font-mono text-sm font-semibold">admin<span className="text-brand">_</span></p>
        <nav className="flex-1 space-y-1">
          {items.map(({ href, label, Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href);
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-ink"}`}>
                <Icon className="size-4" /> {label}
                {label === "Pesan" && unread > 0 && <span className="ml-auto rounded-full bg-brand px-2 text-[11px] font-semibold text-brand-ink">{unread}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-line pt-3">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2"><ExternalLink className="size-4" /> Lihat situs</Link>
          <div className="flex items-center justify-between px-1">
            <form action={logout}><button className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted hover:text-ink"><LogOut className="size-4" /> Keluar</button></form>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <nav className="sticky top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-line bg-bg/90 px-3 py-2 backdrop-blur md:hidden">
        {items.map(({ href, label, Icon, exact }) => {
          const active = exact ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${active ? "bg-brand-soft text-brand" : "text-muted"}`}>
              <Icon className="size-4" /> {label}
              {label === "Pesan" && unread > 0 && <span className="rounded-full bg-brand px-1.5 text-[10px] text-brand-ink">{unread}</span>}
            </Link>
          );
        })}
        <form action={logout} className="ml-auto"><button className="p-2 text-muted" aria-label="Keluar"><LogOut className="size-4" /></button></form>
      </nav>
    </>
  );
}
