"use client";
import { useState, useTransition } from "react";
import { Check, ChevronDown, Mail, MailOpen, Phone, Trash2 } from "lucide-react";
import { deleteMessages, markAllRead, setMessageRead } from "@/actions/admin";
import type { Message } from "@/db";

const fmt = (d: Date) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));

export default function MessageList({ messages }: { messages: Message[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [pending, start] = useTransition();
  const list = filter === "unread" ? messages.filter((m) => !m.isRead) : messages;
  const unread = messages.filter((m) => !m.isRead).length;

  function toggle(m: Message) {
    const next = open === m.id ? null : m.id;
    setOpen(next);
    if (next && !m.isRead) start(() => setMessageRead(m.id, true));
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Pesan masuk</h1>
        <div className="flex items-center gap-2">
          <button className="chip" data-active={filter === "all"} onClick={() => setFilter("all")}>Semua ({messages.length})</button>
          <button className="chip" data-active={filter === "unread"} onClick={() => setFilter("unread")}>Belum dibaca ({unread})</button>
          {unread > 0 && <button className="btn btn-ghost btn-sm" onClick={() => start(() => markAllRead())}><Check className="size-4" /> Tandai semua</button>}
        </div>
      </div>

      <div className={`card divide-y divide-line overflow-hidden ${pending ? "opacity-70" : ""}`}>
        {list.map((m) => {
          const isOpen = open === m.id;
          return (
            <div key={m.id}>
              <button onClick={() => toggle(m)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2" aria-expanded={isOpen}>
                <span className={`size-2 shrink-0 rounded-full ${m.isRead ? "bg-transparent" : "bg-brand"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${m.isRead ? "" : "font-semibold"}`}>{m.subject}</p>
                  <p className="truncate text-xs text-muted">{m.name} — {m.message}</p>
                </div>
                <span className="hidden shrink-0 font-mono text-[11px] text-muted sm:block">{fmt(m.createdAt)}</span>
                <ChevronDown className={`size-4 shrink-0 text-muted transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-line bg-surface-2/50 px-4 py-4">
                  <dl className="mb-4 grid gap-1 text-sm sm:grid-cols-2">
                    <div><dt className="inline text-muted">Dari: </dt><dd className="inline font-medium">{m.name}</dd></div>
                    <div><dt className="inline text-muted">Email: </dt><dd className="inline"><a className="text-brand underline" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}>{m.email}</a></dd></div>
                    {m.phone && <div className="flex items-center gap-1"><Phone className="size-3.5 text-muted" /> <a className="text-brand" href={`tel:${m.phone}`}>{m.phone}</a></div>}
                    <div className="font-mono text-xs text-muted sm:col-span-2">{fmt(m.createdAt)}</div>
                  </dl>
                  <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface p-4 text-sm leading-relaxed">{m.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a className="btn btn-primary btn-sm" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}><Mail className="size-4" /> Balas</a>
                    <button className="btn btn-ghost btn-sm" onClick={() => start(() => setMessageRead(m.id, !m.isRead))}><MailOpen className="size-4" /> {m.isRead ? "Tandai belum dibaca" : "Tandai dibaca"}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => confirm("Hapus pesan ini?") && start(() => deleteMessages([m.id]))}><Trash2 className="size-4" /> Hapus</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="p-10 text-center text-sm text-muted">{filter === "unread" ? "Tidak ada pesan baru." : "Belum ada pesan masuk."}</p>}
      </div>
    </>
  );
}
