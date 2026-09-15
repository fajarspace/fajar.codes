-- ============================================================================
-- fajar.codes — initial schema
-- Tables, indexes, foreign keys, updated_at triggers, RLS policies, storage.
--
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------

-- Keeps `updated_at` honest on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  full_name           text not null default '',
  username            text not null,
  headline            text,
  bio                 text,
  avatar_url          text,
  location            text,
  availability_status text not null default 'available'
                      check (availability_status in ('available', 'limited', 'unavailable')),
  current_activity    text,
  email               text,
  role                text not null default 'user' check (role in ('admin', 'user')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{2,40}$')
);

create unique index if not exists profiles_username_key on public.profiles (username);
create index if not exists profiles_role_idx on public.profiles (role);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Creates a profile row whenever a user signs up. Runs as the function owner
-- (security definer) so it can insert regardless of RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate     text;
  attempt       int := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)), '[^a-z0-9_]', '_', 'g'));
  if base_username is null or length(base_username) < 2 then
    base_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  base_username := substr(base_username, 1, 32);
  candidate := base_username;

  while exists (select 1 from public.profiles where username = candidate) loop
    attempt := attempt + 1;
    candidate := base_username || '_' || attempt;
  end loop;

  insert into public.profiles (id, email, username, full_name)
  values (
    new.id,
    new.email,
    candidate,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The single authorization primitive used by every policy below.
-- security definer so it can read profiles even though profiles has RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null,
  short_description text not null default '',
  content           text not null default '',
  category          text not null default 'web'
                    check (category in ('web', 'system', 'experiment', 'research')),
  year              int  not null default extract(year from now())::int
                    check (year between 1990 and 2100),
  role              text,
  tech_stack        text[] not null default '{}',
  cover_url         text,
  live_url          text,
  repository_url    text,
  -- 'draft' is unpublished; every other status is public.
  status            text not null default 'draft'
                    check (status in ('draft', 'in_progress', 'live', 'archived')),
  featured          boolean not null default false,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists projects_slug_key on public.projects (slug);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_featured_order_idx on public.projects (featured, sort_order, year desc);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- project_images
-- ----------------------------------------------------------------------------
create table if not exists public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  image_url  text not null,
  caption    text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_idx on public.project_images (project_id, sort_order);

-- ----------------------------------------------------------------------------
-- notes
-- ----------------------------------------------------------------------------
create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null,
  excerpt      text not null default '',
  content      text not null default '',
  cover_url    text,
  reading_time int  not null default 1 check (reading_time >= 1),
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint notes_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists notes_slug_key on public.notes (slug);
create index if not exists notes_status_published_idx on public.notes (status, published_at desc);

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- Stamp published_at the first time a note is published.
create or replace function public.set_note_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists notes_set_published_at on public.notes;
create trigger notes_set_published_at
  before insert or update of status on public.notes
  for each row execute function public.set_note_published_at();

-- ----------------------------------------------------------------------------
-- tags & note_tags
-- ----------------------------------------------------------------------------
create table if not exists public.tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  constraint tags_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists tags_slug_key on public.tags (slug);

create table if not exists public.note_tags (
  note_id uuid not null references public.notes (id) on delete cascade,
  tag_id  uuid not null references public.tags (id) on delete cascade,
  primary key (note_id, tag_id)
);

create index if not exists note_tags_tag_idx on public.note_tags (tag_id);

-- ----------------------------------------------------------------------------
-- timeline
-- ----------------------------------------------------------------------------
create table if not exists public.timeline (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  organization text,
  description  text,
  start_date   date not null,
  end_date     date,
  is_current   boolean not null default false,
  sort_order   int not null default 0,
  constraint timeline_dates check (end_date is null or end_date >= start_date)
);

create index if not exists timeline_order_idx on public.timeline (sort_order, start_date desc);

-- ----------------------------------------------------------------------------
-- now_items
-- ----------------------------------------------------------------------------
create table if not exists public.now_items (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('building', 'learning', 'reading', 'thinking')),
  title       text not null,
  description text,
  url         text,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists now_items_active_idx on public.now_items (is_active, updated_at desc);

drop trigger if exists now_items_set_updated_at on public.now_items;
create trigger now_items_set_updated_at
  before update on public.now_items
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
--   * published content is readable by everyone (anon + authenticated)
--   * drafts are readable only by admins
--   * insert / update / delete only by admins
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;
alter table public.notes          enable row level security;
alter table public.tags           enable row level security;
alter table public.note_tags      enable row level security;
alter table public.timeline       enable row level security;
alter table public.now_items      enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists "profiles: public can read the site owner" on public.profiles;
create policy "profiles: public can read the site owner"
  on public.profiles for select
  using (role = 'admin' or id = auth.uid());

drop policy if exists "profiles: admins update" on public.profiles;
create policy "profiles: admins update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profiles: admins delete" on public.profiles;
create policy "profiles: admins delete"
  on public.profiles for delete
  using (public.is_admin());
-- No insert policy on purpose: rows are created by the auth trigger only.

-- projects -------------------------------------------------------------------
drop policy if exists "projects: public read non-drafts" on public.projects;
create policy "projects: public read non-drafts"
  on public.projects for select
  using (status <> 'draft' or public.is_admin());

drop policy if exists "projects: admins insert" on public.projects;
create policy "projects: admins insert"
  on public.projects for insert
  with check (public.is_admin());

drop policy if exists "projects: admins update" on public.projects;
create policy "projects: admins update"
  on public.projects for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "projects: admins delete" on public.projects;
create policy "projects: admins delete"
  on public.projects for delete
  using (public.is_admin());

-- project_images -------------------------------------------------------------
drop policy if exists "project_images: readable with parent project" on public.project_images;
create policy "project_images: readable with parent project"
  on public.project_images for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_images.project_id and p.status <> 'draft'
    )
  );

