import "server-only";
import { db, gallery, projects, reports, reportSteps } from "@/db";
import { getProfile } from "./profile";
import { deleteStoredFile, listStoredFiles, masterName, ownFileName } from "./storage";

let lastRun = 0;

/**
 * Hapus file di uploads yang tidak dipakai di database lagi (mis. foto yang di-upload
 * di editor lalu dibatalkan). File yang lebih muda dari `graceMs` tidak disentuh,
 * supaya foto yang sedang kamu edit tidak ikut terhapus.
 */
export async function sweepOrphans({ graceMs = 6 * 3600_000, force = false } = {}) {
  if (!force && Date.now() - lastRun < 3600_000) return 0;
  lastRun = Date.now();

  const used = new Set<string>();
  const add = (u: string | null | undefined) => {
    const n = ownFileName(u);
    if (n) used.add(masterName(n));
  };

  const [g, p, r, s, profile] = await Promise.all([
    db.select({ u: gallery.url }).from(gallery),
    db.select({ u: projects.imageUrl }).from(projects),
    db.select({ u: reports.coverUrl }).from(reports),
    db.select({ i: reportSteps.images }).from(reportSteps),
    getProfile(),
  ]);
  g.forEach((x) => add(x.u));
  p.forEach((x) => add(x.u));
  r.forEach((x) => add(x.u));
  s.forEach((x) => x.i.forEach((im) => add(im.url)));
  add(profile.heroPhoto);
  add(profile.aboutPhoto);
  add(profile.contactPhoto);

  let removed = 0;
  for (const f of await listStoredFiles()) {
    if (f.ageMs < graceMs) continue;
    if (used.has(masterName(f.name))) continue;
    await deleteStoredFile(f);
    removed++;
  }
  return removed;
}
