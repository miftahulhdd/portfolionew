"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { saveReport, type ReportPayload } from "@/actions/admin";
import type { StepCode, StepImage } from "@/db";
import ImagePicker from "./ImagePicker";
import StepsEditor, { newKey, type Step } from "./StepsEditor";

type Item = { title: string; body: string; images: StepImage[]; codes: StepCode[] };
export type EditorInitial = {
  id?: string; slug?: string; title: string; course: string; number: number | null; summary: string; intro: string;
  objective: string; conclusion: string; coverUrl: string | null; status: "draft" | "published"; steps: Item[]; exercises: Item[];
};

const FORMAT_HINT = "Pisahkan paragraf dengan baris kosong. Awali baris dengan “- ” untuk daftar. `kode` untuk teks kode dalam kalimat, **tebal**, dan link: [teks](https://…) atau tempel URL langsung (GitHub, Drive, dll).";
const toSteps = (a: Item[]): Step[] => a.map((s) => ({ ...s, key: newKey() }));

export default function ReportEditor({ initial, courses }: { initial: EditorInitial; courses: string[] }) {
  const [pending, start] = useTransition();
  const [f, setF] = useState({ ...initial });
  const [steps, setSteps] = useState<Step[]>(toSteps(initial.steps));
  const [exercises, setExercises] = useState<Step[]>(toSteps(initial.exercises));
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function submit(status: "draft" | "published") {
    setMsg(null);
    const strip = (a: Step[]) => a.map(({ key: _k, ...s }) => s);
    const payload: ReportPayload = {
      id: f.id, title: f.title, course: f.course, number: f.number, summary: f.summary, intro: f.intro,
      objective: f.objective, conclusion: f.conclusion, coverUrl: f.coverUrl, status,
      steps: strip(steps), exercises: strip(exercises),
    };
    start(async () => {
      const res = await saveReport(payload);
      if (!res.ok) return setMsg({ type: "err", text: res.error });
      setF((p) => ({ ...p, id: res.id, slug: res.slug, status }));
      setMsg({ type: "ok", text: status === "published" ? "Tersimpan & dipublikasikan." : "Draft tersimpan." });
      // ganti URL ke halaman edit tanpa memuat ulang komponen (state editor tetap utuh)
      if (!f.id) window.history.replaceState(null, "", `/admin/reports/${res.id}`);
    });
  }

  const textBlock = (key: "intro" | "objective" | "conclusion", title: string, rows: number, extra?: string) => (
    <section className="card space-y-2 p-5">
      <h2 className="font-semibold">{title}</h2>
      {extra && <p className="text-xs text-muted">{extra}</p>}
      <textarea className="field" rows={rows} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
    </section>
  );

  return (
    <div className="space-y-8 pb-28">
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Informasi laporan</h2>
        <div>
          <label className="label">Judul laporan</label>
          <input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="mis. Instalasi dan Konfigurasi Laravel" />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <label className="label">Mata kuliah</label>
            <input className="field" list="courses" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })} placeholder="mis. Pemrograman Web" />
            <datalist id="courses">{courses.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className="label">Praktikum ke-</label>
            <input type="number" min={0} className="field" value={f.number ?? ""} onChange={(e) => setF({ ...f, number: e.target.value === "" ? null : Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="label">Ringkasan singkat (tampil di kartu)</label>
          <input className="field" maxLength={400} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} />
        </div>
        <ImagePicker label="Gambar sampul (opsional)" value={f.coverUrl} onChange={(u) => setF({ ...f, coverUrl: u })} aspect="aspect-[16/8]" />
      </section>

      {textBlock("intro", "Pendahuluan (opsional)", 5, `Latar belakang singkat, atau link pendukung (repo GitHub, Google Drive, dll). ${FORMAT_HINT}`)}
      {textBlock("objective", "Tujuan praktikum", 4, FORMAT_HINT)}

      <StepsEditor heading="Langkah praktikum" noun="langkah" items={steps} setItems={setSteps} onError={(t) => setMsg({ type: "err", text: t })} />
      <StepsEditor heading="Latihan / tugas praktikum (opsional)" noun="latihan" items={exercises} setItems={setExercises} onError={(t) => setMsg({ type: "err", text: t })} hint="Muncul setelah Langkah praktikum. Bentuknya sama: judul, penjelasan, kode, dan gambar." />

      {textBlock("conclusion", "Kesimpulan (opsional)", 4)}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-5 py-3">
          <div className="min-w-0 flex-1 text-sm">
            {msg && <span className={msg.type === "ok" ? "text-brand" : "text-red-500"}>{msg.text}</span>}
            {!msg && f.id && <span className="text-muted">Status: {f.status === "published" ? "Dipublikasikan" : "Draft"}</span>}
          </div>
          {f.slug && <Link href={`/reports/${f.slug}`} target="_blank" className="btn btn-ghost btn-sm">Lihat</Link>}
          <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => submit("draft")}>Simpan draft</button>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => submit("published")}>{pending ? "Menyimpan…" : "Simpan & publikasikan"}</button>
        </div>
      </div>
    </div>
  );
}
