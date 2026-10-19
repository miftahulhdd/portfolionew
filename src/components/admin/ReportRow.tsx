"use client";
import Link from "next/link";
import { useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deleteReport, setReportStatus } from "@/actions/admin";

export default function ReportRow({ r }: { r: { id: string; slug: string; title: string; course: string; number: number | null; status: "draft" | "published" } }) {
  const [pending, start] = useTransition();
  const pub = r.status === "published";
  return (
    <div className={`flex flex-wrap items-center gap-3 px-4 py-3 ${pending ? "opacity-50" : ""}`}>
      <div className="min-w-0 flex-1">
        <Link href={`/admin/reports/${r.id}`} className="block truncate font-medium hover:text-brand">{r.title}</Link>
        <p className="text-xs text-muted">{r.course}{r.number != null && ` · Praktikum ${r.number}`}</p>
      </div>
      <span className={`badge ${pub ? "" : "!bg-surface-2 !text-muted"}`}>{pub ? "Publik" : "Draft"}</span>
      <div className="flex gap-1.5">
        <Link href={`/admin/reports/${r.id}`} className="btn btn-ghost btn-sm" aria-label="Edit"><Pencil className="size-4" /></Link>
        <button className="btn btn-ghost btn-sm" aria-label={pub ? "Jadikan draft" : "Publikasikan"} onClick={() => start(() => setReportStatus(r.id, pub ? "draft" : "published"))}>{pub ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        <button className="btn btn-danger btn-sm" aria-label="Hapus" onClick={() => confirm(`Hapus "${r.title}"?`) && start(() => deleteReport(r.id))}><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
}
