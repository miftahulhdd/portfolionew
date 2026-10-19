import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getProfile } from "@/lib/profile";
import { getReportBySlug } from "@/lib/queries";
import { isAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import SmartImage from "@/components/SmartImage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodeBlock from "@/components/CodeBlock";
import RichText from "@/components/RichText";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getReportBySlug(slug);
  if (!data) return { title: "Laporan tidak ditemukan" };
  return { title: data.report.title, description: data.report.summary || undefined };
}

const tocCls = "-ml-px block border-l border-transparent pl-4 text-muted hover:border-brand hover:text-ink";

type Item = Awaited<ReturnType<typeof getReportBySlug>> extends infer T ? (T extends { steps: (infer S)[] } ? S : never) : never;

function ItemList({ items, prefix }: { items: Item[]; prefix: string }) {
  return (
    <ol className="space-y-12">
      {items.map((s, i) => (
        <li key={s.id} id={`${prefix}-${i + 1}`} className="scroll-mt-24">
          <div className="mb-3 flex items-start gap-3">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand font-mono text-xs font-semibold text-brand-ink">{i + 1}</span>
            <h3 className="text-xl font-semibold leading-snug">{s.title}</h3>
          </div>
          <div className="sm:pl-10">
            {s.body && <RichText text={s.body} />}
            {s.codes.map((c, ci) => <CodeBlock key={ci} code={c.code} language={c.language} filename={c.filename} />)}
            {s.images.map((im, ii) => (
              <figure key={ii} className="my-5">
                <div className="overflow-hidden rounded-xl border border-line">
                  <SmartImage fill={false} src={im.url} alt={im.caption || `${s.title} — gambar ${ii + 1}`} sizes="(max-width: 768px) 100vw, 720px" />
                </div>
                {im.caption && <figcaption className="mt-2 text-center text-sm text-muted">{im.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = await isAdmin();
  const [profile, data] = await Promise.all([getProfile(), getReportBySlug(slug, { includeDraft: admin })]);
  if (!data) notFound();
  const { report: r, steps: all } = data;
  const steps = all.filter((s) => s.kind !== "exercise");
  const exercises = all.filter((s) => s.kind === "exercise");

  return (
    <>
      <Navbar handle={profile.handle} />
      {admin && (
        <div className="no-print border-b border-line bg-brand-soft">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 text-sm">
            <span>{r.status === "draft" ? "Draft — hanya terlihat olehmu" : "Mode admin"}</span>
            <Link href={`/admin/reports/${r.id}`} className="flex items-center gap-1 font-semibold text-brand"><Pencil className="size-3.5" /> Edit</Link>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-5 py-10 md:py-16">
        <Link href="/reports" className="no-print mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Semua laporan</Link>

        <div className="grid gap-12 lg:grid-cols-[1fr_220px]">
          <article className="article min-w-0 max-w-3xl">
            <header className="mb-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="badge">{r.course}</span>
                {r.number != null && <span className="font-mono text-xs text-muted">Praktikum {r.number}</span>}
                <span className="font-mono text-xs text-muted">{formatDate(r.createdAt)}</span>
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl">{r.title}</h1>
              {r.summary && <p className="mt-4 text-lg text-muted">{r.summary}</p>}
            </header>

            {r.coverUrl && (
              <div className="relative mb-10 aspect-[16/8] overflow-hidden rounded-2xl border border-line">
                <SmartImage src={r.coverUrl} alt="" priority sizes="(max-width: 768px) 100vw, 768px" />
              </div>
            )}

            {r.intro && (
              <section id="pendahuluan" className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold tracking-tight">Pendahuluan</h2>
                <RichText text={r.intro} />
              </section>
            )}

            {r.objective && (
              <section id="tujuan" className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold tracking-tight">Tujuan</h2>
                <RichText text={r.objective} />
              </section>
            )}

            {steps.length > 0 && (
              <section id="langkah" className="mb-12">
                <h2 className="mb-6 text-2xl font-semibold tracking-tight">Langkah praktikum</h2>
                <ItemList items={steps} prefix="langkah" />
              </section>
            )}

            {exercises.length > 0 && (
              <section id="latihan" className="mb-12">
                <h2 className="mb-6 text-2xl font-semibold tracking-tight">Latihan / tugas praktikum</h2>
                <ItemList items={exercises} prefix="latihan" />
              </section>
            )}

            {r.conclusion && (
              <section id="kesimpulan" className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold tracking-tight">Kesimpulan</h2>
                <RichText text={r.conclusion} />
              </section>
            )}
          </article>

          <aside className="no-print hidden lg:block">
            <nav className="sticky top-24 text-sm" aria-label="Daftar isi">
              <p className="eyebrow mb-3">Daftar isi</p>
              <ul className="space-y-2 border-l border-line">
                {r.intro && <li><a href="#pendahuluan" className={tocCls}>Pendahuluan</a></li>}
                {r.objective && <li><a href="#tujuan" className={tocCls}>Tujuan</a></li>}
                {steps.map((s, i) => (
                  <li key={s.id}><a href={`#langkah-${i + 1}`} className={`${tocCls} truncate`}>{i + 1}. {s.title}</a></li>
                ))}
                {exercises.map((s, i) => (
                  <li key={s.id}><a href={`#latihan-${i + 1}`} className={`${tocCls} truncate`}>Latihan {i + 1}. {s.title}</a></li>
                ))}
                {r.conclusion && <li><a href="#kesimpulan" className={tocCls}>Kesimpulan</a></li>}
              </ul>
            </nav>
          </aside>
        </div>
      </main>
      <Footer p={profile} />
    </>
  );
}
