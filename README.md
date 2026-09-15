# fajar.codes

A personal workspace on the web — projects, notes, experiments and whatever is currently on the desk.
Minimal, editorial, typography-first. Built with React + TypeScript + Vite on the front, Supabase (Postgres, Auth, Storage) behind it.

- **Public pages**: `/` (index), `/work`, `/work/:slug`, `/notes`, `/notes/:slug`, `/photos` (photo wall + lightbox), and a 404 that admits it.
- **Admin**: `/admin` — email/password login, dashboard, CRUD for projects (with gallery), notes (with tags), photo gallery (drag-and-drop upload), "Now" items and profile. Only accounts with `role = 'admin'` get in — enforced by Row Level Security, not just by the UI.
- **Details**: ⌘K / Ctrl+K command palette, project thumbnails that follow the cursor, realtime WIB clock in the footer, reading progress + auto table of contents + copy buttons on notes, list/index view toggle, random-note button, a couple of typed easter eggs (`fajar`, `hello`, `coffee`, `dark`, `light`), dark mode, and `prefers-reduced-motion` respected everywhere.

## Stack

React 19 · TypeScript (strict) · Vite 8 · Tailwind CSS 4 · React Router 7 · Framer Motion · Lucide · Supabase JS · React Hook Form + Zod · react-markdown + rehype-highlight

## Project structure

```text
src/
├── components/
│   ├── common/        Button, Markdown, SmartImage, CommandPalette, Lightbox, Toaster, …
│   ├── layout/        PublicLayout, AdminLayout
│   ├── navigation/    Navbar, MobileMenu, Footer
│   ├── project/       ProjectList/Row, HoverThumbnail, ProjectFilters, ProjectGallery, NextProject
│   ├── notes/         NoteList, NoteFilters, ReadingProgress, TableOfContents, ShareButton, …
│   └── admin/         Field primitives, ImageUpload, MarkdownEditor, GalleryManager, RequireAdmin, …
├── pages/
│   ├── public/        Home, Work, ProjectDetail, Notes, NoteDetail, Photos, NotFound
│   └── admin/         Login, Dashboard, Projects, ProjectEditor, Notes, NoteEditor, Photos, Now, Profile
├── hooks/             useQuery (cached fetching), useAuth, useTheme, useToast, useSeo, useHotkey, …
├── lib/               env, supabase client, query cache
├── services/          All Supabase queries + mappers to domain types (one file per resource)
├── types/             database.ts (schema types) · content.ts (domain types)
├── utils/             cn, format, markdown, mappers, validation (zod), image optimisation, errors
├── constants/         site config, random facts, sample content
└── styles/            globals.css (tokens, base), prose.css (markdown + highlight theme)
supabase/
├── migrations/        20260915000000_initial_schema.sql — tables, indexes, triggers, RLS, storage
│                      20260916000000_gallery.sql — gallery_photos table + policies
│                      20260916000001_drop_timeline.sql — removes the unused timeline table
└── seed.sql           Sample content (generated from src/constants/sample-content.ts)
scripts/               generate-sitemap.mjs · generate-seed.mjs · generate-covers.mjs
```

The public site works without Supabase: when `VITE_SUPABASE_URL` or the key is missing it renders the bundled sample content, so you can `npm run dev` immediately. The admin needs a real project.

## 1. Local setup

```bash
npm install
cp .env.example .env      # fill in later, or leave empty to run on sample content
npm run dev               # http://localhost:5173
```

Other scripts:

| Script                  | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run build`         | Generates `public/sitemap.xml`, type-checks, builds to `dist/`    |
| `npm run preview`       | Serves the production build                                       |
| `npm run typecheck`     | `tsc -b` without emitting                                         |
| `npm run lint`          | oxlint                                                            |
| `npm run sitemap`       | Regenerates the sitemap (uses Supabase if `.env` is set)          |
| `npm run seed:generate` | Regenerates `supabase/seed.sql` from the sample content           |

Node 22.6+ is required (the scripts use `--experimental-strip-types`).

## 2. Supabase configuration

1. Create a project at [supabase.com](https://supabase.com).
2. **Project settings → API Keys**: copy the project URL and the **publishable key** (`sb_publishable_…`) into `.env`. The legacy `anon` JWT works too — the app accepts either name:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   # or: VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_SITE_URL=https://fajar.codes
   ```

   Never put the `service_role` / secret key in the frontend.

3. **Authentication → Providers**: keep *Email* enabled. For a single-owner site you can disable *Confirm email* to log in immediately, or confirm the email once.
4. **Authentication → Users → Add user**: create the admin account (email + password).

### Running the migration

Option A — SQL editor (quickest):

1. Open **SQL Editor** and run each file in `supabase/migrations/` in order (by filename).
2. Paste `supabase/seed.sql`, replace `CHANGE_ME@example.com` at the bottom with the email of the user you created, run it. This inserts the sample projects/notes/timeline and promotes your account to `admin`.

Option B — Supabase CLI:

```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push                       # applies supabase/migrations/*
supabase db query --file supabase/seed.sql   # optional sample content (edit the email first)
```

If you skipped the seed, promote your account by hand:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign out and back in after changing the role — the app reads it from `profiles`.

### What the migration creates

- Tables: `profiles`, `projects`, `project_images`, `notes`, `tags`, `note_tags`, `now_items`, `gallery_photos` with indexes, foreign keys and check constraints.
- Triggers: `set_updated_at` on the mutable tables, `handle_new_user` (creates a profile row on sign-up), `set_note_published_at`.
- `public.is_admin()` — a `security definer` function used by every policy.
- **RLS** on every table: published/active rows are readable by anyone; drafts only by admins; insert/update/delete only by admins.
- **Storage**: one public bucket `media` (10 MB limit, images only) with folders `avatars/`, `projects/covers/`, `projects/gallery/`, `notes/covers/`, `gallery/`. Public read, admin-only write.

The React `RequireAdmin` guard is a convenience for the UI. Authorization is checked in Postgres for every request that carries the anon key, so a modified client cannot read drafts or write anything.

### Regenerating types

`src/types/database.ts` is hand-maintained to mirror the migration. If you change the schema you can regenerate it:

```bash
supabase gen types typescript --linked > src/types/database.ts
```

## 3. Deploy to Vercel

1. Push the repository to GitHub/GitLab and import it in Vercel (framework preset: **Vite**).
2. Add the environment variables in **Settings → Environment Variables**:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`), `VITE_SITE_URL` (your production URL, no trailing slash).
3. Deploy. `vercel.json` rewrites every path to `index.html` for client-side routing and sets long cache headers on `/assets`.
4. In Supabase, add your Vercel domain to **Authentication → URL configuration → Site URL / Redirect URLs**.

The build runs `npm run sitemap` first, so the sitemap includes every published project and note at deploy time. Set up a Vercel *Deploy Hook* and call it after publishing if you want the sitemap to refresh automatically.

## Content & design notes

- Socials, coordinates and the wordmark live in `src/constants/site.ts`; the rotating “random thoughts” in `src/constants/facts.ts`.
- Colour tokens and the type scale are in `src/styles/globals.css`; the markdown/prose and syntax-highlight theme in `src/styles/prose.css`.
- Sample covers are lightweight SVGs generated by `scripts/generate-covers.mjs`. Replace `public/og.png` with your own 1200×630 image.
- Uploads are resized to 1800 px and converted to WebP in the browser before they hit storage.
