// Pakai:  npm run hash-password -- "passwordKamu"
// Salin hasilnya ke ADMIN_PASSWORD_HASH di .env.local / environment variable Hostinger, lalu hapus ADMIN_PASSWORD.
import { randomBytes, scryptSync } from "node:crypto";

const pw = process.argv[2];
if (!pw || pw.length < 8) {
  console.error('Pakai: npm run hash-password -- "passwordKamu"   (minimal 8 karakter)');
  process.exit(1);
}
const salt = randomBytes(16);
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`);
