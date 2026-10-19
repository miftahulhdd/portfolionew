"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray, like } from "drizzle-orm";
import { z } from "zod";
import { db, gallery, messages, projects, reports, reportSteps, settings, timeline } from "@/db";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { defaultProfile, getProfile, type Profile } from "@/lib/profile";
import { clientIp } from "@/lib/ip";
import { clearLoginFailures, loginBlockedMinutes, recordLoginFailure } from "@/lib/login-guard";
import { slugify } from "@/lib/utils";
import { deleteImages } from "@/lib/storage";
import { headers } from "next/headers";

/* ---------- Auth ---------- */

export async function login(_: { error?: string; username?: string } | undefined, form: FormData) {
  const ip = clientIp(await headers());
  const username = String(form.get("username") ?? "");

  const blocked = await loginBlockedMinutes(ip);
  if (blocked > 0) return { error: `Terlalu banyak percobaan gagal. Coba lagi sekitar ${blocked} menit lagi.`, username };

  const ok = checkCredentials(username, String(form.get("password") ?? ""));
  if (!ok) {
    await recordLoginFailure(ip);
    await new Promise((r) => setTimeout(r, 800)); // memperlambat tebak-tebakan password
    return { error: "Username atau password salah.", username };
  }
  await clearLoginFailures(ip);
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Laporan ---------- */

const httpUrl = z.string().trim().max(500).refine((u) => u === "" || /^https?:\/\//i.test(u), "Link harus diawali http:// atau https://");
const imageUrl = z.string().max(500).refine((u) => u.startsWith("/media/") || /^https:\/\//i.test(u), "URL gambar tidak valid");

const stepSchema = z.object({
  title: z.string().trim().min(1, "Judul langkah wajib diisi").max(200),
  body: z.string().max(8000).default(""),
  images: z.array(z.object({ url: imageUrl, caption: z.string().max(300).optional() })).default([]),
  codes: z
    .array(z.object({ filename: z.string().max(120).optional(), language: z.string().max(30), code: z.string().max(40000) }))
    .default([]),
});

const reportSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(200),
  course: z.string().trim().min(2, "Mata kuliah wajib diisi").max(100),
  number: z.number().int().min(0).max(999).nullable(),
  summary: z.string().max(400).default(""),
  intro: z.string().max(8000).default(""),
  objective: z.string().max(6000).default(""),
  conclusion: z.string().max(6000).default(""),
  coverUrl: imageUrl.nullable(),
  status: z.enum(["draft", "published"]),
  steps: z.array(stepSchema).max(60),
  exercises: z.array(stepSchema).max(40).default([]),
});

export type ReportPayload = z.input<typeof reportSchema>;

async function uniqueSlug(base: string, ignoreId?: string) {
  const root = slugify(base) || "laporan";
  const existing = await db.select({ id: reports.id, slug: reports.slug }).from(reports).where(like(reports.slug, `${root}%`));
  const taken = new Set(existing.filter((r) => r.id !== ignoreId).map((r) => r.slug));
  if (!taken.has(root)) return root;
  let i = 2;
  while (taken.has(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}

const stepUrls = (steps: { images: { url: string }[] }[]) => steps.flatMap((s) => s.images.map((i) => i.url));

async function reportImageUrls(id: string) {
  const r = await db.query.reports.findFirst({ where: eq(reports.id, id) });
  const st = await db.select({ images: reportSteps.images }).from(reportSteps).where(eq(reportSteps.reportId, id));
  return { cover: r?.coverUrl ?? null, all: [r?.coverUrl, ...stepUrls(st)].filter(Boolean) as string[] };
}

export async function saveReport(payload: ReportPayload): Promise<{ ok: true; id: string; slug: string } | { ok: false; error: string }> {
  await requireAdmin();
  const parsed = reportSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  const { steps, exercises, id: existingId, ...data } = parsed.data;

  const slugBase = [data.course, data.number != null ? String(data.number) : "", data.title].filter(Boolean).join(" ");
  let id = existingId;
  let slug: string;
  let before: string[] = [];

  if (id) {
    const current = await db.query.reports.findFirst({ where: eq(reports.id, id) });
    if (!current) return { ok: false, error: "Laporan tidak ditemukan" };
    before = (await reportImageUrls(id)).all;
    slug = current.slug; // slug tetap supaya link lama tidak rusak
    await db.update(reports).set({ ...data, updatedAt: new Date() }).where(eq(reports.id, id));
    await db.delete(reportSteps).where(eq(reportSteps.reportId, id));
  } else {
    slug = await uniqueSlug(slugBase);
    id = crypto.randomUUID();
    await db.insert(reports).values({ ...data, id, slug });
  }

  const rows = [
    ...steps.map((s, i) => ({ ...s, kind: "step" as const, reportId: id!, position: i })),
    ...exercises.map((s, i) => ({ ...s, kind: "exercise" as const, reportId: id!, position: i })),
  ];
  if (rows.length) await db.insert(reportSteps).values(rows);

  // hapus file gambar yang sudah tidak dipakai laporan ini
  const after = new Set([data.coverUrl, ...stepUrls(steps), ...stepUrls(exercises)].filter(Boolean) as string[]);
  await deleteImages(before.filter((u) => !after.has(u)));

  revalidatePath("/", "layout");
  return { ok: true, id: id!, slug };
}

export async function deleteReport(id: string) {
  await requireAdmin();
  const { all } = await reportImageUrls(id);
  await db.delete(reportSteps).where(eq(reportSteps.reportId, id));
  await db.delete(reports).where(eq(reports.id, id));
  await deleteImages(all);
  revalidatePath("/", "layout");
}

export async function setReportStatus(id: string, status: "draft" | "published") {
  await requireAdmin();
  await db.update(reports).set({ status, updatedAt: new Date() }).where(eq(reports.id, id));
  revalidatePath("/", "layout");
}

/* ---------- Galeri ---------- */

export async function addGalleryItems(items: { url: string; width: number; height: number }[]) {
  await requireAdmin();
  if (!items.length) return;
  await db.insert(gallery).values(items.map((i) => ({ url: i.url, width: i.width, height: i.height })));
  revalidatePath("/", "layout");
}

export async function updateGalleryCaption(id: string, caption: string) {
  await requireAdmin();
  await db.update(gallery).set({ caption: caption.slice(0, 200) }).where(eq(gallery.id, id));
  revalidatePath("/", "layout");
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();
  const row = await db.query.gallery.findFirst({ where: eq(gallery.id, id) });
  await db.delete(gallery).where(eq(gallery.id, id));
  await deleteImages([row?.url]);
  revalidatePath("/", "layout");
}

/* ---------- Pesan ---------- */

export async function setMessageRead(id: string, isRead: boolean) {
  await requireAdmin();
  await db.update(messages).set({ isRead }).where(eq(messages.id, id));
  revalidatePath("/admin", "layout");
}

export async function markAllRead() {
  await requireAdmin();
  await db.update(messages).set({ isRead: true }).where(eq(messages.isRead, false));
  revalidatePath("/admin", "layout");
}

export async function deleteMessages(ids: string[]) {
  await requireAdmin();
  if (!ids.length) return;
  await db.delete(messages).where(inArray(messages.id, ids));
  revalidatePath("/admin", "layout");
}

/* ---------- Portofolio ---------- */

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Judul wajib diisi").max(120),
  description: z.string().max(1000).default(""),
  category: z.string().trim().min(1).max(40),
  imageUrl: imageUrl.nullable(),
  link: httpUrl.nullable(),
  repo: httpUrl.nullable(),
  tags: z.array(z.string().trim().max(30)).max(12).default([]),
});
export type ProjectPayload = z.input<typeof projectSchema>;

export async function saveProject(payload: ProjectPayload): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const p = projectSchema.safeParse(payload);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message };
  const { id, ...data } = p.data;
  const clean = { ...data, link: data.link || null, repo: data.repo || null };
  if (id) {
    const old = await db.query.projects.findFirst({ where: eq(projects.id, id) });
    await db.update(projects).set(clean).where(eq(projects.id, id));
    if (old?.imageUrl && old.imageUrl !== clean.imageUrl) await deleteImages([old.imageUrl]);
  } else await db.insert(projects).values(clean);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const old = await db.query.projects.findFirst({ where: eq(projects.id, id) });
  await db.delete(projects).where(eq(projects.id, id));
  await deleteImages([old?.imageUrl]);
  revalidatePath("/", "layout");
}

