# SiPinter
Aplikasi bantuan penilaian hasil tugas dan ujian mahasiswa

TIF Team  
Ketua Kelompok: Muhammad Fachry Alfareeza - 24/540199/TK/59922  
Anggota 1: Muhammad Ilkham Abdillah - 24/537977/TK/59653  
Anggota 2: Monica Anastasya Dantina - 24/544527/TK/60525  

## Arsitektur

Dokumentasi lengkap: [Arsitektur Sistem](docs/Moduls/architecture.md) · [Cara Menjalankan Proyek](docs/Moduls/how-to-run.md) · [Dokumentasi API](apps/api/API.md).

Monorepo npm workspaces:

| Folder | Isi |
| --- | --- |
| `apps/web` | Frontend Next.js (App Router, React, TypeScript, Tailwind CSS) |
| `apps/api` | Backend Express.js + TypeScript, akses PostgreSQL lewat `pg` (connection pool, query berparameter), validasi Zod |
| `database/migrations` | Migrasi SQL berurutan (`0001_*.sql`, `0002_*.sql`, ...) |
| `database/seeds` | Data contoh untuk development/test |
| `deploy/scripts` | Skrip operasional, mis. pembuatan user database least-privilege untuk AWS RDS |
| `docker-compose.dev.yml` | PostgreSQL lokal **khusus development** (produksi memakai AWS RDS) |

Browser hanya berbicara dengan satu origin. Request ke `/api/*` diteruskan ke Express oleh Next.js (rewrite di `apps/web/next.config.ts`) saat development, dan oleh Nginx saat produksi. Frontend tidak pernah terhubung langsung ke PostgreSQL.

## Prasyarat

- Node.js 22.12 atau lebih baru
- Docker (untuk database lokal)

## Menjalankan aplikasi (development)

```bash
cp .env.example .env     # nilai default sudah cocok dengan database Docker lokal
npm install
npm run db:up            # jalankan PostgreSQL lokal (port host 5433)
npm run db:migrate       # terapkan migrasi
npm run db:seed          # isi data contoh (menghapus data lama di database dev)
npm run dev              # API di http://localhost:4000, web di http://localhost:3000
```

Cek API: buka http://localhost:3000/api/health dan http://localhost:3000/api/health/db.

Akun hasil seed (password semuanya `sipinter-dev`, **khusus development**):

| Email | Role |
| --- | --- |
| `budi.santoso@example.com` | lecturer |
| `siti.rahmawati@example.com` | lecturer |
| `andi.pratama@example.com` | admin |

## Perintah

Semua perintah dijalankan dari root repository.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan API dan web bersamaan (`dev:api` / `dev:web` untuk salah satunya) |
| `npm run build` | Build semua workspace |
| `npm run lint` | ESLint semua workspace |
| `npm run typecheck` | Pemeriksaan tipe TypeScript |
| `npm test` | Unit test + integration test database (butuh `TEST_DATABASE_URL`, lihat di bawah) |
| `npm run db:up` / `npm run db:down` | Nyalakan / matikan PostgreSQL lokal. `npm run db:down -- -v` juga **menghapus** datanya |
| `npm run db:migrate` | Terapkan migrasi yang belum dijalankan |
| `npm run db:seed` | Kosongkan tabel lalu isi data contoh. Ditolak jika `NODE_ENV=production` atau host-nya AWS RDS |
| `npm run user:create -- --name "Nama" --email a@kampus.ac.id --role admin` | Buat akun (mis. admin pertama di RDS). Password ditanyakan tanpa ditampilkan, atau dibaca dari stdin |

## API

Dokumentasi lengkap (body, contoh respons, kode error, dan cara testing dengan Postman): [`apps/api/API.md`](apps/api/API.md).

Format respons:

