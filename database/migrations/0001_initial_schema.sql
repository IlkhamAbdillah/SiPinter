-- =========================================================
-- SIPINTER DATABASE
-- PostgreSQL / Supabase
-- English Naming Convention
-- =========================================================


-- =========================================================
-- 1. DROP EXISTING TABLES
-- =========================================================

DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS answer_keys CASCADE;
DROP TABLE IF EXISTS answer_sheets CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- =========================================================
-- 2. USERS
-- =========================================================
-- Stores lecturers / system users.

CREATE TABLE users (
    lecturer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    password TEXT NOT NULL
);


-- =========================================================
-- 3. STUDENTS
-- =========================================================
-- Stores student information.
-- student_id represents the student's NIM.

CREATE TABLE students (
    student_id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    study_program VARCHAR(100),
    enrollment_year INTEGER
);


-- =========================================================
-- 4. EXAMS
-- =========================================================
-- One lecturer can create many exams.

CREATE TABLE exams (
    exam_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lecturer_id INTEGER NOT NULL,
    exam_name VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,

    CONSTRAINT fk_exams_lecturer
        FOREIGN KEY (lecturer_id)
        REFERENCES users(lecturer_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 5. QUESTIONS
-- =========================================================
-- One exam can contain many questions.

CREATE TABLE questions (
    question_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id INTEGER NOT NULL,
    question_number INTEGER NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,

    CONSTRAINT fk_questions_exam
        FOREIGN KEY (exam_id)
        REFERENCES exams(exam_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Question numbers must be unique within an exam.
    CONSTRAINT unique_question_number
        UNIQUE (exam_id, question_number)
);


-- =========================================================
-- 6. ANSWER KEYS
-- =========================================================
-- One question has one answer key.

CREATE TABLE answer_keys (
    answer_key_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id INTEGER NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    keywords VARCHAR(255),

    CONSTRAINT fk_answer_keys_question
        FOREIGN KEY (question_id)
        REFERENCES questions(question_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- One answer key per question.
    CONSTRAINT unique_answer_key_question
        UNIQUE (question_id)
);


-- =========================================================
-- 7. ANSWER SHEETS
-- =========================================================
-- One answer sheet represents one student's submission
-- for one particular exam.

CREATE TABLE answer_sheets (
    answer_sheet_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id INTEGER NOT NULL,
    student_id VARCHAR(30) NOT NULL,
    file_path TEXT,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_answer_sheets_exam
        FOREIGN KEY (exam_id)
        REFERENCES exams(exam_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_answer_sheets_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- A student can only have one answer sheet
    -- for the same exam.
    CONSTRAINT unique_student_exam
        UNIQUE (exam_id, student_id)
);


-- =========================================================
-- 8. ANSWERS
-- =========================================================
-- One answer represents a student's answer
-- to one particular question.

CREATE TABLE answers (
    answer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    answer_sheet_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    student_answer_text TEXT,

    CONSTRAINT fk_answers_answer_sheet
        FOREIGN KEY (answer_sheet_id)
        REFERENCES answer_sheets(answer_sheet_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_answers_question
        FOREIGN KEY (question_id)
        REFERENCES questions(question_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- A question can only be answered once
    -- within the same answer sheet.
    CONSTRAINT unique_answer_per_question
        UNIQUE (answer_sheet_id, question_id)
);


-- =========================================================
-- 9. SCORES
-- =========================================================
-- One answer sheet has exactly one final score.

CREATE TABLE scores (
    score_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    answer_sheet_id INTEGER NOT NULL,
    score DOUBLE PRECISION NOT NULL,

    CONSTRAINT fk_scores_answer_sheet
        FOREIGN KEY (answer_sheet_id)
        REFERENCES answer_sheets(answer_sheet_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Enforces 1 : 1 relationship
    -- between answer_sheets and scores.
    CONSTRAINT unique_score_answer_sheet
        UNIQUE (answer_sheet_id),

    -- Score must be between 0 and 100.
    CONSTRAINT check_score_range
        CHECK (score >= 0 AND score <= 100)
);


-- =========================================================
-- 10. INDEXES
-- =========================================================

CREATE INDEX idx_exams_lecturer
    ON exams(lecturer_id);

CREATE INDEX idx_questions_exam
    ON questions(exam_id);

CREATE INDEX idx_answer_keys_question
    ON answer_keys(question_id);

CREATE INDEX idx_answer_sheets_exam
    ON answer_sheets(exam_id);

CREATE INDEX idx_answer_sheets_student
    ON answer_sheets(student_id);

CREATE INDEX idx_answers_answer_sheet
    ON answers(answer_sheet_id);

CREATE INDEX idx_answers_question
    ON answers(question_id);

CREATE INDEX idx_scores_answer_sheet
    ON scores(answer_sheet_id);
