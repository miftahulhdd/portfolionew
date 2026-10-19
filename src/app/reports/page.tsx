import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/profile";
import { getPublishedReports } from "@/lib/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReportCard from "@/components/ReportCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Laporan Praktikum" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course } = await searchParams;
  const [profile, all] = await Promise.all([getProfile(), getPublishedReports()]);
  const courses = Array.from(new Set(all.map((r) => r.course))).sort();
  const list = course ? all.filter((r) => r.course === course) : all;

  return (
    <>
      <Navbar handle={profile.handle} />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-5 py-12 md:py-20">
        <Link href="/#report" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Kembali</Link>
        <p className="eyebrow mb-3">Report</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Laporan praktikum</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">Semua laporan praktikum, dikelompokkan per mata kuliah.</p>

        {courses.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/reports" className="chip" data-active={!course}>Semua</Link>
            {courses.map((c) => (
              <Link key={c} href={`/reports?course=${encodeURIComponent(c)}`} className="chip" data-active={course === c}>{c}</Link>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r, i) => <ReportCard key={r.id} r={r} delay={(i % 3) * 80} />)}
        </div>
        {list.length === 0 && <p className="card mt-8 p-8 text-center text-muted">Belum ada laporan.</p>}
      </main>
      <Footer p={profile} />
    </>
  );
}
