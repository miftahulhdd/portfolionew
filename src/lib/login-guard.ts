import "server-only";
import { and, count, eq, gt, lt, min } from "drizzle-orm";
import { db, loginAttempts } from "@/db";

const WINDOW_MS = 15 * 60 * 1000;
export const MAX_PER_IP = 5; // gagal login per IP per 15 menit
export const MAX_GLOBAL = 30; // gagal login dari SEMUA IP per 15 menit (melawan penyerang yang ganti-ganti IP)

/** Cek apakah login boleh dicoba. Mengembalikan sisa menit blokir jika diblokir. */
export async function loginBlockedMinutes(ip: string): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS);
  await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(Date.now() - 24 * 3600_000))).catch(() => {});

  const [perIp] = await db.select({ n: count(), first: min(loginAttempts.createdAt) }).from(loginAttempts).where(and(eq(loginAttempts.ip, ip), gt(loginAttempts.createdAt, since)));
  if (Number(perIp.n) >= MAX_PER_IP) return Math.max(1, Math.ceil((new Date(perIp.first ?? Date.now()).getTime() + WINDOW_MS - Date.now()) / 60000));

  const [all] = await db.select({ n: count(), first: min(loginAttempts.createdAt) }).from(loginAttempts).where(gt(loginAttempts.createdAt, since));
  if (Number(all.n) >= MAX_GLOBAL) return Math.max(1, Math.ceil((new Date(all.first ?? Date.now()).getTime() + WINDOW_MS - Date.now()) / 60000));
  return 0;
}

export async function recordLoginFailure(ip: string) {
  await db.insert(loginAttempts).values({ ip });
}

export async function clearLoginFailures(ip: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.ip, ip));
}
