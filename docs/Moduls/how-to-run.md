---
layout: default
title: Cara Menjalankan Proyek
---

# Cara Menjalankan SiPinter Secara Lokal

Panduan ini menjalankan seluruh aplikasi di komputer Anda: database PostgreSQL (Docker), backend Express, dan frontend Next.js. Setiap langkah disertai penjelasan **apa yang sebenarnya terjadi**. Gambaran arsitekturnya ada di [Arsitektur Sistem](architecture.html).

## Daftar isi

1. [Prasyarat](#1-prasyarat)
2. [Ringkasan cepat](#2-ringkasan-cepat)
3. [Langkah demi langkah](#3-langkah-demi-langkah)
4. [Mencoba aplikasi](#4-mencoba-aplikasi)
5. [Menjalankan test](#5-menjalankan-test)
6. [Melihat database dengan pgAdmin](#6-melihat-database-dengan-pgadmin)
7. [Menguji API dengan Postman atau curl](#7-menguji-api-dengan-postman-atau-curl)
8. [Daftar perintah](#8-daftar-perintah)
9. [Konfigurasi `.env`](#9-konfigurasi-env)
10. [Mematikan dan mereset](#10-mematikan-dan-mereset)
11. [Troubleshooting](#11-troubleshooting)
12. [Tanpa Docker / memakai AWS RDS](#12-tanpa-docker--memakai-aws-rds)

---

## 1. Prasyarat

| Kebutuhan | Versi | Untuk apa | Cek dengan |
| --- | --- | --- | --- |
| Node.js | 22.12 atau lebih baru | Menjalankan backend, frontend, dan script | `node -v` |
| npm | ikut Node.js | Menginstal dependency (npm workspaces) | `npm -v` |
| Docker | Docker Desktop atau Docker Engine | Menjalankan PostgreSQL lokal | `docker --version` |
| Git | – | Mengambil kode | `git --version` |

Di Windows, jalankan proyek dari **WSL2** (Ubuntu) agar perintah dan path sama seperti di panduan ini.

Port yang dipakai:

| Port | Layanan |
| --- | --- |
| `3000` | Frontend Next.js (buka ini di browser) |
| `4000` | Backend Express API |
| `5433` | PostgreSQL di Docker (hanya bisa diakses dari komputer sendiri) |

## 2. Ringkasan cepat

Dari folder root repository:

```bash
cp .env.example .env     # 1. buat file konfigurasi
npm install              # 2. instal dependency semua workspace
npm run db:up            # 3. nyalakan PostgreSQL di Docker
npm run db:migrate       # 4. buat tabel
npm run db:seed          # 5. isi data contoh
npm run dev              # 6. jalankan API + web
```

Lalu buka <http://localhost:3000> dan login dengan `budi.santoso@example.com` / `sipinter-dev`.

## 3. Langkah demi langkah

### 3.1 Ambil kode

```bash
git clone https://github.com/IlkhamAbdillah/SiPinter.git
cd SiPinter
```

Semua perintah berikutnya dijalankan dari folder root ini, bukan dari `apps/api` atau `apps/web`.

### 3.2 Buat file `.env`

```bash
cp .env.example .env
```

**Apa yang terjadi:** `.env` berisi konfigurasi yang dibaca backend dan script database: URL database, port API, origin web, durasi sesi, dan URL database test. Nilai default di `.env.example` sudah cocok dengan database Docker lokal, jadi tidak perlu diubah. File `.env` tidak di-commit ke Git (ada di `.gitignore`) karena bisa berisi password.

### 3.3 Instal dependency

```bash
npm install
```

**Apa yang terjadi:** npm membaca `package.json` di root yang mendaftarkan dua *workspace*, `apps/web` dan `apps/api`. Dependency keduanya diinstal sekaligus ke satu folder `node_modules` di root, dan versinya dikunci oleh `package-lock.json` agar semua anggota tim memakai versi yang sama.

### 3.4 Nyalakan database

```bash
npm run db:up
```

**Apa yang terjadi:** menjalankan `docker compose -f docker-compose.dev.yml up -d --wait`.

- Docker mengunduh image `postgres:17-alpine` (hanya pertama kali) lalu membuat container `sipinter-dev-postgres-1` yang berjalan di background.
- Database `sipinter` dibuat dengan user `sipinter` / password `sipinter_dev_password`. Kredensial ini **khusus lokal**.
- Saat volume data pertama kali dibuat, skrip `database/dev/init/01-create-test-database.sql` juga membuat database kedua, `sipinter_test`, khusus untuk test otomatis.
- Data disimpan di Docker volume, jadi tetap ada walau container dimatikan.
- `--wait` membuat perintah menunggu sampai PostgreSQL benar-benar siap (health check `pg_isready`).
- Port hanya dibuka di `127.0.0.1:5433`, sehingga database tidak bisa diakses dari jaringan lain.

Cek: `docker ps` harus menampilkan `sipinter-dev-postgres-1` dengan status `healthy`.

### 3.5 Buat tabel (migrasi)

```bash
npm run db:migrate
```

**Apa yang terjadi:** script `apps/api/src/db/migrate.ts` membaca semua file di `database/migrations/` sesuai urutan nama (`0001_...`, `0002_...`, `0003_...`), lalu:

1. Mengambil *advisory lock*, agar dua proses tidak bisa migrasi bersamaan.
2. Melewati file yang sudah tercatat di tabel `schema_migrations`.
3. Menjalankan setiap file baru di dalam **transaksi**: jika ada error, perubahan file itu dibatalkan seluruhnya.
4. Mencatat nama file dan checksum-nya. Jika file lama diubah setelah diterapkan, migrasi berikutnya akan menolak berjalan.

Output contoh:

```text
Applied migrations:
  0001_initial_schema.sql
  0002_auth_sessions.sql
  0003_question_types_and_sheet_status.sql
```

Aman dijalankan berulang kali; jika tidak ada migrasi baru, tidak ada yang berubah. Jalankan lagi setiap kali ada file migrasi baru dari anggota tim (mis. setelah `git pull`).

### 3.6 Isi data contoh (seed)

```bash
npm run db:seed
```

**Apa yang terjadi:** script `apps/api/src/db/seed.ts` menjalankan `database/seeds/0001_dev_data.sql` dalam satu transaksi:

1. **Mengosongkan semua tabel** (`TRUNCATE ... RESTART IDENTITY`), sehingga id kembali mulai dari 1.
2. Mengisi 3 akun, 10 mahasiswa, 3 ujian, 15 soal beserta kunci jawaban, 6 lembar jawaban beserta jawaban dan nilainya.

Karena menghapus data, seed **menolak berjalan** jika `NODE_ENV=production` atau database-nya AWS RDS.

Akun hasil seed (password semuanya `sipinter-dev`):

| Email | Role | Data |
| --- | --- | --- |
| `budi.santoso@example.com` | lecturer | Pemilik ujian 1 (Basis Data) dan 2 (Algoritma) |
| `siti.rahmawati@example.com` | lecturer | Pemilik ujian 3 (Rekayasa Perangkat Lunak) |
| `andi.pratama@example.com` | admin | Bisa melihat semua ujian dan mengelola akun |

### 3.7 Jalankan aplikasi

```bash
npm run dev
```

**Apa yang terjadi:** `concurrently` menjalankan dua proses sekaligus di satu terminal. Log-nya diberi label `[api]` (biru) dan `[web]` (hijau).

| Proses | Perintah sebenarnya | Penjelasan |
| --- | --- | --- |
| `[api]` | `tsx watch src/server.ts` di `apps/api` | Menjalankan Express di port 4000. `tsx` menjalankan TypeScript langsung tanpa build; `watch` me-restart server setiap kali file berubah. Saat start, API memvalidasi isi `.env` dan berhenti dengan pesan jelas jika ada yang salah. |
| `[web]` | `next dev` di `apps/web` | Menjalankan Next.js di port 3000 dengan hot reload. Request ke `/api/*` diteruskan (rewrite) ke `http://localhost:4000`. |

Biarkan terminal ini tetap terbuka. Tekan `Ctrl+C` untuk menghentikan keduanya.

Hanya ingin menjalankan salah satunya:

```bash
npm run dev:api    # hanya backend
npm run dev:web    # hanya frontend
```

## 4. Mencoba aplikasi

| Buka | Hasil yang diharapkan |
| --- | --- |
| <http://localhost:3000> | Halaman beranda |
| <http://localhost:3000/login> | Form login. Setelah login, diarahkan ke dashboard |
| <http://localhost:3000/api/health> | `{"data":{"status":"ok"}}`: API hidup |
| <http://localhost:3000/api/health/db> | `{"data":{"status":"ok","database":"up"}}`: API terhubung ke database |
| <http://localhost:3000/api/exams> (setelah login) | Daftar ujian milik user yang login, dalam JSON |

**Cara browser mencapai API:** browser selalu memanggil `localhost:3000/api/...`. Next.js meneruskannya ke Express di `localhost:4000`. Karena browser hanya melihat satu origin, cookie sesi tetap aman dan CORS tidak diperlukan.

> **Catatan:** halaman dashboard, ujian, soal, lembar jawaban, dan hasil di frontend **belum terhubung ke API** dan masih menampilkan data kosong. Untuk melihat data ujian, panggil API-nya langsung (bagian 7).

## 5. Menjalankan test

```bash
npm test             # semua test (unit + integration) di api dan web
npm run lint         # cek gaya & kesalahan umum (ESLint)
npm run typecheck    # cek tipe TypeScript
npm run build        # build produksi api dan web
```

**Apa yang terjadi saat `npm test`:**

- **Unit test** (mis. validasi env, helper auth, API client frontend) berjalan tanpa database.
- **Integration test** memakai database `sipinter_test` dari `TEST_DATABASE_URL`. Sebelum setiap file test, schema database test **dihapus total**, lalu migrasi dan seed dijalankan ulang. Test kemudian memanggil API sungguhan lewat Supertest: login, membuat ujian, mencoba mengakses data dosen lain, dan sebagainya.
- Database development (`sipinter`) **tidak tersentuh** oleh test.
- Jika `TEST_DATABASE_URL` tidak di-set, atau nama database-nya tidak berakhiran `_test`, integration test dilewati (*skipped*), bukan gagal.

Menjalankan satu file test saja:

```bash
npm test -w @sipinter/api -- tests/exams.integration.test.ts
```

## 6. Melihat database dengan pgAdmin

Di pgAdmin: klik kanan **Servers → Register → Server…**

| Tab | Field | Nilai |
| --- | --- | --- |
| General | Name | `SiPinter (local)` |
| Connection | Host name/address | `localhost` |
| | Port | `5433` |
| | Maintenance database | `sipinter` |
| | Username | `sipinter` |
| | Password | `sipinter_dev_password` |
| Parameters | SSL mode | `disable` atau `prefer` |

Tabel ada di **Databases → sipinter → Schemas → public → Tables**. Database `sipinter_test` juga terlihat, tetapi isinya dihapus setiap kali test dijalankan.

Jika pgAdmin berjalan di dalam Docker, pakai host `host.docker.internal`, bukan `localhost`.

## 7. Menguji API dengan Postman atau curl

Dokumentasi lengkap semua endpoint ada di [`apps/api/API.md`](https://github.com/IlkhamAbdillah/SiPinter/blob/main/apps/api/API.md).

**Konsep penting:** sebagian besar endpoint perlu login. API tidak memakai bearer token; setelah `POST /api/auth/login` berhasil, API mengirim **cookie sesi** (`sipinter_session`). Postman, curl (dengan cookie jar), dan browser mengirim cookie itu kembali secara otomatis di request berikutnya.

### Postman

1. Pastikan `npm run dev` (atau `npm run dev:api`) sedang berjalan.
2. Di **Postman Desktop**: **Import** → `apps/api/postman/SiPinter.postman_collection.json`.
3. Jalankan **1. Auth → Login (dosen)**. Cookie tersimpan otomatis (lihat tombol **Cookies**).
4. Jalankan request lain, atau klik kanan koleksi → **Run collection**. Folder 0–6 membuat data uji coba lalu menghapusnya lagi.

Saat membuat request sendiri, perhatikan **method**-nya: `/api/auth/login` hanya menerima **POST**. Membukanya di address bar browser (GET) menghasilkan `404 Route GET /api/auth/login not found`.

### curl

```bash
# Login: simpan cookie ke cookies.txt
curl -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"budi.santoso@example.com","password":"sipinter-dev"}' \
  http://localhost:4000/api/auth/login

# Panggil endpoint yang butuh login: kirim cookie dari cookies.txt
curl -b cookies.txt http://localhost:4000/api/exams
curl -b cookies.txt http://localhost:4000/api/answer-sheets/1
```

## 8. Daftar perintah

Semua dijalankan dari root repository.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan API (4000) dan web (3000) bersamaan |
| `npm run dev:api` / `npm run dev:web` | Jalankan salah satunya saja |
| `npm run build` | Build produksi semua workspace |
| `npm test` | Semua test |
| `npm run lint` | ESLint semua workspace |
| `npm run typecheck` | Cek tipe TypeScript semua workspace |
| `npm run db:up` | Nyalakan PostgreSQL lokal (Docker) |
| `npm run db:down` | Matikan PostgreSQL lokal, data tetap ada |
| `npm run db:down -- -v` | Matikan **dan hapus seluruh data** lokal |
| `npm run db:migrate` | Terapkan migrasi yang belum dijalankan |
| `npm run db:seed` | Kosongkan tabel dan isi ulang data contoh |
| `npm run user:create -- --name "Nama" --email a@kampus.ac.id --role admin` | Buat akun baru; password ditanyakan tanpa ditampilkan |

## 9. Konfigurasi `.env`

| Variabel | Default | Fungsi |
| --- | --- | --- |
| `NODE_ENV` | `development` | Mode aplikasi. `production` mengaktifkan aturan lebih ketat (TLS database wajib, cookie `Secure`) |
| `PORT` | `4000` | Port Express API |
| `APP_ORIGIN` | `http://localhost:3000` | Origin web. Request POST/PATCH/DELETE dari origin lain ditolak (proteksi CSRF) |
| `CORS_ORIGINS` | kosong | Origin lain yang boleh memanggil API langsung dari browser. Kosongkan untuk development |
| `SESSION_TTL_HOURS` | `12` | Lama sesi login sebelum harus login ulang |
| `DATABASE_URL` | Postgres Docker lokal | Koneksi database utama |
| `DATABASE_SSL` | `disable` | `disable` (lokal), `require`, atau `verify-full` (AWS RDS) |
| `DATABASE_SSL_CA_PATH` | – | Path CA bundle RDS, wajib untuk `verify-full` |
| `DATABASE_POOL_MAX` | `10` | Jumlah maksimal koneksi database bersamaan |
| `TEST_DATABASE_URL` | database `sipinter_test` lokal | Database untuk integration test; **namanya wajib berakhiran `_test`** karena isinya dihapus |
| `API_INTERNAL_URL` | `http://localhost:4000` | Alamat API yang dipakai Next.js dari sisi server. Set di environment atau `apps/web/.env.local`, bukan di `.env` root |

Jangan pernah meng-commit `.env` atau menaruh password asli di `.env.example`.

## 10. Mematikan dan mereset

| Ingin… | Lakukan |
| --- | --- |
| Menghentikan API & web | `Ctrl+C` di terminal `npm run dev` |
| Mematikan database (data tetap) | `npm run db:down` |
| Mengembalikan data ke kondisi awal | `npm run db:seed` |
| Menghapus database sepenuhnya dan mulai dari nol | `npm run db:down -- -v`, lalu `npm run db:up`, `npm run db:migrate`, `npm run db:seed` |

## 11. Troubleshooting

| Gejala | Penyebab & solusi |
| --- | --- |
| `Invalid environment configuration` saat API start | Ada variabel `.env` yang salah atau hilang. Pesan error menyebut variabelnya; bandingkan dengan `.env.example` |
| `ECONNREFUSED 127.0.0.1:5433` / `/api/health/db` mengembalikan `503` | Database belum menyala. Jalankan `npm run db:up`, cek `docker ps` |
| `relation "users" does not exist` | Migrasi belum dijalankan: `npm run db:migrate` |
| Login gagal dengan akun seed | Seed belum dijalankan atau data sudah diubah: `npm run db:seed` |
| `EADDRINUSE: address already in use :::4000` (atau `3000`) | Port sudah dipakai proses lain, mungkin `npm run dev` yang masih berjalan di terminal lain. Hentikan proses itu |
| Port `5433` sudah dipakai | Set `DEV_DB_PORT=5434` saat `npm run db:up`, lalu sesuaikan port di `DATABASE_URL` dan `TEST_DATABASE_URL` |
| `404 Route GET /api/auth/login not found` | Login harus memakai method **POST**, bukan membuka URL di browser |
| `401 UNAUTHENTICATED` di Postman | Login dulu, dan pakai host yang sama (`localhost`, bukan `127.0.0.1`). Sesi berlaku 12 jam |
| `403 INVALID_ORIGIN` | Header `Origin` request tidak sama dengan `APP_ORIGIN`. Hapus header itu atau isi `http://localhost:3000` |
| Integration test *skipped* | `TEST_DATABASE_URL` tidak di-set, atau nama database tidak berakhiran `_test` |
| `database "sipinter_test" does not exist` | Volume Docker dibuat sebelum skrip init ditambahkan. Jalankan `docker exec sipinter-dev-postgres-1 psql -U sipinter -c "CREATE DATABASE sipinter_test"` |
| `Migration ... was modified after it was applied` | File migrasi lama diubah. Kembalikan isinya, lalu buat perubahan di file migrasi baru |
| Halaman ujian di web kosong padahal API mengembalikan data | Normal untuk saat ini: halaman frontend tersebut belum terhubung ke API |

## 12. Tanpa Docker / memakai AWS RDS

Docker hanya dipakai untuk menyediakan PostgreSQL lokal. Alternatifnya:

- **PostgreSQL langsung di WSL/Linux** (`sudo apt install postgresql`): buat database `sipinter` dan `sipinter_test`, lalu sesuaikan `DATABASE_URL` dan `TEST_DATABASE_URL` di `.env`. Lewati `npm run db:up`.
- **AWS RDS**: bisa, tetapi perhatikan:
  - Pakai database terpisah untuk test (nama berakhiran `_test`), karena test menghapus seluruh isinya.
  - RDS sebaiknya tidak publik. Akses dari laptop lewat SSH tunnel melalui EC2: `ssh -i key.pem -N -L 5434:<endpoint-rds>:5432 ec2-user@<ip-ec2>`, lalu pakai `localhost:5434` dengan `DATABASE_SSL=require`.
  - Jika terhubung langsung ke endpoint RDS, pakai `DATABASE_SSL=verify-full` dan `DATABASE_SSL_CA_PATH`.
  - `db:seed` ditolak untuk host RDS kecuali `ALLOW_RDS_SEED=true`. Hanya lakukan itu pada database yang boleh dihapus. Lewat SSH tunnel, host terlihat sebagai `localhost`, sehingga pengaman ini **tidak aktif**.
  - Migrasi dijalankan dengan user pemilik schema (master); aplikasi memakai user least-privilege (`deploy/scripts/create-app-user.sql`). Detailnya di bagian "AWS RDS" pada `README.md`.

Untuk development sehari-hari, database lokal lebih cepat, gratis, dan aman untuk dihapus. RDS dipakai untuk aplikasi yang di-deploy.

[Kembali ke beranda](../index.html)
