import { pool } from "../src/db";
import { ensureSchema } from "../src/db/setup";

ensureSchema()
  .then(() => console.log("Tabel siap."))
  .catch((e) => { console.error("Gagal:", e.message); process.exitCode = 1; })
  .finally(() => pool.end());
