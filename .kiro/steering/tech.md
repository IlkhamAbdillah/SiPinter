# Tech Stack

## Current State

The repository currently holds **documentation only**. The application stack is chosen (Next.js + Supabase) but not yet scaffolded — no application code, build system, or dependency manifests exist yet.

## Documentation Site

- **Jekyll** static site generator, hosted on **GitHub Pages**.
- Theme: `just-the-docs` (via `remote_theme`), with search and navigation enabled.
- Config: `docs/_config.yml`. Published at `https://ilkhamabdillah.github.io/SiPinter`.
- Docs are Markdown files with YAML front matter (`layout`, `title`, `nav_order`, `parent`).

## Application Stack

- **Frontend**: Next.js (React).
- **Backend**: Supabase (for the time being) — Postgres database, Auth, Storage, and auto-generated APIs.
  - Use **Supabase Auth** for Identity and Access Management (IAM), with roles distinguishing lecturers from teaching assistants (enforce access via Row Level Security policies).
  - Use **Supabase Storage** for uploaded PDF files (question sheets, answer keys, student worksheets).
  - Use the **Supabase Postgres** database for validated exam data (questions, answer keys, student answers, scores).

Still to be decided (confirm with the team before implementing, then document here):
- OCR engine/service for PDF text extraction.
- AI / NLP approach for answer screening and essay grading (semantic similarity, keyword detection).

> Note: Supabase is the current/interim backend choice. Keep backend integration reasonably decoupled so it can evolve later.

## Common Commands

### Documentation (Jekyll)

Run from the `docs/` directory:

```bash
bundle install        # install Jekyll + theme dependencies (first time)
bundle exec jekyll serve   # local preview with live reload
bundle exec jekyll build   # build static site into _site/
```

### Application (Next.js)

Run from the frontend app directory once scaffolded:

```bash
npm install        # install dependencies
npm run dev        # start the Next.js dev server (run manually in your terminal)
npm run build      # production build
npm run start      # serve the production build
npm run lint       # run ESLint
```

> The scaffold does not exist yet. Create the Next.js app, then verify/adjust these commands and the package manager (npm/pnpm/yarn) here.
