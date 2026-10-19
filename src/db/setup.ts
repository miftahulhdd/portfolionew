import { count, eq } from "drizzle-orm";
import { db, pool, settings, timeline } from "./index";
import { DDL } from "./ddl";
import { defaultProfile } from "../lib/profile";

/** Buat tabel yang belum ada (aman dijalankan berulang). */
export async function ensureSchema() {
  for (const sql of DDL) await pool.query(sql);
}

/** Isi data awal SEKALI saja (ditandai di tabel settings), jadi data yang kamu hapus tidak muncul lagi. */
export async function seedOnce() {
  const done = await db.select().from(settings).where(eq(settings.key, "seeded")).limit(1);
  if (done.length) return false;

  await db.insert(settings).values({ key: "profile", value: defaultProfile }).onDuplicateKeyUpdate({ set: { key: "profile" } });

  const [{ n }] = await db.select({ n: count() }).from(timeline);
  if (n === 0) {
    await db.insert(timeline).values([
      { role: "Wakil Ketua", organization: "Himpunan Mahasiswa Informatika, Universitas Andalas", type: "organisasi", period: "Jun 2024 – Sep 2026", startKey: 202406, description: "" },
      { role: "Staf Divisi Acara", organization: "BAKTI FTI 2026", type: "kepanitiaan", period: "Agu 2026", startKey: 202608, description: "Orientasi Fakultas Teknologi Informasi." },
      { role: "Tim Media", organization: "BAKTI Departemen Informatika", type: "kepanitiaan", period: "Agu 2025 & Agu 2026", startKey: 202508, description: "" },
      { role: "Koordinator Divisi Kedisiplinan & Kesehatan", organization: "LKMM-TD FTI 2025", type: "kepanitiaan", period: "Sep 2025", startKey: 202509, description: "" },
      { role: "Staf Media", organization: "FESTIKA 2025 & 2026", type: "kepanitiaan", period: "Mei 2025 & Mei 2026", startKey: 202505, description: "" },
    ]);
  }
  await db.insert(settings).values({ key: "seeded", value: true }).onDuplicateKeyUpdate({ set: { value: true } });
  return true;
}

export async function setupDatabase() {
  await ensureSchema();
  await seedOnce();
}
