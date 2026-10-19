import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { pool } from "@/db";
import type { RowDataPacket } from "mysql2";
import { IMG_WIDTHS } from "./images";

// hemat memori untuk shared hosting
sharp.concurrency(1);
sharp.cache(false);

const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads");
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
/** STORAGE_DRIVER=db -> foto disimpan di tabel MySQL (media_files). Cocok untuk Hostinger Node.js Web Apps karena
 *  folder aplikasi ditimpa saat deploy, sedangkan database tidak. Default: disimpan di folder UPLOAD_DIR. */
export const useDb = () => !useBlob() && (process.env.STORAGE_DRIVER ?? "").toLowerCase() === "db";
export const storageDriver = () => (useBlob() ? "blob" : useDb() ? "db" : "disk");

export type SavedImage = { url: string; width: number; height: number };

/** "abc_r-w960.webp" -> "abc_r.webp" (nama file master) */
export const masterName = (file: string) => file.replace(/-w\d+\.webp$/, ".webp");
export const variantNames = (master: string) =>
  /_r\.webp$/.test(master) ? IMG_WIDTHS.map((w) => master.replace(/_r\.webp$/, `_r-w${w}.webp`)) : [];
/** Nama file dari sebuah URL milik kita (lokal atau Vercel Blob); null jika URL asing. */
export function ownFileName(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("/media/")) return url.slice(7);
  if (/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\/uploads\//.test(url)) return url.split("/").pop() ?? null;
  return null;
}

async function putFile(name: string, data: Buffer) {
  if (useBlob()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, data, { access: "public", contentType: "image/webp", addRandomSuffix: false });
    return blob.url;
  }
  if (useDb()) {
    await pool.query("INSERT INTO media_files (name, data, created_at) VALUES (?, ?, UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE data = VALUES(data)", [name, data]);
    return `/media/${name}`;
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), data);
  return `/media/${name}`;
}

/**
 * Simpan 1 foto: file master (maks 2560px, WebP kualitas 86) + 3 varian kecil (480/960/1600px)
 * supaya kartu/thumbnail memuat versi ringan sementara foto penuh tetap tajam.
 */
export async function saveImage(file: File): Promise<SavedImage> {
  const input = Buffer.from(await file.arrayBuffer());
  // validasi isi file yang sebenarnya (bukan hanya ekstensi/MIME dari browser); tolak SVG & format lain
  const meta = await sharp(input, { limitInputPixels: 120_000_000 }).metadata();
  if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) throw new Error("Format gambar tidak didukung (gunakan JPG, PNG, atau WebP)");
  const base = sharp(input, { failOn: "none", limitInputPixels: 120_000_000 }).rotate();
  const id = `${Date.now().toString(36)}${crypto.randomUUID().slice(0, 8)}`;
  const masterFile = `${id}_r.webp`;

  const master = await base
    .clone()
    .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, effort: 4, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });

  const url = await putFile(masterFile, master.data);

  // berurutan (bukan paralel) agar pemakaian memori tetap rendah
  for (const w of IMG_WIDTHS) {
    const buf = await base.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toBuffer();
    await putFile(masterFile.replace(/_r\.webp$/, `_r-w${w}.webp`), buf);
  }

  return { url, width: master.info.width, height: master.info.height };
}

/** Hapus file master + semua varian dari disk / Blob. Aman dipanggil untuk URL asing (diabaikan). */
export async function deleteImage(url: string | null | undefined) {
  const name = ownFileName(url);
  if (!name) return;
  const master = masterName(name);
  const names = [master, ...variantNames(master)];
  try {
    if (useBlob() && url!.startsWith("http")) {
      const { del } = await import("@vercel/blob");
      const dir = url!.slice(0, url!.lastIndexOf("/") + 1);
      await del(names.map((n) => dir + n));
    } else {
      if (useDb()) await pool.query("DELETE FROM media_files WHERE name IN (?)", [names]);
      await Promise.all(names.map((n) => fs.unlink(path.join(UPLOAD_DIR, n)).catch(() => {})));
    }
  } catch (e) {
    console.error("deleteImage gagal:", e);
  }
}

export async function deleteImages(urls: (string | null | undefined)[]) {
  await Promise.all(Array.from(new Set(urls.filter(Boolean))).map((u) => deleteImage(u)));
}

/** Daftar semua file di penyimpanan beserta umurnya (untuk pembersihan file yatim). */
export async function listStoredFiles(): Promise<{ name: string; url: string; ageMs: number }[]> {
  const now = Date.now();
  if (useBlob()) {
    const { list } = await import("@vercel/blob");
    const out: { name: string; url: string; ageMs: number }[] = [];
    let cursor: string | undefined;
    do {
      const r = await list({ prefix: "uploads/", cursor });
      for (const b of r.blobs) out.push({ name: b.pathname.split("/").pop()!, url: b.url, ageMs: now - new Date(b.uploadedAt).getTime() });
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    return out;
  }
  if (useDb()) {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT name, TIMESTAMPDIFF(SECOND, created_at, UTC_TIMESTAMP()) AS age FROM media_files");
    return rows.map((r) => ({ name: r.name as string, url: `/media/${r.name}`, ageMs: Number(r.age) * 1000 }));
  }
  try {
    const names = await fs.readdir(UPLOAD_DIR);
    return await Promise.all(
      names.filter((n) => n.endsWith(".webp")).map(async (name) => {
        const st = await fs.stat(path.join(UPLOAD_DIR, name));
        return { name, url: `/media/${name}`, ageMs: now - st.mtimeMs };
      }),
    );
  } catch {
    return [];
  }
}

export async function deleteStoredFile(f: { name: string; url: string }) {
  if (useBlob()) {
    const { del } = await import("@vercel/blob");
    await del(f.url);
  } else if (useDb()) {
    await pool.query("DELETE FROM media_files WHERE name = ?", [f.name]);
  } else {
    await fs.unlink(path.join(UPLOAD_DIR, f.name)).catch(() => {});
  }
}

/** Baca foto untuk route /media. Mencoba driver aktif dulu, lalu yang lain (supaya foto lama tetap tampil bila driver diganti). */
export async function readStoredImage(name: string): Promise<Buffer | null> {
  if (!/^[\w.-]+\.webp$/.test(name)) return null;
  const fromDisk = () => fs.readFile(path.join(UPLOAD_DIR, name)).catch(() => null);
  const fromDb = async () => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT data FROM media_files WHERE name = ? LIMIT 1", [name]);
      return rows[0] ? (rows[0].data as Buffer) : null;
    } catch { return null; }
  };
  return useDb() ? (await fromDb()) ?? (await fromDisk()) : (await fromDisk()) ?? (await fromDb());
}
