import { eq } from "drizzle-orm";
import { db, pool } from "../src/db";
import { settings } from "../src/db/schema";

(async () => {
  console.log(`Mencoba terhubung ke ${process.env.DB_USER}@${process.env.DB_HOST || "127.0.0.1"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME} ...`);
  const [rows] = await pool.query("SELECT VERSION() AS v, DATABASE() AS db");
  const r = (rows as { v: string; db: string }[])[0];
  console.log(`OK. Server: ${r.v}, database: ${r.db}`);
  const [t] = await pool.query("SHOW TABLES");
  console.log(`Jumlah tabel: ${(t as unknown[]).length}`);
  // uji simpan-baca data JSON (profil, tag proyek, dll.) — baris uji dihapus lagi
  try {
    await db.insert(settings).values({ key: "_selftest", value: { a: [1, 2], b: "x" } }).onDuplicateKeyUpdate({ set: { value: { a: [1, 2], b: "x" } } });
    const row = await db.query.settings.findFirst({ where: eq(settings.key, "_selftest") });
    const v = row?.value as { a?: unknown } | undefined;
    console.log(Array.isArray(v?.a) ? "Uji simpan-baca JSON: OK" : "Uji simpan-baca JSON: GAGAL (data tidak kembali sebagai objek)");
  } catch (e) {
    console.log("Uji simpan-baca JSON dilewati (tabel belum ada? jalankan npm run setup):", (e as Error).message.split("\n")[0]);
  } finally {
    await pool.query("DELETE FROM settings WHERE `key` = '_selftest'").catch(() => {});
  }
})()
  .catch((e: { code?: string; message: string }) => {
    console.error("GAGAL:", e.code ?? "", e.message);
    if (e.code === "ER_ACCESS_DENIED_ERROR") console.error("-> User/password salah, atau user belum diberi akses ke database itu.");
    if (e.code === "ECONNREFUSED" || e.code === "ETIMEDOUT") console.error("-> Host/port salah, atau MySQL tidak aktif / Remote MySQL belum mengizinkan IP ini.");
    if (e.code === "ER_BAD_DB_ERROR") console.error("-> Nama database tidak ada. Buat dulu di phpMyAdmin / hPanel.");
    process.exitCode = 1;
  })
  .finally(() => pool.end());