drop policy if exists "project_images: admins insert" on public.project_images;
create policy "project_images: admins insert"
  on public.project_images for insert
  with check (public.is_admin());

drop policy if exists "project_images: admins update" on public.project_images;
create policy "project_images: admins update"
  on public.project_images for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "project_images: admins delete" on public.project_images;
create policy "project_images: admins delete"
  on public.project_images for delete
  using (public.is_admin());

-- notes ----------------------------------------------------------------------
drop policy if exists "notes: public read published" on public.notes;
create policy "notes: public read published"
  on public.notes for select
  using (status = 'published' or public.is_admin());

drop policy if exists "notes: admins insert" on public.notes;
create policy "notes: admins insert"
  on public.notes for insert
  with check (public.is_admin());

drop policy if exists "notes: admins update" on public.notes;
create policy "notes: admins update"
  on public.notes for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "notes: admins delete" on public.notes;
create policy "notes: admins delete"
  on public.notes for delete
  using (public.is_admin());

-- tags -----------------------------------------------------------------------
drop policy if exists "tags: public read" on public.tags;
create policy "tags: public read"
  on public.tags for select
  using (true);

drop policy if exists "tags: admins insert" on public.tags;
create policy "tags: admins insert"
  on public.tags for insert
  with check (public.is_admin());

drop policy if exists "tags: admins update" on public.tags;
create policy "tags: admins update"
  on public.tags for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "tags: admins delete" on public.tags;
create policy "tags: admins delete"
  on public.tags for delete
  using (public.is_admin());

-- note_tags ------------------------------------------------------------------
drop policy if exists "note_tags: readable with parent note" on public.note_tags;
create policy "note_tags: readable with parent note"
  on public.note_tags for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.notes n
      where n.id = note_tags.note_id and n.status = 'published'
    )
  );

drop policy if exists "note_tags: admins insert" on public.note_tags;
create policy "note_tags: admins insert"
  on public.note_tags for insert
  with check (public.is_admin());

drop policy if exists "note_tags: admins delete" on public.note_tags;
create policy "note_tags: admins delete"
  on public.note_tags for delete
  using (public.is_admin());

-- timeline -------------------------------------------------------------------
drop policy if exists "timeline: public read" on public.timeline;
create policy "timeline: public read"
  on public.timeline for select
  using (true);

drop policy if exists "timeline: admins insert" on public.timeline;
create policy "timeline: admins insert"
  on public.timeline for insert
  with check (public.is_admin());

drop policy if exists "timeline: admins update" on public.timeline;
create policy "timeline: admins update"
  on public.timeline for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "timeline: admins delete" on public.timeline;
create policy "timeline: admins delete"
  on public.timeline for delete
  using (public.is_admin());

-- now_items ------------------------------------------------------------------
drop policy if exists "now_items: public read active" on public.now_items;
create policy "now_items: public read active"
  on public.now_items for select
  using (is_active or public.is_admin());

drop policy if exists "now_items: admins insert" on public.now_items;
create policy "now_items: admins insert"
  on public.now_items for insert
  with check (public.is_admin());

drop policy if exists "now_items: admins update" on public.now_items;
create policy "now_items: admins update"
  on public.now_items for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "now_items: admins delete" on public.now_items;
create policy "now_items: admins delete"
  on public.now_items for delete
  using (public.is_admin());

-- ============================================================================
-- Storage
--   One public bucket, folders per purpose:
--     avatars/  projects/covers/  projects/gallery/  notes/covers/
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: public read" on storage.objects;
create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media: admins upload" on storage.objects;
create policy "media: admins upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admins update" on storage.objects;
create policy "media: admins update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admins delete" on storage.objects;
create policy "media: admins delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ============================================================================
-- Grants (Supabase default roles)
-- ============================================================================
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
