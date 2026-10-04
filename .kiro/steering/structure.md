# Project Structure

## Current Layout

```
SiPinter/
├── README.md              # Short project overview and team roster
├── .gitignore             # Ignores /context
├── context/               # Local-only working context (git-ignored)
└── docs/                  # Jekyll documentation site (GitHub Pages)
    ├── _config.yml        # Jekyll config (just-the-docs theme, baseurl /SiPinter)
    ├── index.md           # Docs landing page
    └── Moduls/            # Course project module write-ups
        ├── modul-1.md     # Problem formulation
        ├── modul-2.md     # SDLC product development
        └── LeanCanvas.png # Lean business canvas image
```

## Conventions

- **Documentation** lives under `docs/` and is written in Markdown with Jekyll YAML front matter. Each page sets `layout`, `title`, and `nav_order`; sub-pages set `parent` to nest under a section.
- **Module docs** go in `docs/Moduls/` and follow the `modul-N.md` naming pattern. Internal links use the generated `.html` paths (e.g. `Moduls/modul-1.html`).
- **Assets** (images) are stored alongside the docs that reference them.
- **`context/`** is git-ignored; use it for local scratch/context files that should not be committed.

## When Adding Application Code

The stack is Next.js (frontend) + Supabase (backend), but no application directory exists yet. When scaffolding the app:
- Keep application source separate from the `docs/` site. Place the Next.js app in a dedicated folder at the repo root (e.g. `web/` or `app/`), following Next.js conventions (`app/` or `pages/`, `components/`, `lib/`, `public/`).
- Keep Supabase assets together (e.g. a `supabase/` folder for migrations, SQL, and config; a `lib/supabase` client helper in the Next.js app).
- Store secrets in `.env.local` (git-ignored); never commit Supabase keys.
- Update `structure.md` and `tech.md` to reflect the real layout and commands once scaffolded.
- Preserve the existing `docs/` Jekyll site and its GitHub Pages publishing setup.
