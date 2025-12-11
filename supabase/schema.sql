-- Enable extensions
create extension if not exists pgcrypto;

-- Timestamp trigger to maintain updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

-- USERS
create table if not exists public.users (
  id uuid primary key default auth.uid(),
  email text unique not null,
  name text,
  role text not null default 'AUTHOR' check (role in ('ADMIN','EDITOR','AUTHOR')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
before update on public.users
for each row execute procedure set_updated_at();

alter table public.users enable row level security;

-- Only the user can view/update their row; admins can do all
create policy users_select_self on public.users
for select using (auth.uid() = id);

create policy users_update_self on public.users
for update using (auth.uid() = id);

create policy users_admin_all on public.users
for all using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'ADMIN'
  )
);

-- POSTS
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content_md text,
  excerpt text,
  cover_media_id uuid,
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED')),
  published_at timestamptz,
  author_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_author_idx on public.posts(author_id);
create index if not exists posts_status_idx on public.posts(status);

create trigger posts_set_updated_at
before update on public.posts
for each row execute procedure set_updated_at();

alter table public.posts enable row level security;

-- Public can read published posts
create policy posts_read_published on public.posts
for select using (status = 'PUBLISHED');

-- Authors can read their own drafts
create policy posts_read_own_drafts on public.posts
for select using (auth.uid() = author_id);

-- Authors can insert their own drafts
create policy posts_insert_author on public.posts
for insert with check (auth.uid() = author_id);

-- Authors can update/delete their own posts
create policy posts_update_delete_author on public.posts
for update using (auth.uid() = author_id);

create policy posts_delete_author on public.posts
for delete using (auth.uid() = author_id);

-- Editors/Admins can manage all posts
create policy posts_moderate_editor_admin on public.posts
for all using (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
);

-- CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

alter table public.categories enable row level security;
create policy categories_read_all on public.categories for select using (true);

-- Editors/Admins manage categories
create policy categories_write_editor_admin on public.categories
for all using (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
) with check (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
);

-- TAGS
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

alter table public.tags enable row level security;
create policy tags_read_all on public.tags for select using (true);

create policy tags_write_editor_admin on public.tags
for all using (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
) with check (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
);

-- POST JOIN TABLES
create table if not exists public.post_categories (
  post_id uuid not null references public.posts(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (post_id, category_id)
);

alter table public.post_categories enable row level security;
create policy post_categories_read_all on public.post_categories for select using (true);

-- Only editors/admins can modify post-category relations
create policy post_categories_write_editor_admin on public.post_categories
for all using (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
) with check (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

alter table public.post_tags enable row level security;
create policy post_tags_read_all on public.post_tags for select using (true);

create policy post_tags_write_editor_admin on public.post_tags
for all using (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
) with check (
  exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
);

-- MEDIA
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  mime_type text,
  size bigint,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

create policy media_read_all on public.media for select using (true);

-- Authenticated users can upload metadata rows
create policy media_insert_auth on public.media
for insert with check (auth.uid() is not null);

-- Owners or editors/admins can delete
create policy media_delete_owner_or_editor_admin on public.media
for delete using (
  uploaded_by = auth.uid() or exists (
    select 1 from public.users u where u.id = auth.uid() and u.role in ('EDITOR','ADMIN')
  )
);

-- NOTE: Supabase Storage bucket policies are configured via the Storage settings UI/API.
-- Create a bucket (e.g., `media`) and set policies to allow authenticated uploads and public read for published assets.
