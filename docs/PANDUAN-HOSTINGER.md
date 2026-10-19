# Panduan Database MySQL & Hosting Hostinger (dari nol)

Panduan ini untuk paket **Hostinger Business (shared hosting)** dengan fitur **Node.js Web Apps** dan **MySQL + phpMyAdmin**.

## 0. Konsep singkat
- **Database MySQL** = tempat data (profil, proyek, laporan, pesan kontak, bahkan foto) disimpan. Aplikasi terhubung lewat 5 data: host, port, nama DB, user, password.
- **phpMyAdmin** = "jendela" web untuk melihat/mengubah isi database.
- **Node.js Web App** = cara Hostinger menjalankan Next.js. Folder aplikasi **ditimpa setiap deploy**, karena itu foto disimpan di database (`STORAGE_DRIVER=db`), bukan di folder.

## 1. Buat database di hPanel
1. hPanel → **Databases → Management** (MySQL Databases).
2. Isi **nama database**, **username**, **password** (kuat!) → **Create**.
3. Catat: nama DB & user biasanya berawalan `u123456789_`. Host: `localhost`, port: `3306`.
4. Klik **Enter phpMyAdmin** untuk mengecek. Tabel akan muncul sendiri setelah aplikasi jalan pertama kali (otomatis). 
   *Opsional:* impor manual `database/schema.sql` lewat phpMyAdmin → tab **Import**.

## 2. Siapkan kode
1. Salin `.env.example` → `.env.local` untuk dev lokal (lihat bagian 6).
2. Buat hash password admin: `npm run hash-password -- "passwordku-yang-kuat"` → salin baris `ADMIN_PASSWORD_HASH=...`.
3. Buat `AUTH_SECRET` acak panjang: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
4. Push ke GitHub (jangan commit `.env.local`), atau siapkan zip tanpa `node_modules`, `.next`, `.env.local`.

## 3. Deploy Node.js Web App
1. hPanel → **Websites → Add website → Node.js Apps** (Node.js Web App).
2. Pilih **Import Git repository** (atau upload zip). Framework: Next.js, **Node 22**.
3. Build command: `npm run build` · Start command: `npm start`.
4. Isi **Environment variables** (bagian 4), lalu **Deploy**.
5. Hubungkan domain; pastikan **SSL/HTTPS aktif**.

## 4. Environment variables di dashboard
| Nama | Isi |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `u123456789_portfolio` (punyamu) |
| `DB_USER` | `u123456789_user` |
| `DB_PASSWORD` | password DB |
| `ADMIN_USERNAME` | username admin |
| `ADMIN_PASSWORD_HASH` | hasil `npm run hash-password` |
| `AUTH_SECRET` | string acak panjang |
| `STORAGE_DRIVER` | `db` |
| `NEXT_PUBLIC_SITE_URL` | `https://domainmu.com` |

Setelah mengubah variabel, **redeploy/restart** aplikasi. Saat start pertama, tabel dibuat otomatis dan data awal diisi (log: `[db] siap`).

## 5. Setelah online
- Buka `/admin/login`, masuk, cek panel **peringatan** di dashboard (harus kosong/hijau).
- Isi Profil, unggah foto, tambah proyek & laporan.
- **Backup**: phpMyAdmin → pilih database → **Export → Quick → SQL**. Lakukan rutin (foto ikut tersimpan karena ada di database).

## 6. Pengembangan lokal
Pasang XAMPP/Laragon, jalankan MySQL, buat DB kosong (`CREATE DATABASE portfolio CHARACTER SET utf8mb4;`), isi `.env.local`, lalu `npm install`, `npm run setup`, `npm run dev`. Cek koneksi: `npm run db:check`.

## 7. Memindahkan data SQLite lama
`npm run db:import-sqlite -- ./data/app.db ./uploads` (argumen kedua = folder foto lama, ikut dimasukkan ke database).

## 8. Masalah umum
| Gejala | Solusi |
|---|---|
| `ER_ACCESS_DENIED_ERROR` | User/password salah, atau user belum diberi akses ke DB itu |
| `ER_BAD_DB_ERROR` | Nama database salah (ingat awalan `u123…_`) |
| `ECONNREFUSED` | Host/port salah; coba `localhost` atau `127.0.0.1` |
| Login ditolak terus | Terkunci 15 menit setelah 5 kali salah; tunggu |
| Hash password tidak terbaca | Pastikan utuh tanpa spasi; formatnya `scrypt:...:...` |
| Edit "tersimpan" tapi kembali ke awal / error `tags.join` | Jalankan `npm run db:check`; harus muncul `Uji simpan-baca JSON: OK` |
| Foto hilang setelah deploy | `STORAGE_DRIVER` harus `db` |

## 9. Keamanan (sudah diterapkan)
Blokir login setelah 5 kali salah (tersimpan di DB, tahan restart) + batas global, hash password scrypt, cookie sesi httpOnly/strict, header keamanan (CSP, HSTS, dll.), validasi URL & unggahan gambar, honeypot + rate limit form kontak, area admin noindex.
Yang tetap tugasmu: password kuat, HTTPS, backup rutin, jaga `AUTH_SECRET` tetap rahasia.

## 10. Batasan jujur
Aplikasi di shared hosting bisa berhenti saat idle (request pertama lebih lambat). Batas ukuran database/koneksi mengikuti paketmu dan belum saya verifikasi; foto di database memakai kuota itu (foto sudah dikompres WebP). Cek di hPanel bila ragu.
