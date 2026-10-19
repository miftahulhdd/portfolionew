# Portofolio Huda — Next.js + MySQL

Next.js 16 (App Router), Tailwind v4, MySQL (mysql2 + drizzle-orm), dashboard admin.

## Mulai cepat
```bash
npm install
cp .env.example .env.local   # isi DB_*, ADMIN_*, AUTH_SECRET
npm run setup                # buat tabel + data awal (juga otomatis saat server start)
npm run dev
```
Admin: `/admin/login`.

## Skrip
`db:check` tes koneksi · `db:migrate` buat tabel · `db:seed` data awal · `db:export-sql` tulis `database/schema.sql` · `db:import-sqlite -- ./data/app.db [./uploads]` · `hash-password -- "pw"`.

## Env penting
`DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD` · `ADMIN_USERNAME` · `ADMIN_PASSWORD_HASH` (atau `ADMIN_PASSWORD`, kurang aman) · `AUTH_SECRET` · `STORAGE_DRIVER` (`db` | `disk` | `blob`) · `NEXT_PUBLIC_SITE_URL`.

## Favicon
Taruh `src/app/favicon.ico` (48×48), `src/app/icon.png` (512×512), `src/app/apple-icon.png` (180×180).

## Hosting
Lihat `docs/PANDUAN-HOSTINGER.md` (dari nol, Hostinger Business).

## Keamanan
Lockout login tersimpan di DB, scrypt, JWT dengan fingerprint kredensial, CSP & header keamanan, validasi URL/unggahan, rate limit kontak.
