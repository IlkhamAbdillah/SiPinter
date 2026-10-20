# Dokumentasi API SiPinter

Dokumentasi seluruh endpoint Express API (`apps/api`). Semua contoh di bawah diambil dari respons API sungguhan dengan data seed development.

- [Dasar](#dasar)
- [Autentikasi](#autentikasi)
- [Health](#health)
- [Users (admin)](#users-admin)
- [Students](#students)
- [Exams](#exams)
- [Questions](#questions)
- [Answer sheets & hasil](#answer-sheets--hasil)
- [Kode error](#kode-error)
- [Testing dengan Postman](#testing-dengan-postman)

## Dasar

| | |
| --- | --- |
| Base URL (development) | `http://localhost:4000` (langsung ke Express) atau `http://localhost:3000` (lewat Next.js, diteruskan ke Express) |
| Format body | JSON (`Content-Type: application/json`), maksimal 1 MB |
| Autentikasi | Cookie sesi `sipinter_session` (produksi: `__Host-sipinter_session`) yang diset oleh `POST /api/auth/login` |

Semua respons sukses dibungkus `data`:

```json
{ "data": { "exam_id": 1, "exam_name": "Ujian Basis Data" } }
```

Semua respons gagal memakai bentuk yang sama:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "location": "body", "path": "exam_date", "message": "Invalid ISO date" }]
  }
}
```

`details` hanya ada pada error validasi. Error tak terduga selalu `500 INTERNAL_ERROR` tanpa detail SQL atau stack trace.

### Aturan akses

- Hanya **dosen (`lecturer`)** dan **admin** yang bisa login. Mahasiswa tidak punya akun.
- Dosen hanya bisa mengakses **ujian miliknya sendiri**, beserta soal dan lembar jawabannya. Admin bisa mengakses semua ujian.
- Ujian atau lembar jawaban milik dosen lain dijawab **`404`**, sama seperti data yang memang tidak ada.
- **Proteksi CSRF:** request `POST`/`PUT`/`PATCH`/`DELETE` yang membawa header `Origin` selain `APP_ORIGIN` (default `http://localhost:3000`) ditolak `403 INVALID_ORIGIN`. Request tanpa header `Origin` (Postman, curl) diizinkan.

### Tipe data

| Field | Nilai |
| --- | --- |
| `question_type` | `multiple_choice`, `short_answer`, `essay` |
| `verification_status` | `pending` (belum ditinjau dosen), `verified` (sudah ditinjau) |
| `exam_date` | Tanggal `YYYY-MM-DD` |
| `score` | Angka 0–100, atau `null` jika belum dinilai |
| `student_id` | NIM mahasiswa (string) |

---

## Autentikasi

### `POST /api/auth/login`

Login dan set cookie sesi. Sesi berlaku `SESSION_TTL_HOURS` jam (default 12).

Body:

```json
{ "email": "budi.santoso@example.com", "password": "sipinter-dev" }
```

`200`:

```json
{
  "data": {
    "user": { "lecturer_id": 1, "name": "Budi Santoso", "email": "budi.santoso@example.com", "role": "lecturer" },
    "expires_at": "2026-10-20T14:38:23.224Z"
  }
}
```

Error: `401 INVALID_CREDENTIALS` (email atau password salah), `429 TOO_MANY_REQUESTS` (lebih dari 5 login gagal per IP+email, atau 50 percobaan per IP, dalam 15 menit).

### `POST /api/auth/logout`

Menghapus sesi di server dan cookie. `204` tanpa body. Aman dipanggil walau belum login.

### `GET /api/auth/me`

User yang sedang login. `200` → `{ "data": { "lecturer_id", "name", "email", "role" } }`, atau `401 UNAUTHENTICATED`.

---

## Health

Tidak perlu login.

| Endpoint | Respons |
| --- | --- |
| `GET /api/health` | `200 { "data": { "status": "ok" } }`: proses API hidup (tidak menyentuh database) |
| `GET /api/health/db` | `200 { "data": { "status": "ok", "database": "up" } }`, atau `503 DATABASE_UNAVAILABLE` |

---

## Users (admin)

Hanya untuk role `admin`; dosen mendapat `403 FORBIDDEN`.

### `GET /api/users`

Daftar semua akun (`lecturer_id`, `name`, `email`, `role`). Hash password tidak pernah dikirim.

### `POST /api/users`

Membuat akun dosen atau admin.

```json
{ "name": "Dosen Baru", "email": "dosen.baru@example.com", "role": "lecturer", "password": "minimal-8-karakter" }
```

`201` → user baru. `409 EMAIL_TAKEN` jika email sudah dipakai.

---

## Students

### `GET /api/students`

Perlu login. Daftar mahasiswa (tanpa email), urut NIM. Dipakai untuk memilih pemilik lembar jawaban.

```json
{
  "data": [
    { "student_id": "240001", "name": "Muhammad Rizky", "study_program": "Informatika", "enrollment_year": 2024 }
  ]
}
```

---

## Exams

Semua endpoint perlu login.

Objek ujian:

```json
{
  "exam_id": 1,
  "lecturer_id": 1,
  "exam_name": "Ujian Basis Data",
  "exam_date": "2026-10-01",
  "lecturer_name": "Budi Santoso",
  "question_count": 5,
  "answer_sheet_count": 3,
  "graded_count": 3
}
```

`graded_count` = jumlah lembar jawaban yang sudah punya nilai.

| Method & path | Body | Sukses | Keterangan |
| --- | --- | --- | --- |
| `GET /api/exams` | – | `200` array ujian | Dosen: ujian miliknya. Admin: semua. Urut tanggal terbaru |
| `POST /api/exams` | `{ "exam_name", "exam_date" }` | `201` ujian | Pemilik = user yang login |
| `GET /api/exams/:examId` | – | `200` ujian | |
| `PATCH /api/exams/:examId` | `{ "exam_name"?, "exam_date"? }` (minimal satu) | `200` ujian | |
| `DELETE /api/exams/:examId` | – | `204` | Ikut menghapus soal, kunci, lembar jawaban, jawaban, dan nilai ujian ini |

Error: `404 EXAM_NOT_FOUND`, `400 VALIDATION_ERROR`.

---

## Questions

Path: `/api/exams/:examId/questions`. Perlu login dan akses ke ujiannya.

Objek soal:

```json
{
  "question_id": 1,
  "exam_id": 1,
  "question_number": 1,
  "question_type": "essay",
  "question_text": "Jelaskan perbedaan primary key dan foreign key.",
  "answer_key": {
    "correct_answer": "Primary key mengidentifikasi baris secara unik, sedangkan foreign key mereferensikan key pada tabel lain.",
    "keywords": "primary key,foreign key,unik,referensi"
  }
}
```

`answer_key` bernilai `null` jika soal belum punya kunci jawaban.

| Method & path | Body | Sukses |
| --- | --- | --- |
| `GET /api/exams/:examId/questions` | – | `200` array soal, urut `question_number` |
| `POST /api/exams/:examId/questions` | lihat di bawah | `201` soal |
| `GET /api/exams/:examId/questions/:questionId` | – | `200` soal |
| `PATCH /api/exams/:examId/questions/:questionId` | field yang diubah saja | `200` soal |
| `DELETE /api/exams/:examId/questions/:questionId` | – | `204` (ikut menghapus kunci dan jawaban mahasiswa untuk soal ini) |

Body `POST`:

```json
{
  "question_number": 1,
  "question_type": "multiple_choice",
  "question_text": "Perintah SQL untuk mengambil data adalah ...",
  "answer_key": { "correct_answer": "B", "keywords": null }
}
```

- `answer_key` opsional. Soal dan kuncinya disimpan dalam satu transaksi: jika salah satu gagal, keduanya batal.
- `correct_answer` maksimal 255 karakter; `keywords` opsional (string kosong dianggap `null`).

Body `PATCH` (semua opsional, minimal satu):

- `question_number`, `question_type`, `question_text`: diganti jika dikirim.
- `answer_key`: objek → mengganti kunci jawaban; `null` → menghapus kunci; tidak dikirim → tidak berubah.

Error: `404 EXAM_NOT_FOUND`, `404 QUESTION_NOT_FOUND`, `409 QUESTION_NUMBER_TAKEN` (nomor soal sudah dipakai di ujian ini), `400 VALIDATION_ERROR`.

---

## Answer sheets & hasil

Satu lembar jawaban = jawaban satu mahasiswa untuk satu ujian. Jawaban (`answers`) dan nilai (`score`) hanya bisa **dibaca**: keduanya nantinya diisi oleh pipeline penilaian otomatis (AI service), bukan dari browser. Upload PDF ke S3 belum tersedia; `has_file` menunjukkan apakah PDF sudah ada (lokasi file tidak pernah dikirim ke client).

Objek ringkasan lembar jawaban:

```json
{
  "answer_sheet_id": 1,
  "exam_id": 1,
  "student_id": "240001",
  "student_name": "Muhammad Rizky",
  "verification_status": "verified",
  "has_file": true,
  "score": 88.5
}
```

| Method & path | Body | Sukses | Keterangan |
| --- | --- | --- | --- |
| `GET /api/exams/:examId/answer-sheets` | – | `200` array ringkasan | Sekaligus rekap hasil ujian. Urut NIM |
| `POST /api/exams/:examId/answer-sheets` | `{ "student_id": "240004" }` | `201` ringkasan | Status awal `pending`, `score` `null` |
| `GET /api/answer-sheets/:sheetId` | – | `200` detail | Lihat di bawah |
| `PATCH /api/answer-sheets/:sheetId` | `{ "verification_status": "verified" }` | `200` detail | `verified` hanya untuk lembar yang sudah dinilai |
| `DELETE /api/answer-sheets/:sheetId` | – | `204` | Ikut menghapus jawaban dan nilainya |

Detail lembar jawaban = ringkasan + `exam_name` + `answers`. `answers` berisi **semua soal** ujian; untuk soal yang belum dijawab, `answer_id` dan `student_answer_text` bernilai `null`.

```json
{
  "data": {
    "answer_sheet_id": 1,
    "exam_id": 1,
    "student_id": "240001",
    "student_name": "Muhammad Rizky",
    "verification_status": "verified",
    "has_file": true,
    "score": 88.5,
    "exam_name": "Ujian Basis Data",
    "answers": [
      {
        "question_id": 1,
        "question_number": 1,
        "question_type": "essay",
        "question_text": "Jelaskan perbedaan primary key dan foreign key.",
        "answer_id": 1,
        "student_answer_text": "Primary key adalah identitas unik, sedangkan foreign key menghubungkan tabel."
      }
    ]
  }
}
```

Error: `404 EXAM_NOT_FOUND`, `404 ANSWER_SHEET_NOT_FOUND`, `409 ANSWER_SHEET_EXISTS` (mahasiswa sudah punya lembar jawaban di ujian ini), `422 UNKNOWN_STUDENT` (NIM tidak ada), `409 ANSWER_SHEET_NOT_GRADED` (verifikasi sebelum ada nilai), `400 VALIDATION_ERROR`.

---

## Kode error

| HTTP | `code` | Arti |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Body, path, atau query tidak valid (lihat `details`) |
| 400 | `BAD_REQUEST` | Body bukan JSON yang valid atau terlalu besar |
| 401 | `UNAUTHENTICATED` | Belum login atau sesi kedaluwarsa |
| 401 | `INVALID_CREDENTIALS` | Email atau password salah |
| 403 | `FORBIDDEN` | Role tidak diizinkan (mis. dosen memanggil `/api/users`) |
| 403 | `INVALID_ORIGIN` | Header `Origin` tidak diizinkan (CSRF) |
| 404 | `NOT_FOUND` | Route tidak ada |
| 404 | `EXAM_NOT_FOUND`, `QUESTION_NOT_FOUND`, `ANSWER_SHEET_NOT_FOUND` | Data tidak ada atau bukan milik Anda |
| 409 | `EMAIL_TAKEN`, `QUESTION_NUMBER_TAKEN`, `ANSWER_SHEET_EXISTS`, `ANSWER_SHEET_NOT_GRADED` | Konflik dengan data yang ada |
| 422 | `UNKNOWN_STUDENT` | NIM tidak terdaftar di tabel `students` |
| 429 | `TOO_MANY_REQUESTS` | Terlalu banyak percobaan login (lihat header `Retry-After`) |
| 500 | `INTERNAL_ERROR` | Error di server (detail hanya di log server) |
| 503 | `DATABASE_UNAVAILABLE` | Database tidak bisa dihubungi |

---

## Testing dengan Postman

Koleksi siap pakai: [`postman/SiPinter.postman_collection.json`](postman/SiPinter.postman_collection.json).

1. Jalankan database dan API:
   ```bash
   npm run db:up
   npm run db:migrate
   npm run db:seed      # opsional: reset data contoh
   npm run dev          # atau npm run dev:api
   ```
2. Di Postman: **Import** → pilih file koleksi di atas. Gunakan **Postman Desktop**. Postman versi web tidak bisa mengakses `localhost` tanpa Postman Agent.
3. Jalankan **1. Auth → Login (dosen)**. Postman otomatis menyimpan cookie `sipinter_session` untuk `localhost` (bisa dilihat lewat tombol **Cookies** di bawah tombol Send) dan mengirimnya di request berikutnya.
4. Jalankan request lain. Request "Buat ujian", "Buat soal", dan "Daftarkan lembar jawaban" menyimpan id baru ke variabel koleksi (`examId`, `questionId`, `sheetId`), sehingga request sesudahnya otomatis memakai data tersebut.
5. Untuk menjalankan semuanya sekaligus: klik kanan koleksi → **Run collection**. Folder 0–6 membuat ujian uji coba lalu menghapusnya kembali di folder **6. Cleanup**. Setiap request punya test yang mengecek status HTTP.
6. Folder **7. Admin (opsional)** login sebagai admin dan **benar-benar membuat akun baru** setiap kali dijalankan.

Variabel koleksi (tab **Variables** pada koleksi):

| Variabel | Default |
| --- | --- |
| `baseUrl` | `http://localhost:4000` |
| `lecturerEmail` | `budi.santoso@example.com` |
| `adminEmail` | `andi.pratama@example.com` |
| `password` | `sipinter-dev` (password seed development) |
| `examId`, `questionId`, `sheetId` | diisi otomatis |

Tips:

- **Ganti user**: jalankan Logout, lalu Login dengan email lain (ubah variabel `lecturerEmail`, mis. ke `siti.rahmawati@example.com` untuk mencoba akses ujian milik dosen lain → `404`).
- **`401 UNAUTHENTICATED`**: cookie belum tersimpan atau sesi habis. Login ulang.
- **`403 INVALID_ORIGIN`**: Anda menambahkan header `Origin` yang tidak sesuai `APP_ORIGIN`. Hapus header itu atau isi `http://localhost:3000`.
- Membuat request manual: pilih method dan URL `{{baseUrl}}/api/...`; untuk body pilih **Body → raw → JSON**.
- Koleksi juga bisa dijalankan dari terminal: `npx newman run apps/api/postman/SiPinter.postman_collection.json --folder "1. Auth" --folder "3. Exams"`.
