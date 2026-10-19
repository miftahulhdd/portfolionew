import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllReports } from "@/lib/queries";
import ReportRow from "@/components/admin/ReportRow";

export const metadata = { title: "Laporan" };

export default async function AdminReports() {
  const list = await getAllReports();
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Laporan praktikum</h1>
        <Link href="/admin/reports/new" className="btn btn-primary"><Plus className="size-4" /> Baru</Link>
      </div>
      <div className="card divide-y divide-line">
        {list.map((r) => <ReportRow key={r.id} r={{ id: r.id, slug: r.slug, title: r.title, course: r.course, number: r.number, status: r.status }} />)}
        {list.length === 0 && <p className="p-8 text-center text-sm text-muted">Belum ada laporan. Klik “Baru” untuk membuat yang pertama.</p>}
      </div>
    </>
  );
}