/* ---------- Timeline organisasi / kepanitiaan ---------- */

const timelineSchema = z.object({
  id: z.string().optional(),
  role: z.string().trim().min(2, "Jabatan wajib diisi").max(120),
  organization: z.string().trim().min(2, "Organisasi/acara wajib diisi").max(160),
  type: z.enum(["organisasi", "kepanitiaan", "lainnya"]),
  period: z.string().trim().min(2, "Periode wajib diisi").max(60),
  startKey: z.number().int().min(0).max(999912),
  description: z.string().max(600).default(""),
});
export type TimelinePayload = z.input<typeof timelineSchema>;

export async function saveTimeline(payload: TimelinePayload): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const p = timelineSchema.safeParse(payload);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message };
  const { id, ...data } = p.data;
  if (id) await db.update(timeline).set(data).where(eq(timeline.id, id));
  else await db.insert(timeline).values(data);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTimeline(id: string) {
  await requireAdmin();
  await db.delete(timeline).where(eq(timeline.id, id));
  revalidatePath("/", "layout");
}

/* ---------- Profil ---------- */

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  handle: z.string().trim().max(40),
  headline: z.string().trim().max(120),
  tagline: z.string().trim().max(240),
  heroPhoto: imageUrl.or(z.literal("")),
  aboutPhoto: imageUrl.or(z.literal("")),
  contactPhoto: imageUrl.or(z.literal("")),
  about: z.string().max(4000),
  education: z.object({ degree: z.string().max(120), school: z.string().max(120), period: z.string().max(60), gpa: z.string().max(20) }),
  skills: z.array(z.object({ group: z.string().max(60), items: z.string().max(240), icons: z.array(z.string().max(30)).max(4) })).max(10),
  services: z.array(z.object({ icon: z.enum(["code", "camera", "pen", "phone", "globe", "layers"]), label: z.string().max(60) })).max(8),
  email: z.string().max(120),
  phone: z.string().max(40),
  location: z.string().max(120),
  github: httpUrl,
  instagram: httpUrl,
  linkedin: httpUrl,
});

export async function saveProfile(payload: Profile): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const p = profileSchema.safeParse({ ...defaultProfile, ...payload });
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  const old = await getProfile();
  await db
    .insert(settings)
    .values({ key: "profile", value: p.data })
    .onDuplicateKeyUpdate({ set: { value: p.data } });
  const keep = new Set([p.data.heroPhoto, p.data.aboutPhoto, p.data.contactPhoto]);
  await deleteImages([old.heroPhoto, old.aboutPhoto, old.contactPhoto].filter((u) => u && !keep.has(u)));
  revalidatePath("/", "layout");
  return { ok: true };
}
