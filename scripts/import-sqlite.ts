// Memindahkan data dari database SQLite lama (data/app.db) ke MySQL.
// Pakai:  npm run db:import-sqlite -- ./data/app.db [./uploads]
// Argumen ke-2 (opsional): folder uploads lama; isinya ikut dimasukkan ke database (untuk STORAGE_DRIVER=db).
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { pool } from "../src/db";
import { ensureSchema } from "../src/db/setup";

const file = process.argv[2] ?? "./data/app.db";
const uploadsDir = process.argv[3];
const src = createClient({ url: `file:${file}` });

const parse = (v: unknown, fallback: unknown) => {
  if (typeof v !== "string") return v ?? fallback;
  try { return JSON.parse(v); } catch { return fallback; }
};
const date = (v: unknown) => new Date(typeof v === "number" ? v * 1000 : String(v));

type Row = Record<string, unknown>;
const tables: { name: string; cols: string[]; map: (r: Row) => unknown[] }[] = [
  { name: "settings", cols: ["key", "value"], map: (r) => [r.key, JSON.stringify(parse(r.value, {}))] },
  { name: "projects", cols: ["id", "title", "description", "category", "image_url", "link", "repo", "tags", "sort_order", "created_at"],
    map: (r) => [r.id, r.title, r.description ?? "", r.category, r.image_url ?? null, r.link ?? null, r.repo ?? null, JSON.stringify(parse(r.tags, [])), r.sort_order ?? 0, date(r.created_at)] },
  { name: "timeline", cols: ["id", "role", "organization", "type", "period", "start_key", "description"],
    map: (r) => [r.id, r.role, r.organization, r.type, r.period, r.start_key ?? 0, r.description ?? ""] },
  { name: "reports", cols: ["id", "slug", "title", "course", "number", "summary", "intro", "objective", "conclusion", "cover_url", "status", "created_at", "updated_at"],
    map: (r) => [r.id, r.slug, r.title, r.course, r.number ?? null, r.summary ?? "", r.intro ?? "", r.objective ?? "", r.conclusion ?? "", r.cover_url ?? null, r.status, date(r.created_at), date(r.updated_at)] },
  { name: "report_steps", cols: ["id", "report_id", "kind", "position", "title", "body", "images", "codes"],
    map: (r) => [r.id, r.report_id, r.kind ?? "step", r.position ?? 0, r.title, r.body ?? "", JSON.stringify(parse(r.images, [])), JSON.stringify(parse(r.codes, []))] },
  { name: "gallery", cols: ["id", "url", "caption", "width", "height", "created_at"],
    map: (r) => [r.id, r.url, r.caption ?? "", r.width ?? 1200, r.height ?? 800, date(r.created_at)] },
  { name: "messages", cols: ["id", "name", "email", "phone", "subject", "message", "is_read", "created_at"],
    map: (r) => [r.id, r.name, r.email, r.phone ?? null, r.subject, r.message, r.is_read ? 1 : 0, date(r.created_at)] },
];

async function main() {
  await ensureSchema();
  for (const t of tables) {
    const { rows } = await src.execute(`SELECT * FROM ${t.name}`);
    let n = 0;
    for (const r of rows) {
      const q = `INSERT IGNORE INTO \`${t.name}\` (${t.cols.map((c) => `\`${c}\``).join(",")}) VALUES (${t.cols.map(() => "?").join(",")})`;
      const [res] = await pool.query(q, t.map(r as Row));
      n += (res as { affectedRows: number }).affectedRows;
    }
    console.log(`${t.name}: ${n}/${rows.length} baris dipindahkan`);
  }
  if (uploadsDir) {
    let n = 0;
    for (const name of fs.readdirSync(uploadsDir).filter((f) => f.endsWith(".webp"))) {
      const [res] = await pool.query("INSERT IGNORE INTO media_files (name, data, created_at) VALUES (?, ?, UTC_TIMESTAMP())", [name, fs.readFileSync(path.join(uploadsDir, name))]);
      n += (res as { affectedRows: number }).affectedRows;
    }
    console.log(`foto: ${n} file dimasukkan ke database`);
  }
  // tandai agar data awal (seed) tidak ditambahkan lagi
  await pool.query("INSERT IGNORE INTO `settings` (`key`,`value`) VALUES ('seeded', 'true')");
  console.log("Selesai. Salin juga isi folder uploads lama ke folder UPLOAD_DIR yang baru.");
}

main().catch((e) => { console.error("Gagal:", e.message); process.exitCode = 1; }).finally(() => pool.end());
