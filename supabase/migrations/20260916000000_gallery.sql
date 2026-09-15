-- ============================================================================
-- fajar.codes — gallery photos
-- Run after 20260915000000_initial_schema.sql (needs public.is_admin()).
-- ============================================================================

create table if not exists public.gallery_photos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null default '',
  caption      text,
  image_url    text not null,
  width        int check (width is null or width > 0),
  height       int check (height is null or height > 0),
  location     text,
  taken_at     date,
  is_published boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists gallery_photos_public_idx
  on public.gallery_photos (is_published, sort_order, taken_at desc);

drop trigger if exists gallery_photos_set_updated_at on public.gallery_photos;
create trigger gallery_photos_set_updated_at
  before update on public.gallery_photos
  for each row execute function public.set_updated_at();

-- RLS: published photos are public; everything else is admin-only.
alter table public.gallery_photos enable row level security;

drop policy if exists "gallery_photos: public read published" on public.gallery_photos;
create policy "gallery_photos: public read published"
  on public.gallery_photos for select
  using (is_published or public.is_admin());

drop policy if exists "gallery_photos: admins insert" on public.gallery_photos;
create policy "gallery_photos: admins insert"
  on public.gallery_photos for insert
  with check (public.is_admin());

drop policy if exists "gallery_photos: admins update" on public.gallery_photos;
create policy "gallery_photos: admins update"
  on public.gallery_photos for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "gallery_photos: admins delete" on public.gallery_photos;
create policy "gallery_photos: admins delete"
  on public.gallery_photos for delete
  using (public.is_admin());

grant select on public.gallery_photos to anon, authenticated;
grant insert, update, delete on public.gallery_photos to authenticated;

-- Photos live in the existing public `media` bucket under gallery/.
