-- =========================================================
-- SIPINTER: DUMMY DATA
-- PostgreSQL
-- Run with `npm run db:seed` after `npm run db:migrate`.
--
-- DEVELOPMENT/TEST DATA ONLY. The seed runner refuses to run
-- when NODE_ENV=production and wraps all seed files in one
-- transaction, so this file has no BEGIN/COMMIT of its own.
--
-- The seed is repeatable: it first empties every table and
-- resets identity counters, so the hard-coded ids below
-- (lecturer_id 1, exam_id 1, ...) always line up.
--
-- LOGIN: every seeded account uses the development password
--   sipinter-dev
-- (scrypt hashes below). Never use these accounts outside
-- local development.
-- =========================================================

TRUNCATE TABLE
    sessions,
    scores,
    answers,
    answer_sheets,
    answer_keys,
    questions,
    exams,
    students,
    users
RESTART IDENTITY CASCADE;

-- =========================================================
-- 1. USERS (LECTURERS)
-- =========================================================

INSERT INTO users (name, email, role, password) VALUES
('Budi Santoso', 'budi.santoso@example.com', 'lecturer',
 'scrypt$32768$8$3$VXa2uSwLjYeVWtwTQ1b/Jg==$8d1bE8NxJIo2aJUuHD+hTl476b4lCAxOmr2LD8AB1Qs='),
('Siti Rahmawati', 'siti.rahmawati@example.com', 'lecturer',
 'scrypt$32768$8$3$cEQBZ/Tae/hRqLdPpu9tpA==$KgUbKbqfl6zuVhfaMws7UxztMvpppCPbFvnWXMRIsEQ='),
('Andi Pratama', 'andi.pratama@example.com', 'admin',
 'scrypt$32768$8$3$H/lhjthY+OmFoXcjADI5SQ==$CmPHD0SoFmUjcNf/kTkwPN5rb4rgDaIJ1qhC4fEzKe8=');


-- =========================================================
-- 2. STUDENTS
-- =========================================================

INSERT INTO students
(student_id, name, email, study_program, enrollment_year)
VALUES
('240001', 'Muhammad Rizky', 'rizky@example.com', 'Informatika', 2024),
('240002', 'Nur Aisyah', 'aisyah@example.com', 'Informatika', 2024),
('240003', 'Dimas Saputra', 'dimas@example.com', 'Informatika', 2024),
('240004', 'Putri Maharani', 'putri@example.com', 'Informatika', 2024),
('240005', 'Fajar Nugroho', 'fajar@example.com', 'Teknologi Informasi', 2024),
('240006', 'Nadia Permata', 'nadia@example.com', 'Teknologi Informasi', 2024),
('240007', 'Rafi Kurniawan', 'rafi@example.com', 'Teknologi Informasi', 2024),
('240008', 'Intan Lestari', 'intan@example.com', 'Teknologi Informasi', 2024),
('240009', 'Bagas Ramadhan', 'bagas@example.com', 'Informatika', 2023),
('240010', 'Dewi Anggraini', 'dewi@example.com', 'Informatika', 2023);


-- =========================================================
-- 3. EXAMS
-- =========================================================

INSERT INTO exams (lecturer_id, exam_name, exam_date) VALUES
(1, 'Ujian Basis Data', '2026-10-01'),
(1, 'Ujian Algoritma dan Pemrograman', '2026-10-05'),
(2, 'Ujian Rekayasa Perangkat Lunak', '2026-10-10');


-- =========================================================
-- 4. QUESTIONS
-- Each exam contains 5 questions.
-- =========================================================

INSERT INTO questions
(exam_id, question_number, question_type, question_text)
VALUES
-- Exam 1: Database
(1, 1, 'essay', 'Jelaskan perbedaan primary key dan foreign key.'),
(1, 2, 'essay', 'Apa yang dimaksud dengan normalisasi database?'),
(1, 3, 'essay', 'Jelaskan fungsi JOIN dalam SQL.'),
(1, 4, 'essay', 'Apa perbedaan DELETE, TRUNCATE, dan DROP?'),
(1, 5, 'essay', 'Jelaskan konsep relasi one-to-many.'),

