import Link from "next/link";
import { after } from "next/server";
import { sweepOrphans } from "@/lib/cleanup";
import { runChecks } from "@/lib/system-check";
import { FileText, Images, Mail, Briefcase, Plus } from "lucide-react";
import { getMessages, getStats } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function Dashboard() {
  // bersihkan file upload yatim di belakang layar (maks. 1x per jam)
  after(() => sweepOrphans().catch(() => {}));
  const [stats, msgs, checks] = await Promise.all([getStats(), getMessages(), runChecks()]);
  const problems = checks.filter((c) => c.level !== "ok");
  const cards = [
    { label: "Laporan", value: stats.reports, sub: `${stats.published} dipublikasikan`, href: "/admin/reports", Icon: FileText },
    { label: "Proyek", value: stats.projects, sub: "di portofolio", href: "/admin/portfolio", Icon: Briefcase },
    { label: "Foto", value: stats.gallery, sub: "di galeri", href: "/admin/gallery", Icon: Images },
    { label: "Pesan", value: stats.messages, sub: `${stats.unread} belum dibaca`, href: "/admin/messages", Icon: Mail },
  ];
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/admin/reports/new" className="btn btn-primary"><Plus className="size-4" /> Laporan baru</Link>
      </div>
      {problems.length > 0 && (
        <div className="mb-6 space-y-2" role="alert">
          {problems.map((c, i) => (
            <p key={i} className={`rounded-xl border px-4 py-3 text-sm ${c.level === "error" ? "border-red-400/50 bg-red-500/10 text-red-700 dark:text-red-300" : "border-amber-400/50 bg-amber-500/10 text-amber-800 dark:text-amber-300"}`}>
              <strong>{c.level === "error" ? "Perlu diperbaiki: " : "Perhatian: "}</strong>{c.text}
            </p>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, sub, href, Icon }) => (
          <Link key={label} href={href} className="card p-4 transition hover:border-brand">
            <Icon className="mb-3 size-5 text-brand" />
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted">{sub}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 font-semibold">Pesan terbaru</h2>
      <div className="card divide-y divide-line">
        {msgs.slice(0, 5).map((m) => (
          <Link key={m.id} href="/admin/messages" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
            <span className={`size-2 shrink-0 rounded-full ${m.isRead ? "bg-transparent" : "bg-brand"}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.subject}</p>
              <p className="truncate text-xs text-muted">{m.name} · {m.email}</p>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-muted">{formatDate(m.createdAt)}</span>
          </Link>
        ))}
        {msgs.length === 0 && <p className="p-6 text-center text-sm text-muted">Belum ada pesan masuk.</p>}
      </div>
    </>
  );
}
