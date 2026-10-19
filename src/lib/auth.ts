import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, scryptSync, timingSafeEqual } from "node:crypto";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 3; // sesi 3 hari

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET harus diisi (min 32 karakter) di .env.local");
  return new TextEncoder().encode(s);
}

/** Sidik jari kredensial: jika password diganti, semua sesi lama otomatis tidak berlaku. */
function credFingerprint() {
  return createHash("sha256")
    .update(`${process.env.ADMIN_USERNAME}|${process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD}|${process.env.AUTH_SECRET}`)
    .digest("hex")
    .slice(0, 16);
}

function safeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Format hash: scrypt:<salt hex>:<hash hex>  (buat dengan `npm run hash-password`). Tanpa tanda $ karena Next.js menganggap $ di file .env sebagai variabel. */
function verifyScrypt(password: string, stored: string) {
  const [alg, salt, hash] = stored.split(":");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, Buffer.from(salt, "hex"), expected.length);
  return safeEqual(actual, expected);
}

export function checkCredentials(username: string, password: string) {
  const u = process.env.ADMIN_USERNAME ?? "";
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const plain = process.env.ADMIN_PASSWORD ?? "";
  if (!u || (!hash && !plain)) return false;
  const okU = safeEqual(Buffer.from(username), Buffer.from(u));
  // selalu hitung password (waktu konstan) walau username salah
  const okP = hash ? verifyScrypt(password, hash) : safeEqual(Buffer.from(password), Buffer.from(plain));
  return okU && okP;
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin", fp: credFingerprint() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.role === "admin" && payload.fp === credFingerprint();
  } catch {
    return false;
  }
}

/** Panggil di awal setiap halaman/aksi admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