-- Exam 2: Algorithms
(2, 1, 'essay', 'Jelaskan perbedaan array dan linked list.'),
(2, 2, 'essay', 'Apa yang dimaksud dengan kompleksitas waktu algoritma?'),
(2, 3, 'essay', 'Jelaskan cara kerja binary search.'),
(2, 4, 'essay', 'Apa perbedaan stack dan queue?'),
(2, 5, 'essay', 'Jelaskan konsep rekursi dalam pemrograman.'),

-- Exam 3: Software Engineering
(3, 1, 'essay', 'Apa yang dimaksud dengan software requirement?'),
(3, 2, 'essay', 'Jelaskan perbedaan functional dan non-functional requirements.'),
(3, 3, 'essay', 'Apa tujuan penggunaan UML dalam pengembangan perangkat lunak?'),
(3, 4, 'essay', 'Jelaskan tahapan utama dalam model Waterfall.'),
(3, 5, 'essay', 'Apa manfaat pengujian perangkat lunak?');


-- =========================================================
-- 5. ANSWER KEYS
-- =========================================================

INSERT INTO answer_keys (question_id, correct_answer, keywords)
VALUES
(1, 'Primary key mengidentifikasi baris secara unik, sedangkan foreign key mereferensikan key pada tabel lain.',
 'primary key,foreign key,unik,referensi'),
(2, 'Normalisasi adalah proses menyusun struktur tabel untuk mengurangi redundansi dan anomali data.',
 'normalisasi,redundansi,anomali'),
(3, 'JOIN menggabungkan data dari dua atau lebih tabel berdasarkan kondisi relasi.',
 'join,menggabungkan tabel,relasi'),
(4, 'DELETE menghapus baris, TRUNCATE mengosongkan tabel, dan DROP menghapus struktur tabel.',
 'delete,truncate,drop'),
(5, 'One-to-many berarti satu record pada tabel pertama dapat berhubungan dengan banyak record pada tabel kedua.',
 'one-to-many,satu,banyak,relasi'),
(6, 'Array menyimpan elemen secara berurutan dalam memori, sedangkan linked list menghubungkan node melalui pointer.',
 'array,linked list,node,pointer'),
(7, 'Kompleksitas waktu menggambarkan pertumbuhan kebutuhan waktu algoritma terhadap ukuran input.',
 'kompleksitas waktu,algoritma,input'),
(8, 'Binary search membagi ruang pencarian menjadi dua bagian berulang kali pada data yang terurut.',
 'binary search,data terurut,membagi dua'),
(9, 'Stack menggunakan prinsip LIFO, sedangkan queue menggunakan prinsip FIFO.',
 'stack,lifo,queue,fifo'),
(10, 'Rekursi adalah teknik ketika fungsi memanggil dirinya sendiri dengan kondisi penghentian.',
 'rekursi,fungsi,kondisi penghentian'),
(11, 'Software requirement mendeskripsikan kebutuhan atau kemampuan yang harus dipenuhi sistem.',
 'requirement,kebutuhan,sistem'),
(12, 'Functional requirement menjelaskan fungsi sistem, sedangkan non-functional requirement menjelaskan kualitas atau batasan sistem.',
 'functional,fungsi,non-functional,kualitas'),
(13, 'UML digunakan untuk memvisualisasikan dan mendokumentasikan struktur serta perilaku sistem.',
 'uml,visualisasi,dokumentasi'),
(14, 'Waterfall menjalankan tahapan berurutan seperti analisis, desain, implementasi, pengujian, dan pemeliharaan.',
 'analisis,desain,implementasi,pengujian,pemeliharaan'),
(15, 'Pengujian membantu menemukan cacat dan memeriksa apakah sistem memenuhi kebutuhan.',
 'pengujian,bug,kebutuhan,kualitas');


-- =========================================================
-- 6. ANSWER SHEETS
-- One row per student per exam.
-- file_path values are placeholders for testing.
-- =========================================================

