"use client";
import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitContact, type ContactState } from "@/actions/public";

const initial: ContactState = { ok: false };
const RESET_MS = 12_000; // kartu sukses kembali ke formulir setelah 12 detik

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // tampilkan kartu "terkirim", lalu otomatis kembali ke formulir kosong setelah RESET_MS
  useEffect(() => {
    if (!state.ok) return;
    setSuccess(true);
    const t = setTimeout(() => { setSuccess(false); setFormKey((k) => k + 1); }, RESET_MS);
    return () => clearTimeout(t);
  }, [state]);

  if (success) {
    return (
      <div className="card flex h-full flex-col items-center justify-center gap-3 p-10 text-center" role="status">
        <CheckCircle2 className="size-10 text-brand" />
        <h3 className="text-xl font-semibold">Pesan terkirim</h3>
        <p className="max-w-sm text-muted">Terima kasih! Aku akan membalas secepatnya lewat email yang kamu tulis.</p>
        <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => { setSuccess(false); setFormKey((k) => k + 1); }}>Kirim pesan lain</button>
        <div aria-hidden className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full origin-left rounded-full bg-brand" style={{ animation: `shrink ${RESET_MS}ms linear forwards` }} />
        </div>
      </div>
    );
  }

  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};
  return (
    <form key={formKey} action={action} className="card space-y-4 p-5 md:p-7" noValidate>
      {state.error && <p role="alert" className="rounded-lg border border-red-300/60 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nama</label>
          <input id="name" name="name" defaultValue={v.name} required className="field" autoComplete="name" />
          {err.name && <p className="mt-1 text-xs text-red-500">{err.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" defaultValue={v.email} type="email" required className="field" autoComplete="email" />
          {err.email && <p className="mt-1 text-xs text-red-500">{err.email}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">No. HP <span className="font-normal">(opsional)</span></label>
          <input id="phone" name="phone" defaultValue={v.phone} type="tel" className="field" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="subject">Subjek</label>
          <input id="subject" name="subject" defaultValue={v.subject} required className="field" />
          {err.subject && <p className="mt-1 text-xs text-red-500">{err.subject}</p>}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="message">Pesan</label>
        <textarea id="message" name="message" defaultValue={v.message} rows={5} required className="field" />
        {err.message && <p className="mt-1 text-xs text-red-500">{err.message}</p>}
      </div>
      {/* honeypot */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <button className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Mengirim…" : <>Kirim pesan <Send className="size-4" /></>}
      </button>
    </form>
  );
}