- Sukses: `{ "data": ... }`
- Gagal: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`

Error tak terduga selalu dikembalikan sebagai `500 INTERNAL_ERROR` tanpa detail SQL/stack trace (detail hanya dicatat di log server).

| Endpoint | Keterangan |
| --- | --- |
| `GET /api/health` | API hidup (tidak menyentuh database) |
| `GET /api/health/db` | Konektivitas database; `503 DATABASE_UNAVAILABLE` jika gagal |
| `POST /api/auth/login` | `{ email, password }` → set cookie sesi, kembalikan user |
| `POST /api/auth/logout` | Hapus sesi di server dan cookie (`204`) |
| `GET /api/auth/me` | User yang sedang login, atau `401 UNAUTHENTICATED` |
| `GET /api/users` | Daftar user — **admin saja** |
| `POST /api/users` | `{ name, email, role, password }` → buat akun — **admin saja** |
| `GET /api/students` | Daftar mahasiswa (NIM, nama, prodi, angkatan) untuk memilih pemilik lembar jawaban |
| `GET /api/exams` | Ujian milik dosen yang login (admin: semua ujian), beserta jumlah soal, lembar jawaban, dan yang sudah dinilai |
| `POST /api/exams` | `{ exam_name, exam_date: "YYYY-MM-DD" }` → buat ujian milik user yang login |
| `GET` / `PATCH` / `DELETE /api/exams/:examId` | Detail, ubah (`exam_name` dan/atau `exam_date`), atau hapus ujian beserta seluruh isinya |
| `GET /api/exams/:examId/questions` | Soal berurutan menurut nomor, beserta kunci jawaban (`answer_key`) |
| `POST /api/exams/:examId/questions` | `{ question_number, question_type, question_text, answer_key?: { correct_answer, keywords? } }` — soal dan kunci disimpan dalam satu transaksi |
| `GET` / `PATCH` / `DELETE /api/exams/:examId/questions/:questionId` | Detail, ubah sebagian (`answer_key: null` menghapus kunci), atau hapus soal |
| `GET /api/exams/:examId/answer-sheets` | Lembar jawaban ujian + nama mahasiswa + nilai (sekaligus rekap hasil ujian) |
| `POST /api/exams/:examId/answer-sheets` | `{ student_id }` → daftarkan lembar jawaban mahasiswa (`409` jika sudah ada, `422` jika NIM tidak dikenal) |
| `GET /api/answer-sheets/:sheetId` | Lembar jawaban: semua soal ujian, jawaban mahasiswa, dan nilai |
| `PATCH /api/answer-sheets/:sheetId` | `{ verification_status: "pending" \| "verified" }` — hanya lembar yang sudah dinilai yang bisa `verified` |
| `DELETE /api/answer-sheets/:sheetId` | Hapus lembar jawaban beserta jawaban dan nilainya |

Aturan data ujian:

- Dosen hanya bisa melihat dan mengubah ujian miliknya (beserta soal dan lembar jawabannya). Admin bisa mengakses semua ujian. Ujian milik orang lain dijawab `404`, sama seperti ujian yang tidak ada.
- `question_type`: `multiple_choice`, `short_answer`, atau `essay` (sesuai grader di AI service). `verification_status`: `pending` (belum ditinjau dosen) atau `verified`. Keduanya juga dijaga `CHECK` constraint di migrasi `0003`.
- Jawaban (`answers`) dan nilai (`scores`) hanya bisa dibaca lewat API. Keduanya nanti ditulis oleh pipeline penilaian (AI service), bukan dikirim dari browser.
- `file_path` (lokasi PDF di S3) tidak pernah dikirim ke client; API hanya memberi `has_file`.

## Autentikasi & otorisasi

- Hanya **dosen (`lecturer`) dan admin** yang bisa login (tabel `users`). Tabel `students` hanyalah data mahasiswa hasil normalisasi; mahasiswa tidak punya akun.
- Tidak ada pendaftaran mandiri: akun dibuat oleh admin (`POST /api/users`) atau lewat `npm run user:create`.
- Password di-hash dengan **scrypt** bawaan Node.js (parameter OWASP, salt acak per user). Hash tidak pernah dikirim ke client. Minimal 8 karakter.
- **Sesi**: token acak 256-bit di cookie `httpOnly`, `SameSite=Lax`, `Path=/`; di produksi juga `Secure` dengan prefix `__Host-`. Database hanya menyimpan hash SHA-256 token (tabel `sessions`), jadi dump database tidak bisa dipakai untuk membajak sesi.
- **Kedaluwarsa**: absolut `SESSION_TTL_HOURS` jam (default 12) sejak login, lalu harus login ulang.
- **Logout** menghapus baris sesi di server, sehingga cookie lama langsung tidak berlaku.
- **CSRF**: cookie `SameSite=Lax` + pemeriksaan header `Origin` (request POST/PUT/PATCH/DELETE dari origin selain `APP_ORIGIN`/`CORS_ORIGINS` ditolak `403`) + API hanya menerima body JSON.
- **Brute force**: maksimal 5 login gagal per (IP, email) dan 50 percobaan per IP per 15 menit (`429`). Penghitung disimpan di memori, jadi berlaku per instance API.
- Email unknown dan password salah memberi respons dan waktu proses yang sama, agar tidak membocorkan email yang terdaftar.
- Otorisasi selalu dicek di API (`requireAuth`, `requireRole`). Redirect di layout dashboard Next.js hanya untuk navigasi, bukan pengamanan.

## Database & migrasi

- Migrasi dijalankan berurutan sesuai nama file, masing-masing dalam satu transaksi, dan dicatat di tabel `schema_migrations` beserta checksum. Runner memakai advisory lock sehingga dua proses tidak bisa migrasi bersamaan.
- **Jangan mengubah file migrasi yang sudah diterapkan** — runner akan menolak jika checksum berubah. Buat file baru, mis. `0002_add_exam_duration.sql`.
- Seed (`database/seeds`) dijalankan dalam satu transaksi dan bersifat repeatable: tabel dikosongkan (`TRUNCATE ... RESTART IDENTITY`) sebelum data dimasukkan.
- Kolom `users.password` berisi hash scrypt (`scrypt$N$r$p$salt$hash`), bukan password asli.

### Integration test database

`npm test` menjalankan migrasi + seed sungguhan terhadap `TEST_DATABASE_URL` (database `sipinter_test`, dibuat otomatis oleh `docker-compose.dev.yml`). Nama database **wajib** berakhiran `_test` karena test menghapus seluruh schema `public`. Jika variabel ini tidak di-set, test database dilewati (skipped).

Jika volume Docker sudah ada sebelum `database/dev/init` ditambahkan, buat database test secara manual:

```bash
docker exec sipinter-dev-postgres-1 psql -U sipinter -c "CREATE DATABASE sipinter_test"
```

## AWS RDS (catatan konfigurasi)

Belum ada resource AWS yang dibuat atau diubah oleh proyek ini. Saat menyiapkan RDS:

1. Letakkan RDS di subnet privat; izinkan inbound 5432 hanya dari security group backend. Jangan aktifkan public access kecuali benar-benar diperlukan.
2. Jalankan migrasi dengan role pemilik schema (mis. master user), lalu buat user aplikasi least-privilege:
   ```bash
   psql "host=<endpoint> dbname=<db> user=<admin> sslmode=verify-full sslrootcert=global-bundle.pem" \
     -v app_user=sipinter_app -v app_password='<password-kuat>' \
     -f deploy/scripts/create-app-user.sql
   ```
   User ini hanya bisa `SELECT/INSERT/UPDATE/DELETE`, tidak bisa membuat/menghapus tabel atau mengubah `schema_migrations`.
   Buat admin pertama dengan `npm run user:create -- --name ... --email ... --role admin` (seed ditolak di RDS).
3. Unduh CA bundle RDS (`https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem`), lalu set di `.env` server:
   ```
   DATABASE_URL=postgres://sipinter_app:<password>@<endpoint>:5432/<db>
   DATABASE_SSL=verify-full
   DATABASE_SSL_CA_PATH=/path/to/global-bundle.pem
   ```
   Jangan menaruh `sslmode` di `DATABASE_URL`; API menolaknya agar pengaturan TLS hanya ada di `DATABASE_SSL`. Dengan `NODE_ENV=production`, API menolak berjalan tanpa TLS dan tanpa `APP_ORIGIN` (mis. `https://sipinter.example.com`).

## Status

Sudah: fondasi monorepo, API Express (env validation, error handling, health check, pool `pg`), migrasi + seed, user database least-privilege, API client di frontend, autentikasi (login/logout/sesi) dan otorisasi berbasis role, manajemen akun oleh admin, API ujian/soal/kunci jawaban/lembar jawaban/hasil (CRUD + kepemilikan).

Belum: upload PDF ke S3, AI service Python (FastAPI: OCR + penilaian) dan queue/worker, penulisan jawaban & nilai oleh pipeline, halaman frontend untuk ujian/soal/lembar jawaban/hasil dan manajemen akun, komponen shadcn/ui, Dockerfile/Compose produksi, Nginx, dan dokumentasi backup/deploy.