INSERT INTO answer_sheets
(exam_id, student_id, file_path, verification_status)
VALUES
(1, '240001', 'dummy/exams/1/240001.pdf', 'verified'),
(1, '240002', 'dummy/exams/1/240002.pdf', 'verified'),
(1, '240003', 'dummy/exams/1/240003.pdf', 'pending'),
(2, '240001', 'dummy/exams/2/240001.pdf', 'verified'),
(2, '240004', 'dummy/exams/2/240004.pdf', 'verified'),
(3, '240005', 'dummy/exams/3/240005.pdf', 'pending');


-- =========================================================
-- 7. ANSWERS
-- Each answer_sheet receives 5 answers.
-- =========================================================

INSERT INTO answers
(answer_sheet_id, question_id, student_answer_text)
VALUES
-- Sheet 1: Student 240001, Database
(1, 1, 'Primary key adalah identitas unik, sedangkan foreign key menghubungkan tabel.'),
(1, 2, 'Normalisasi mengurangi duplikasi dan menjaga konsistensi data.'),
(1, 3, 'JOIN menggabungkan data berdasarkan kolom yang berhubungan.'),
(1, 4, 'DELETE menghapus baris, TRUNCATE mengosongkan tabel, DROP menghapus tabel.'),
(1, 5, 'Satu data dapat berhubungan dengan banyak data lain.'),

-- Sheet 2: Student 240002, Database
(2, 1, 'Primary key unik, foreign key adalah referensi ke tabel lain.'),
(2, 2, 'Normalisasi adalah proses mengatur tabel agar tidak redundan.'),
(2, 3, 'JOIN mengambil data dari beberapa tabel.'),
(2, 4, 'DELETE menghapus data, TRUNCATE mengosongkan tabel, DROP menghapus tabel.'),
(2, 5, 'Satu record berhubungan dengan banyak record.'),

-- Sheet 3: Student 240003, Database
(3, 1, 'Primary key untuk identitas, foreign key untuk hubungan tabel.'),
(3, 2, 'Normalisasi membuat database lebih terstruktur.'),
(3, 3, 'JOIN digunakan untuk menggabungkan tabel.'),
(3, 4, 'Perintah tersebut digunakan untuk menghapus data atau struktur.'),
(3, 5, 'Satu entitas bisa memiliki banyak entitas terkait.'),

-- Sheet 4: Student 240001, Algorithms
(4, 6, 'Array menyimpan elemen berurutan, linked list menghubungkan node.'),
(4, 7, 'Kompleksitas waktu mengukur pertumbuhan waktu berdasarkan ukuran input.'),
(4, 8, 'Binary search membagi pencarian menjadi dua pada data terurut.'),
(4, 9, 'Stack adalah LIFO dan queue adalah FIFO.'),
(4, 10, 'Rekursi adalah fungsi yang memanggil dirinya sendiri.'),

-- Sheet 5: Student 240004, Algorithms
(5, 6, 'Array menggunakan indeks, linked list menggunakan hubungan antar-node.'),
(5, 7, 'Kompleksitas waktu menunjukkan efisiensi waktu algoritma.'),
(5, 8, 'Binary search memeriksa elemen tengah dan mempersempit pencarian.'),
(5, 9, 'Stack mengambil data terakhir lebih dahulu, queue mengambil data pertama lebih dahulu.'),
(5, 10, 'Rekursi membutuhkan kondisi dasar agar berhenti.'),

-- Sheet 6: Student 240005, Software Engineering
(6, 11, 'Requirement menjelaskan kebutuhan sistem yang dikembangkan.'),
(6, 12, 'Functional adalah fitur, non-functional adalah kualitas sistem.'),
(6, 13, 'UML membantu menggambarkan rancangan sistem.'),
(6, 14, 'Waterfall dimulai dari analisis, desain, implementasi, pengujian, dan pemeliharaan.'),
(6, 15, 'Testing menemukan bug dan memeriksa kesesuaian sistem.') ;


-- =========================================================
-- 8. SCORES
-- One score per answer sheet.
-- These are illustrative test scores, not auto-calculated.
-- =========================================================

INSERT INTO scores (answer_sheet_id, score)
VALUES
(1, 88.5),
(2, 82.0),
(3, 70.0),
(4, 91.0),
(5, 86.5),
(6, 78.0);
