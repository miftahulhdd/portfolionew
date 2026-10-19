import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, gallery, messages, projects, reports, reportSteps, timeline } from "@/db";

export const getProjects = () => db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.createdAt));
export const getTimeline = () => db.select().from(timeline).orderBy(desc(timeline.startKey));
export const getGallery = (limit?: number) => {
  const q = db.select().from(gallery).orderBy(desc(gallery.createdAt));
  return limit ? q.limit(limit) : q;
};

export const getPublishedReports = (limit?: number) => {
  const q = db
    .select()
    .from(reports)
    .where(eq(reports.status, "published"))
    .orderBy(desc(reports.createdAt));
  return limit ? q.limit(limit) : q;
};

export async function getReportBySlug(slug: string, opts: { includeDraft?: boolean } = {}) {
  const report = await db.query.reports.findFirst({
    where: opts.includeDraft ? eq(reports.slug, slug) : and(eq(reports.slug, slug), eq(reports.status, "published")),
  });
  if (!report) return null;
  const steps = await db.select().from(reportSteps).where(eq(reportSteps.reportId, report.id)).orderBy(asc(reportSteps.position));
  return { report, steps };
}

export async function getReportById(id: string) {
  const report = await db.query.reports.findFirst({ where: eq(reports.id, id) });
  if (!report) return null;
  const steps = await db.select().from(reportSteps).where(eq(reportSteps.reportId, id)).orderBy(asc(reportSteps.position));
  return { report, steps };
}

export const getAllReports = () => db.select().from(reports).orderBy(desc(reports.createdAt));
export const getMessages = () => db.select().from(messages).orderBy(desc(messages.createdAt));

export async function getStats() {
  const count = async (t: typeof reports | typeof gallery | typeof messages | typeof projects, where?: ReturnType<typeof eq>) => {
    const r = await db.select({ n: sql<number>`count(*)` }).from(t).where(where);
    return Number(r[0]?.n ?? 0);
  };
  return {
    reports: await count(reports),
    published: await count(reports, eq(reports.status, "published")),
    gallery: await count(gallery),
    projects: await count(projects),
    messages: await count(messages),
    unread: await count(messages, eq(messages.isRead, false)),
  };
}
