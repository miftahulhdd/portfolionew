import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "@/db";
import { storageDriver } from "./storage";

export type Check = { level: "ok" | "warn" | "error"; text: string };

/** Pemeriksaan cepat konfigurasi yang sering bikin masalah di hosting. Ditampilkan di dashboard admin. */
export async function runChecks(): Promise<Check[]> {
  const out: Check[] = [];
  const prod = process.env.NODE_ENV === "production";

  try {
    await pool.query("SELECT 1");
    out.push({ level: "ok", text: "Database MySQL terhubung." });
  } catch {
    out.push({ level: "error", text: "Database tidak bisa dihubungi. Periksa DB_HOST, DB_NAME, DB_USER, DB_PASSWORD." });
  }

  const up = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads");
  const driver = storageDriver();
  if (driver === "blob") {
    out.push({ level: "ok", text: "Foto disimpan di Vercel Blob." });
  } else if (driver === "db") {
    out.push({ level: "ok", text: "Foto disimpan di database MySQL (STORAGE_DRIVER=db), aman dari deploy ulang." });
  } else {
    try {
      await fs.mkdir(up, { recursive: true });
      await fs.access(up, fs.constants.W_OK);
      const inside = up.startsWith(process.cwd() + path.sep) || up === process.cwd();
      out.push(inside && prod
        ? { level: "warn", text: `Folder upload (${up}) berada di dalam folder aplikasi. Di Hostinger isi folder aplikasi ditimpa saat deploy ulang, jadi foto bisa hilang. Set STORAGE_DRIVER=db, atau pindahkan UPLOAD_DIR ke luar folder aplikasi.` }
        : { level: "ok", text: `Folder upload bisa ditulis (${up}).` });
    } catch {
      out.push({ level: "error", text: `Folder upload (${up}) tidak bisa ditulis. Foto tidak akan bisa diunggah.` });
    }
  }

  const secret = process.env.AUTH_SECRET ?? "";
  if (secret.length < 32 || /ganti-dengan|dev-secret/.test(secret)) out.push({ level: prod ? "error" : "warn", text: "AUTH_SECRET masih contoh/terlalu pendek. Buat baru: openssl rand -base64 32" });

  const pw = process.env.ADMIN_PASSWORD ?? "";
  if (process.env.ADMIN_PASSWORD_HASH) out.push({ level: "ok", text: "Password admin disimpan sebagai hash." });
  else if (!pw || /ganti-dengan/.test(pw) || pw.length < 12) out.push({ level: prod ? "error" : "warn", text: "Password admin lemah (minimal 12 karakter). Lebih baik pakai ADMIN_PASSWORD_HASH (npm run hash-password)." });
  else out.push({ level: "warn", text: "Password admin disimpan sebagai teks biasa di environment. Disarankan pakai ADMIN_PASSWORD_HASH (npm run hash-password)." });

  if (prod && !(process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://")) out.push({ level: "warn", text: "NEXT_PUBLIC_SITE_URL belum https://. Pastikan situs memakai HTTPS (SSL)." });
  return out;
}
