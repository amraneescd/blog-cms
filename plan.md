# Blog CMS — Project Plan (Supabase + Tailwind)

## Goals & Scope
- **Purpose**: A CMS to create, manage, and publish blog content with roles/permissions.
- **MVP**: Auth, posts CRUD, categories/tags, media upload, Markdown editor, draft/publish workflow, basic search, responsive UI.
- **Nice‑to‑have (v2)**: Scheduling, revisions history, comments moderation, analytics, i18n, plugin system.

## Tech Stack
- **Frontend**: React + TypeScript, React Router, TailwindCSS, shadcn/ui.
- **State/Forms**: React Query, Zustand, React Hook Form + Zod.
- **Backend**: Supabase (Postgres, Auth, Storage, Row Level Security, Edge Functions).
- **Database**: PostgreSQL (managed by Supabase).
- **Auth**: Supabase Auth (email/password, OAuth). RBAC via roles/policies and optional user metadata.
- **Storage**: Supabase Storage buckets for media.
- **Build/Tooling**: Vite, ESLint, Prettier, Vitest.
- **Deployment**: Supabase-hosted backend; Vercel/Netlify/Firebase Hosting for frontend (any static hosting).

## Architecture
- **Single app** with `src/` consuming Supabase directly via `@supabase/supabase-js`.
- **Frontend structure** (respect rule: components live in `components/`):
  - `src/components/` shared UI components
  - `src/pages/` routed pages (Dashboard, Posts, Editor, Media, Settings)
  - `src/features/` domain slices (posts, auth, media)
  - `src/hooks/`, `src/lib/` (supabase client), `src/styles/`
- **Edge Functions (optional)** for privileged tasks (e.g., role assignment, scheduled publish via cron, webhooks).

## Data Model (PostgreSQL via Supabase)
- **users**: id (UUID), email, name, role [ADMIN, EDITOR, AUTHOR], created_at, updated_at
- **posts**: id (UUID), title, slug (unique), content_md, excerpt, cover_media_id, status [DRAFT, PUBLISHED], published_at, author_id (FK users), created_at, updated_at
- **categories**: id (UUID), name, slug (unique)
- **tags**: id (UUID), name, slug (unique)
- **post_categories**: post_id (FK), category_id (FK)
- **post_tags**: post_id (FK), tag_id (FK)
- **media**: id (UUID), path (storage object path), mime_type, size, uploaded_by (FK users), created_at
- **comments (v2)**: id (UUID), post_id (FK), author_name/email, content, status

## API & Access
- **Client-first**: Use Supabase JS client for SQL-like queries (`from('table')`) and Storage operations.
- **Security**: Row Level Security (RLS) policies enforce access control. Roles via `auth.uid()` checks and user `role` column.
- **Edge Functions (optional)**: endpoints for privileged ops (e.g., set roles, slug revalidation, scheduled publish in v2).

## Frontend Pages
- **Auth**: Login/Register
- **Dashboard**: stats (v2 via aggregated docs or Functions)
- **Posts**: List with filters, bulk actions
- **Editor**: Markdown + toolbar, image upload to Storage, autosave drafts, preview pane
- **Media Library**: grid with upload/drop to Storage, copy URL
- **Taxonomy**: categories/tags CRUD
- **Settings**: profile, site settings (v2)

## Security & Access Control
- **Auth flow**: Supabase Auth handles session and refresh tokens; client stores session.
- **RBAC**: `role` column in `users`; enforce via RLS policies.
- **Validation**: Zod on client; server-side validation in Edge Functions when needed.
- **RLS policies**:
  - Posts: authors can manage own drafts; editors/admins can publish; public can read published posts.
  - Media: authenticated uploads to bucket; public read for published assets.

## Non‑Functional
- **Testing**: unit (Vitest), integration with Firebase Emulator Suite; e2e (Playwright, v2).
- **Lint/Format**: ESLint + Prettier; commit hooks with lint-staged.
- **Logging**: Console + Firebase Analytics (v2 as needed).

## Milestones
- **M1: Setup**
  - Vite + React + TS + Tailwind + shadcn/ui; scaffold `src/components/`
  - Add `@supabase/supabase-js` and create `src/lib/supabase.ts`
  - Create SQL schema (tables/indexes) and enable RLS in Supabase
- **M2: Auth & RBAC**
  - Auth screens; sign in/up; profile row in `users`; set `role`
  - Protected routes and UI guards; write initial RLS policies
- **M3: Posts & Taxonomy**
  - CRUD with Supabase queries; slugs; filters/search (pg_trgm or text search in v2)
  - UI: posts list, editor with autosave/preview; categories/tags management
- **M4: Media**
  - Upload to Supabase Storage; store metadata in `media`
  - UI: media library, picker in editor
- **M5: Publish Workflow**
  - Draft/Publish, slugs, SEO fields
  - Public pages querying published posts
- **M6: Hardening & DX**
  - Tests, error handling, telemetry (optional), CI

## Environment & Config
- `.env` (frontend):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Notes
- Always place reusable UI in `src/components/` per team rule.
- Before adding packages, verify they aren't already installed.
