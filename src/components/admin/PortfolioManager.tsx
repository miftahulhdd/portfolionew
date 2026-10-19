"use client";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteProject, deleteTimeline, saveProject, saveTimeline } from "@/actions/admin";
import type { Project, TimelineItem } from "@/db";
import ImagePicker from "./ImagePicker";

type PDraft = { id?: string; title: string; description: string; category: string; imageUrl: string | null; link: string; repo: string; tags: string };
type TDraft = { id?: string; role: string; organization: string; type: TimelineItem["type"]; period: string; month: string; description: string };

const emptyP: PDraft = { title: "", description: "", category: "Web", imageUrl: null, link: "", repo: "", tags: "" };
const emptyT: TDraft = { role: "", organization: "", type: "organisasi", period: "", month: "", description: "" };

function startKeyToMonth(k: number) {
  if (!k) return "";
  const s = String(k).padStart(6, "0");
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export default function PortfolioManager({ projects, timeline, categories }: { projects: Project[]; timeline: TimelineItem[]; categories: string[] }) {
  const [p, setP] = useState<PDraft | null>(null);
  const [t, setT] = useState<TDraft | null>(null);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  function submitProject() {
    if (!p) return;
    setErr("");
    start(async () => {
      const r = await saveProject({
        id: p.id, title: p.title, description: p.description, category: p.category || "Web", imageUrl: p.imageUrl,
        link: p.link || null, repo: p.repo || null, tags: p.tags.split(",").map((x) => x.trim()).filter(Boolean),
      });
      if (!r.ok) return setErr(r.error ?? "Gagal menyimpan");
      setP(null);
    });
  }

  function submitTimeline() {
    if (!t) return;
    setErr("");
    start(async () => {
      const [y, m] = t.month ? t.month.split("-").map(Number) : [0, 0];
      const r = await saveTimeline({ id: t.id, role: t.role, organization: t.organization, type: t.type, period: t.period, startKey: y * 100 + m, description: t.description });
      if (!r.ok) return setErr(r.error ?? "Gagal menyimpan");
      setT(null);
    });
  }

  return (
    <div className="space-y-12">
      {/* Proyek */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Proyek</h1>
          <button className="btn btn-primary" onClick={() => { setErr(""); setP(emptyP); setT(null); }}><Plus className="size-4" /> Proyek</button>
        </div>

        {p && (
          <div className="card mb-5 space-y-4 p-5">
            <h2 className="font-semibold">{p.id ? "Edit proyek" : "Proyek baru"}</h2>
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <div><label className="label">Judul</label><input className="field" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} /></div>
              <div><label className="label">Kategori</label><input className="field" list="cats" value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} /><datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></div>
            </div>
            <div><label className="label">Deskripsi</label><textarea className="field" rows={3} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Link demo</label><input className="field" placeholder="https://" value={p.link} onChange={(e) => setP({ ...p, link: e.target.value })} /></div>
              <div><label className="label">Link repository</label><input className="field" placeholder="https://github.com/…" value={p.repo} onChange={(e) => setP({ ...p, repo: e.target.value })} /></div>
            </div>
            <div><label className="label">Tag (pisahkan koma)</label><input className="field" placeholder="Laravel, MySQL, Bootstrap" value={p.tags} onChange={(e) => setP({ ...p, tags: e.target.value })} /></div>
            <ImagePicker label="Gambar" value={p.imageUrl} onChange={(u) => setP({ ...p, imageUrl: u })} aspect="aspect-[16/10]" />
            {err && <p className="text-sm text-red-500">{err}</p>}
            <div className="flex gap-2">
              <button className="btn btn-primary" disabled={pending} onClick={submitProject}>{pending ? "Menyimpan…" : "Simpan"}</button>
              <button className="btn btn-ghost" onClick={() => setP(null)}>Batal</button>
            </div>
          </div>
        )}

        <div className={`card divide-y divide-line ${pending ? "opacity-70" : ""}`}>
          {projects.map((x) => (
            <div key={x.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{x.title}</p><p className="text-xs text-muted">{x.category}</p></div>
              <button className="btn btn-ghost btn-sm" aria-label="Edit" onClick={() => { setErr(""); setT(null); setP({ id: x.id, title: x.title, description: x.description, category: x.category, imageUrl: x.imageUrl, link: x.link ?? "", repo: x.repo ?? "", tags: x.tags.join(", ") }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil className="size-4" /></button>
              <button className="btn btn-danger btn-sm" aria-label="Hapus" onClick={() => confirm(`Hapus "${x.title}"?`) && start(() => deleteProject(x.id))}><Trash2 className="size-4" /></button>
            </div>
          ))}
          {projects.length === 0 && <p className="p-8 text-center text-sm text-muted">Belum ada proyek.</p>}
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Riwayat organisasi & kepanitiaan</h2>
          <button className="btn btn-primary" onClick={() => { setErr(""); setT(emptyT); setP(null); }}><Plus className="size-4" /> Riwayat</button>
        </div>

        {t && (
          <div className="card mb-5 space-y-4 p-5">
            <h3 className="font-semibold">{t.id ? "Edit riwayat" : "Riwayat baru"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Jabatan / peran</label><input className="field" value={t.role} onChange={(e) => setT({ ...t, role: e.target.value })} /></div>
              <div><label className="label">Organisasi / acara</label><input className="field" value={t.organization} onChange={(e) => setT({ ...t, organization: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="label">Jenis</label>
                <select className="field" value={t.type} onChange={(e) => setT({ ...t, type: e.target.value as TDraft["type"] })}>
                  <option value="organisasi">Organisasi</option><option value="kepanitiaan">Kepanitiaan</option><option value="lainnya">Lainnya</option>
                </select></div>
              <div><label className="label">Teks periode</label><input className="field" placeholder="Jun 2024 – Sep 2026" value={t.period} onChange={(e) => setT({ ...t, period: e.target.value })} /></div>
              <div><label className="label">Bulan mulai (untuk urutan)</label><input type="month" className="field" value={t.month} onChange={(e) => setT({ ...t, month: e.target.value })} /></div>
            </div>
            <div><label className="label">Keterangan (opsional)</label><textarea className="field" rows={2} value={t.description} onChange={(e) => setT({ ...t, description: e.target.value })} /></div>
            {err && <p className="text-sm text-red-500">{err}</p>}
            <div className="flex gap-2">
              <button className="btn btn-primary" disabled={pending} onClick={submitTimeline}>{pending ? "Menyimpan…" : "Simpan"}</button>
              <button className="btn btn-ghost" onClick={() => setT(null)}>Batal</button>
            </div>
          </div>
        )}

        <div className={`card divide-y divide-line ${pending ? "opacity-70" : ""}`}>
          {timeline.map((x) => (
            <div key={x.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{x.role}</p><p className="truncate text-xs text-muted">{x.organization} · {x.period}</p></div>
              <span className="badge hidden sm:inline-block">{x.type}</span>
              <button className="btn btn-ghost btn-sm" aria-label="Edit" onClick={() => { setErr(""); setP(null); setT({ id: x.id, role: x.role, organization: x.organization, type: x.type, period: x.period, month: startKeyToMonth(x.startKey), description: x.description }); }}><Pencil className="size-4" /></button>
              <button className="btn btn-danger btn-sm" aria-label="Hapus" onClick={() => confirm(`Hapus "${x.role}"?`) && start(() => deleteTimeline(x.id))}><Trash2 className="size-4" /></button>
            </div>
          ))}
          {timeline.length === 0 && <p className="p-8 text-center text-sm text-muted">Belum ada riwayat.</p>}
        </div>
      </section>
    </div>
  );
}
