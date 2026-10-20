-- =========================================================
-- Migration 0003: allowed question types and sheet statuses
-- =========================================================
-- Question types follow the AI grading pipeline, which has one
-- grader per type: multiple choice, short answer and essay.
--
-- An answer sheet is `pending` until the lecturer has reviewed
-- the automatic grading result, then `verified`.
--
-- If a shared database already holds other values, this
-- migration fails and nothing is changed; clean the data up
-- first instead of editing this file.
-- =========================================================

ALTER TABLE questions
    ADD CONSTRAINT check_questions_type
        CHECK (question_type IN ('multiple_choice', 'short_answer', 'essay'));

ALTER TABLE answer_sheets
    ADD CONSTRAINT check_answer_sheets_verification_status
        CHECK (verification_status IN ('pending', 'verified'));
