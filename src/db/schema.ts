import { boolean, customType, datetime, int, mysqlEnum, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

/**
 * Kolom JSON yang aman di MySQL maupun MariaDB/XAMPP.
 * MySQL mengembalikan objek yang sudah di-parse, MariaDB mengembalikan string — keduanya ditangani di sini.
 */
const json = <T = unknown>(name: string) =>
  customType<{ data: T; driverData: string | T }>({
    dataType: () => "json",
    toDriver: (v) => JSON.stringify(v),
    fromDriver: (v) => {
      if (typeof v !== "string") return v as T;
      try { return JSON.parse(v) as T; } catch { return v as unknown as T; }
    },
  })(name);

const id = () =>
  varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  datetime("created_at", { mode: "date", fsp: 0 })
    .notNull()
    .$defaultFn(() => new Date());
// Kolom TEXT/JSON di MySQL tidak boleh punya DEFAULT literal -> nilai awal diberikan dari aplikasi.
const longText = (name: string) => text(name).notNull().$defaultFn(() => "");

/** Satu baris per kunci; value berisi JSON (profil, penanda seed, dst). */
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: json<unknown>("value").notNull(),
});

export const projects = mysqlTable("projects", {
  id: id(),
  title: varchar("title", { length: 255 }).notNull(),
  description: longText("description"),
  category: varchar("category", { length: 60 }).notNull().default("Web"),
  imageUrl: varchar("image_url", { length: 500 }),
  link: varchar("link", { length: 500 }),
  repo: varchar("repo", { length: 500 }),
  tags: json<string[]>("tags").notNull().$defaultFn(() => []),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const timeline = mysqlTable("timeline", {
  id: id(),
  role: varchar("role", { length: 255 }).notNull(),
  organization: varchar("organization", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["organisasi", "kepanitiaan", "lainnya"]).notNull().default("organisasi"),
  period: varchar("period", { length: 100 }).notNull(),
  /** Untuk pengurutan: tahun*100+bulan mulai, mis. 202406 */
  startKey: int("start_key").notNull().default(0),
  description: longText("description"),
});

export const reports = mysqlTable("reports", {
  id: id(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  course: varchar("course", { length: 120 }).notNull(),
  number: int("number"),
  summary: longText("summary"),
  intro: longText("intro"),
  objective: longText("objective"),
  conclusion: longText("conclusion"),
  coverUrl: varchar("cover_url", { length: 500 }),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  createdAt: createdAt(),
  updatedAt: datetime("updated_at", { mode: "date", fsp: 0 })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type StepImage = { url: string; caption?: string };
export type StepCode = { filename?: string; language: string; code: string };

export const reportSteps = mysqlTable("report_steps", {
  id: id(),
  reportId: varchar("report_id", { length: 36 })
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  /** "step" = langkah praktikum, "exercise" = latihan/tugas praktikum */
  kind: mysqlEnum("kind", ["step", "exercise"]).notNull().default("step"),
  position: int("position").notNull().default(0),
  title: varchar("title", { length: 255 }).notNull(),
  body: longText("body"),
  images: json<StepImage[]>("images").notNull().$defaultFn(() => []),
  codes: json<StepCode[]>("codes").notNull().$defaultFn(() => []),
});

export const gallery = mysqlTable("gallery", {
  id: id(),
  url: varchar("url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 255 }).notNull().default(""),
  width: int("width").notNull().default(1200),
  height: int("height").notNull().default(800),
  createdAt: createdAt(),
});

export const messages = mysqlTable("messages", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 190 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: createdAt(),
});

/** Catatan percobaan login gagal (untuk memblokir brute force, tahan restart server). */
export const loginAttempts = mysqlTable("login_attempts", {
  id: int("id").autoincrement().primaryKey(),
  ip: varchar("ip", { length: 64 }).notNull(),
  createdAt: createdAt(),
});

export type Project = typeof projects.$inferSelect;
export type TimelineItem = typeof timeline.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type ReportStep = typeof reportSteps.$inferSelect;
export type GalleryItem = typeof gallery.$inferSelect;
export type Message = typeof messages.$inferSelect;
