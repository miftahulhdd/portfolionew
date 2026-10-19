"use client";
import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { saveProfile } from "@/actions/admin";
import type { Profile } from "@/lib/profile";
import { MAX_SKILL_ICONS, TECH_KEYS } from "@/lib/tech-keys";
import ImagePicker from "./ImagePicker";

const ICONS = ["code", "camera", "pen", "phone", "globe", "layers"];

export default function ProfileForm({ initial }: { initial: Profile }) {
  const [p, setP] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const text = (k: keyof Profile, label: string, ph = "") => (
    <div><label className="label">{label}</label><input className="field" placeholder={ph} value={p[k] as string} onChange={(e) => set(k, e.target.value as never)} /></div>
  );

  function save() {
    setMsg(null);
    start(async () => {
      const r = await saveProfile(p);
      setMsg({ ok: r.ok, text: r.ok ? "Profil tersimpan." : r.error ?? "Gagal menyimpan" });
    });
  }

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-semibold">Profil & konten utama</h1>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">{text("name", "Nama lengkap")}{text("handle", "Username (logo navbar)")}</div>
        {text("headline", "Headline")}
        {text("tagline", "Kalimat pendek di bawah headline")}
        <div className="grid gap-6 sm:grid-cols-2">
          <ImagePicker label="Foto hero" value={p.heroPhoto || null} onChange={(u) => set("heroPhoto", u ?? "")} aspect="aspect-[4/5]" />
          <ImagePicker label="Foto about" value={p.aboutPhoto || null} onChange={(u) => set("aboutPhoto", u ?? "")} aspect="aspect-[4/5]" />
          <ImagePicker label="Foto profil kontak (kartu kecil di section Contact)" value={p.contactPhoto || null} onChange={(u) => set("contactPhoto", u ?? "")} aspect="aspect-square" />
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Tentang saya</h2>
        <textarea className="field" rows={8} value={p.about} onChange={(e) => set("about", e.target.value)} />
        <p className="text-xs text-muted">Pisahkan paragraf dengan baris kosong.</p>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Pendidikan (kartu di About)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Jenjang / gelar</label><input className="field" placeholder="Sarjana Informatika" value={p.education.degree} onChange={(e) => set("education", { ...p.education, degree: e.target.value })} /></div>
          <div><label className="label">Kampus</label><input className="field" placeholder="Universitas Andalas" value={p.education.school} onChange={(e) => set("education", { ...p.education, school: e.target.value })} /></div>
          <div><label className="label">Periode (tahun pertama jadi angka besar)</label><input className="field" placeholder="2024 · Sekarang" value={p.education.period} onChange={(e) => set("education", { ...p.education, period: e.target.value })} /></div>
          <div><label className="label">IPK (kosongkan untuk menyembunyikan)</label><input className="field" placeholder="3.57" value={p.education.gpa} onChange={(e) => set("education", { ...p.education, gpa: e.target.value })} /></div>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <div>
          <h2 className="font-semibold">Keahlian</h2>
          <p className="mt-1 text-xs text-muted">Teks tampil di kiri. Ikon (maks. {MAX_SKILL_ICONS}) tampil di kanan dengan warna senada tema.</p>
        </div>
        {p.skills.map((s, i) => {
          const upd = (patch: Partial<Profile["skills"][number]>) => set("skills", p.skills.map((x, j) => (j === i ? { ...x, ...patch } : x)));
          return (
            <div key={i} className="rounded-xl border border-line p-3">
              <div className="flex gap-2">
                <input className="field !w-40" placeholder="Kelompok" value={s.group} onChange={(e) => upd({ group: e.target.value })} />
                <input className="field" placeholder="HTML, CSS, …" value={s.items} onChange={(e) => upd({ items: e.target.value })} />
                <button className="btn btn-ghost btn-sm" onClick={() => set("skills", p.skills.filter((_, j) => j !== i))} aria-label="Hapus"><X className="size-4" /></button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {TECH_KEYS.map(([key, label]) => {
                  const on = s.icons.includes(key);
                  const full = !on && s.icons.length >= MAX_SKILL_ICONS;
                  return (
                    <button key={key} type="button" disabled={full} data-active={on} className="chip !px-2.5 !py-1 !text-xs disabled:opacity-40" onClick={() => upd({ icons: on ? s.icons.filter((k) => k !== key) : [...s.icons, key] })}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <button className="btn btn-ghost btn-sm" onClick={() => set("skills", [...p.skills, { group: "", items: "", icons: [] }])}><Plus className="size-4" /> Tambah kelompok</button>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Layanan (kartu kecil di About)</h2>
        {p.services.map((s, i) => (
          <div key={i} className="flex gap-2">
            <select className="field !w-32" value={s.icon} onChange={(ev) => set("services", p.services.map((x, j) => (j === i ? { ...x, icon: ev.target.value } : x)))}>{ICONS.map((x) => <option key={x}>{x}</option>)}</select>
            <input className="field" value={s.label} onChange={(ev) => set("services", p.services.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)))} />
            <button className="btn btn-ghost btn-sm" onClick={() => set("services", p.services.filter((_, j) => j !== i))} aria-label="Hapus"><X className="size-4" /></button>
          </div>
        ))}
        {p.services.length < 8 && <button className="btn btn-ghost btn-sm" onClick={() => set("services", [...p.services, { icon: "code", label: "" }])}><Plus className="size-4" /> Tambah</button>}
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Kontak & sosial media</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("email", "Email publik", "kamu@email.com")}{text("phone", "No. HP / WhatsApp")}
          {text("location", "Lokasi")}{text("github", "GitHub URL")}
          {text("instagram", "Instagram URL")}{text("linkedin", "LinkedIn URL")}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-3">
          <span className={`flex-1 text-sm ${msg?.ok ? "text-brand" : "text-red-500"}`}>{msg?.text}</span>
          <button className="btn btn-primary" disabled={pending} onClick={save}>{pending ? "Menyimpan…" : "Simpan perubahan"}</button>
        </div>
      </div>
    </div>
  );
}
