"use client";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Code2, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import type { StepCode, StepImage } from "@/db";
import { UPLOAD_NOTE } from "@/lib/images";
import { uploadFiles } from "./upload";

export type Step = { key: string; title: string; body: string; images: StepImage[]; codes: StepCode[] };

const LANGS = ["bash", "php", "html", "css", "javascript", "typescript", "tsx", "json", "sql", "dart", "python", "java", "c", "cpp", "yaml", "blade", "xml", "markdown", "plaintext"];
export const newKey = () => Math.random().toString(36).slice(2, 9);
export const emptyStep = (): Step => ({ key: newKey(), title: "", body: "", images: [], codes: [] });

/** Editor daftar item (dipakai untuk Langkah praktikum dan Latihan/tugas). */
export default function StepsEditor({ heading, noun, items, setItems, onError, hint }: { heading: string; noun: string; items: Step[]; setItems: React.Dispatch<React.SetStateAction<Step[]>>; onError: (m: string) => void; hint?: string }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const upd = (key: string, patch: Partial<Step>) => setItems((s) => s.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => setItems((s) => { const n = [...s]; const j = i + d; if (j < 0 || j >= n.length) return s; [n[i], n[j]] = [n[j], n[i]]; return n; });

  async function addImages(key: string, files: FileList | null) {
    if (!files?.length) return;
    setUploading(key);
    try {
      const all = Array.from(files);
      for (let i = 0; i < all.length; i += 2) {
        const up = await uploadFiles(all.slice(i, i + 2));
        setItems((s) => s.map((x) => (x.key === key ? { ...x, images: [...x.images, ...up.map((u) => ({ url: u.url, caption: "" }))] } : x)));
      }
    } catch (e) { onError((e as Error).message); }
    setUploading(null);
    const el = fileInputs.current[key]; if (el) el.value = "";
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold">{heading} <span className="font-normal text-muted">({items.length})</span></h2>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>

      {items.map((s, i) => (
        <div key={s.key} className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand font-mono text-xs font-semibold text-brand-ink">{i + 1}</span>
            <input className="field font-semibold" placeholder={`Judul ${noun}`} value={s.title} onChange={(e) => upd(s.key, { title: e.target.value })} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Naikkan"><ArrowUp className="size-4" /></button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Turunkan"><ArrowDown className="size-4" /></button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => confirm(`Hapus ${noun} ini?`) && setItems((x) => x.filter((y) => y.key !== s.key))} aria-label="Hapus"><Trash2 className="size-4" /></button>
          </div>

          <label className="label">Penjelasan</label>
          <textarea className="field" rows={3} value={s.body} onChange={(e) => upd(s.key, { body: e.target.value })} />

          {s.codes.map((c, ci) => (
            <div key={ci} className="mt-4 rounded-xl border border-line bg-surface-2 p-3">
              <div className="mb-2 flex gap-2">
                <input className="field !py-1.5 !text-sm" placeholder="Nama file (opsional), mis. routes/web.php" value={c.filename ?? ""} onChange={(e) => upd(s.key, { codes: s.codes.map((x, j) => (j === ci ? { ...x, filename: e.target.value } : x)) })} />
                <select className="field !w-36 !py-1.5 !text-sm" value={c.language} onChange={(e) => upd(s.key, { codes: s.codes.map((x, j) => (j === ci ? { ...x, language: e.target.value } : x)) })}>
                  {LANGS.map((l) => <option key={l}>{l}</option>)}
                </select>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => upd(s.key, { codes: s.codes.filter((_, j) => j !== ci) })} aria-label="Hapus kode"><X className="size-4" /></button>
              </div>
              <textarea className="field !font-mono !text-[13px]" rows={Math.min(14, Math.max(4, c.code.split("\n").length + 1))} spellCheck={false} placeholder="Tempel kode di sini…" value={c.code} onChange={(e) => upd(s.key, { codes: s.codes.map((x, j) => (j === ci ? { ...x, code: e.target.value } : x)) })} onKeyDown={(e) => {
                if (e.key === "Tab") { e.preventDefault(); const t = e.currentTarget; const a = t.selectionStart; const v = t.value.slice(0, a) + "  " + t.value.slice(t.selectionEnd); upd(s.key, { codes: s.codes.map((x, j) => (j === ci ? { ...x, code: v } : x)) }); requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = a + 2; }); }
              }} />
            </div>
          ))}

          {s.images.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {s.images.map((im, ii) => (
                <div key={im.url} className="rounded-xl border border-line bg-surface-2 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url.replace(/_r\.webp$/, "_r-w480.webp")} onError={(e) => { e.currentTarget.src = im.url; }} alt="" className="mb-2 aspect-video w-full rounded-lg object-cover" />
                  <div className="flex gap-2">
                    <input className="field !py-1.5 !text-sm" placeholder="Keterangan gambar" value={im.caption ?? ""} onChange={(e) => upd(s.key, { images: s.images.map((x, j) => (j === ii ? { ...x, caption: e.target.value } : x)) })} />
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => upd(s.key, { images: s.images.filter((_, j) => j !== ii) })} aria-label="Hapus gambar"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => upd(s.key, { codes: [...s.codes, { language: "bash", code: "", filename: "" }] })}><Code2 className="size-4" /> Tambah kode</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputs.current[s.key]?.click()} disabled={uploading === s.key}>
              {uploading === s.key ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} Tambah gambar
            </button>
            <input ref={(el) => { fileInputs.current[s.key] = el; }} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addImages(s.key, e.target.files)} />
          </div>
          <p className="mt-2 text-[11px] text-muted">{UPLOAD_NOTE}</p>
        </div>
      ))}

      <button type="button" className="btn btn-ghost w-full border-dashed" onClick={() => setItems((s) => [...s, emptyStep()])}>
        <Plus className="size-4" /> Tambah {noun}
      </button>
    </section>
  );
}
