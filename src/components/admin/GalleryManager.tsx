"use client";
import { useRef, useState, useTransition } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { addGalleryItems, deleteGalleryItem, updateGalleryCaption } from "@/actions/admin";
import type { GalleryItem } from "@/db";
import { UPLOAD_NOTE } from "@/lib/images";
import { uploadFiles } from "./upload";

export default function GalleryManager({ items }: { items: GalleryItem[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError("");
    try {
      // unggah per 3 file agar tidak melebihi batas ukuran request
      const all = Array.from(files);
      for (let i = 0; i < all.length; i += 3) {
        const up = await uploadFiles(all.slice(i, i + 3));
        await addGalleryItems(up);
      }
    } catch (e) { setError((e as Error).message); }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Galeri</h1>
        <button className="btn btn-primary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} {busy ? "Mengunggah…" : "Unggah foto"}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
      <p className="mb-4 text-sm text-muted">{UPLOAD_NOTE}. Bisa pilih banyak foto sekaligus. Menghapus foto juga menghapus file-nya dari server.</p>

      <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${pending ? "opacity-60" : ""}`}>
        {items.map((g) => (
          <div key={g.id} className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url.replace(/_r\.webp$/, "_r-w480.webp")} onError={(e) => { e.currentTarget.src = g.url; }} alt={g.caption} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="flex items-center gap-1.5 p-2">
              <input className="field !px-2 !py-1.5 !text-xs" defaultValue={g.caption} placeholder="Keterangan" onBlur={(e) => e.target.value !== g.caption && start(() => updateGalleryCaption(g.id, e.target.value))} />
              <button className="btn btn-danger btn-sm !px-2" aria-label="Hapus foto" onClick={() => confirm("Hapus foto ini?") && start(() => deleteGalleryItem(g.id))}><Trash2 className="size-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="card p-10 text-center text-sm text-muted">Belum ada foto. Klik “Unggah foto”.</p>}
    </>
  );
}
