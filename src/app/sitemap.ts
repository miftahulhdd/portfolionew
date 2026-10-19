import type { MetadataRoute } from "next";
import { getPublishedReports } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  let reports: { slug: string; updatedAt: Date }[] = [];
  try { reports = await getPublishedReports(); } catch {}
  return [
    { url: site, changeFrequency: "monthly", priority: 1 },
    { url: `${site}/reports`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site}/gallery`, changeFrequency: "monthly", priority: 0.5 },
    ...reports.map((r) => ({ url: `${site}/reports/${r.slug}`, lastModified: r.updatedAt, priority: 0.7 })),
  ];
}
