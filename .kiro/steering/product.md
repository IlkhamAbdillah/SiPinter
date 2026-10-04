# Product

## SiPinter

SiPinter is a planned cloud-based web application that assists lecturers and teaching assistants in grading student exams and assignments. It targets the heavy workload during midterm (UTS) and final (UAS) exam periods, where manual correction of hundreds of answer sheets causes fatigue and reduces accuracy and objectivity.

## Core Idea

Use Optical Character Recognition (OCR) and AI to extract and evaluate exam content from uploaded PDFs, following a **human-in-the-loop** approach: the system screens and proposes results, but the user always confirms and corrects before scores are saved.

## Key Features

- **File Input**: Bulk upload of PDF documents (question sheets, answer keys, student worksheets).
- **Smart Scanning & Extraction**: OCR + AI to detect multiple-choice and essay answers and extract text, questions, answers, and relevant keywords.
- **Screening Validation**: Side-by-side comparison (original vs. extracted text) where the user confirms or edits results before grading.
- **Database Storage**: Validated questions, answer keys, and student answers are stored securely.
- **Automatic Grading**: Exact matching for multiple choice; NLP semantic similarity and keyword detection for essays, producing an estimated score within a range.
- **Evaluation Report Export**: Download final score recaps as spreadsheets for integration with campus academic portals.
- **IAM**: Secure authentication with differentiated access levels for lecturers vs. teaching assistants.

## Status

Early stage. The repository currently contains project documentation only; application code has not been implemented yet.

## Team

TIF Team (Senior Project TI, Universitas Gadjah Mada):
- Muhammad Fachry Alfareeza — Project Manager & AI Engineer
- Muhammad Ilkham Abdillah — Cloud Engineer
- Monica Anastasya Dantina — Software Engineer & UI/UX

## Language Note

Project documentation and domain terminology are primarily in Indonesian. Prefer Indonesian for user-facing content and docs unless asked otherwise.
