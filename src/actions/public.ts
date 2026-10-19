"use server";

import { headers } from "next/headers";
import { count, gt } from "drizzle-orm";
import { clientIp } from "@/lib/ip";
import { z } from "zod";
import { db, messages } from "@/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().trim().email("Email tidak valid").max(120),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(3, "Subjek minimal 3 karakter").max(120),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter").max(3000),
});

export type ContactState = { ok: boolean; error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

export async function submitContact(_: ContactState, form: FormData): Promise<ContactState> {
  // honeypot: bot biasanya mengisi kolom tersembunyi ini
  if (form.get("website")) return { ok: true };

  const values = Object.fromEntries(["name", "email", "phone", "subject", "message"].map((k) => [k, String(form.get(k) ?? "")]));
  const h = await headers();
  const ip = clientIp(h);
  if (!rateLimit(`contact:${ip}`, 3, 10 * 60 * 1000)) {
    return { ok: false, error: "Terlalu banyak pesan. Coba lagi beberapa menit lagi.", values };
  }

  const parsed = schema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone") || undefined,
    subject: form.get("subject"),
    message: form.get("message"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, fieldErrors, values };
  }

  try {
    // batas global (melawan banjir pesan dari banyak IP): maks. 40 pesan per jam
    const [recent] = await db.select({ n: count() }).from(messages).where(gt(messages.createdAt, new Date(Date.now() - 3600_000)));
    if (Number(recent.n) >= 40) return { ok: false, error: "Kotak pesan sedang penuh. Coba lagi nanti ya.", values };
    await db.insert(messages).values({ ...parsed.data, phone: parsed.data.phone ?? null });
  } catch {
    return { ok: false, error: "Pesan gagal dikirim. Coba lagi nanti.", values };
  }
  return { ok: true };
}
