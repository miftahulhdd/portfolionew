"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { UPLOAD_NOTE } from "@/lib/images";
import { uploadFiles } from "./upload";

/** Pilih satu gambar (cover, foto profil, dsb). */
export default function ImagePicker({ value, onChange, label, aspect = "aspect-[16/9]" }: { value: string | null; onChange: (url: string | null) => void; label: string; aspect?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError("");
    try {
      const [f] = await uploadFiles([files[0]]);
      onChange(f.url);
    } catch (e) { setError((e as Error).message); }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className={`relative overflow-hidden rounded-xl border border-dashed border-line bg-surface-2 ${aspect} max-w-sm`}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-full object-cover" />
            <button type="button" onClick={() => onChange(null)} aria-label="Hapus gambar" className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"><X className="size-4" /></button>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex size-full flex-col items-center justify-center gap-1 text-sm text-muted hover:text-ink">
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            {busy ? "Mengunggah…" : "Pilih gambar"}
          </button>
        )}
      </div>
      {value && <button type="button" onClick={() => input.current?.click()} className="mt-2 text-xs font-semibold text-brand">Ganti gambar</button>}
      <p className="mt-1.5 max-w-sm text-[11px] text-muted">{UPLOAD_NOTE}</p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick(e.target.files)} />
    </div>
  );
}
