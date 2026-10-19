import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const g = globalThis as unknown as { __pool?: mysql.Pool };

function makePool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: "utf8mb4",
    timezone: "Z", // simpan & baca waktu sebagai UTC
    waitForConnections: true,
    connectionLimit: 5, // shared hosting membatasi jumlah koneksi per akun
    queueLimit: 0,
    enableKeepAlive: true,
    connectTimeout: 10_000,
  });
}

export const pool = g.__pool ?? makePool();
if (process.env.NODE_ENV !== "production") g.__pool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
export * from "./schema";
