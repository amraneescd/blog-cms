# Blog CMS — Project Plan (Firebase + Tailwind)

## Goals & Scope
- **Purpose**: A CMS to create, manage, and publish blog content with roles/permissions.
- **MVP**: Auth, posts CRUD, categories/tags, media upload, Markdown editor, draft/publish workflow, basic search, responsive UI.
- **Nice‑to‑have (v2)**: Scheduling, revisions history, comments moderation, analytics, i18n, plugin system.

## Tech Stack
- **Frontend**: React + TypeScript, React Router, TailwindCSS, shadcn/ui.
- **State/Forms**: React Query (or direct Firestore listeners), Zustand, React Hook Form + Zod.
- **Backend**: Firebase (Firestore, Auth, Storage). Optional Firebase Cloud Functions for privileged tasks.
- **Database**: Firestore (document database).
- **Auth**: Firebase Authentication (Email/Password, OAuth), custom claims for RBAC.
- **Storage**: Firebase Storage for media.
- **Build/Tooling**: Vite, ESLint, Prettier, Vitest.
- **Deployment**: Firebase Hosting; Firebase Emulators for local dev.

## Architecture
- **Single app** with `frontend/` (or current `src/`) consuming Firebase directly.
- **Frontend structure** (respect rule: components live in `components/`):
  - `src/components/` shared UI components
  - `src/pages/` routed pages (Dashboard, Posts, Editor, Media, Settings)
  - `src/features/` domain slices (posts, auth, media)
  - `src/hooks/`, `src/lib/` (firebase client), `src/styles/`
- **Cloud Functions (optional)** for actions requiring admin privileges (e.g., slug uniqueness checks at scale, scheduled jobs, admin analytics export).

## Data Model (Firestore)
- **users/{userId}**: email, name, role [ADMIN, EDITOR, AUTHOR], createdAt, updatedAt
- **posts/{postId}**: title, slug, content (Markdown), excerpt, coverMediaId, status [DRAFT, PUBLISHED], publishedAt, authorId, createdAt, updatedAt
- **categories/{categoryId}**: name, slug
- **tags/{tagId}**: name, slug
- **postCategories/{id}**: postId, categoryId (or store categoryIds on post)
- **postTags/{id}**: postId, tagId (or store tagIds on post)
- **media/{mediaId}**: url, storagePath, mimeType, size, uploadedById, createdAt
- **comments/{commentId}** (v2): postId, authorName/email, content, status

## API & Access
- **Client-first**: Use Firebase SDK (Firestore, Auth, Storage) directly from the client.
- **Security Rules**: Firestore and Storage rules enforce read/write access. RBAC via `role` custom claims.
- **Cloud Functions (optional)**:
  - `onCall` endpoints for admin-only operations (e.g., set roles, revalidate slugs, scheduled publish in v2).
  - `onWrite` triggers for denormalization/index updates if needed.

## Frontend Pages
- **Auth**: Login/Register
- **Dashboard**: stats (v2 via aggregated docs or Functions)
- **Posts**: List with filters, bulk actions
- **Editor**: Markdown + toolbar, image upload to Storage, autosave drafts, preview pane
- **Media Library**: grid with upload/drop to Storage, copy URL
- **Taxonomy**: categories/tags CRUD
- **Settings**: profile, site settings (v2)

## Security & Access Control
- **Auth flow**: Firebase Auth state; tokens auto-refreshed by SDK.
- **RBAC**: Custom claims `role` with guards in UI and checks in Security Rules/Functions.
- **Validation**: Zod on client before writes; server-side validation in Functions when used.
- **Rules**:
  - Posts: Authors can write their own drafts; Editors/Admins can publish; public can read published posts.
  - Media: Only authenticated uploads; read public URLs.

## Non‑Functional
- **Testing**: unit (Vitest), integration with Firebase Emulator Suite; e2e (Playwright, v2).
- **Lint/Format**: ESLint + Prettier; commit hooks with lint-staged.
- **Logging**: Console + Firebase Analytics (v2 as needed).

## Milestones
- **M1: Setup**
  - Init repo, Vite + React + TS + Tailwind + shadcn/ui; scaffold `src/components/`
  - Add Firebase SDK, project config, and Emulator Suite
  - Create `src/lib/firebase.ts` to init app, auth, firestore, storage
- **M2: Auth & RBAC**
  - Auth screens; sign in/up; profile doc creation; role handling with custom claims (via small admin Function or manual for dev)
  - Protected routes and guards
- **M3: Posts & Taxonomy**
  - Firestore collections; queries with filters; slugs; client-side search or Algolia (v2)
  - UI: posts list, editor with autosave/preview; categories/tags management
- **M4: Media**
  - Upload to Firebase Storage; metadata doc in `media`
  - UI: media library, picker in editor
- **M5: Publish Workflow**
  - Draft/Publish, slugs, SEO fields
  - Public site pages consuming published posts
- **M6: Hardening & DX**
  - Emulator tests, error handling, rules hardening, docs, CI

## Environment & Config
- `.env` (frontend):
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
  - `VITE_USE_EMULATORS=true` for local

## Notes
- Always place reusable UI in `src/components/` per team rule.
- Before adding packages, verify they aren't already installed.
