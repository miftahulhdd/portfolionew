// Dijalankan Next.js satu kali saat server start: membuat tabel + data awal bila belum ada.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  try {
    const { setupDatabase } = await import("./db/setup");
    await setupDatabase();
    console.log("[db] siap");
  } catch (e) {
    console.error("[db] setup gagal — periksa DB_HOST/DB_NAME/DB_USER/DB_PASSWORD:", (e as Error).message);
  }
}
