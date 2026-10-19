import { pool } from "../src/db";
import { seedOnce } from "../src/db/setup";

seedOnce()
  .then((did) => console.log(did ? "Data awal dimasukkan." : "Data awal sudah pernah dimasukkan (dilewati)."))
  .catch((e) => { console.error("Gagal:", e.message); process.exitCode = 1; })
  .finally(() => pool.end());
