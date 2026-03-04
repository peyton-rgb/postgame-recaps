-- ============================================================
-- POSTGAME RECAPS — Database Schema
-- Run this in Supabase SQL Editor (or as a migration)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── CAMPAIGNS ──────────────────────────────────────────────
create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  client_name text not null,
  client_logo_url text,
  published boolean default false,
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Slug index for fast public lookups
create index idx_campaigns_slug on campaigns(slug);

-- ─── ATHLETES ───────────────────────────────────────────────
create table athletes (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  name text not null,
  school text not null,
  sport text not null,
  post_type text not null default 'IG Feed',
  post_url text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index idx_athletes_campaign on athletes(campaign_id);

-- ─── MEDIA ──────────────────────────────────────────────────
create table media (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references athletes(id) on delete cascade not null,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  type text not null check (type in ('image', 'video')),
  file_url text not null,
  thumbnail_url text, -- video thumbnail (user-uploaded image)
  sort_order integer default 0,
  is_video_thumbnail boolean default false,
  created_at timestamptz default now()
);

create index idx_media_athlete on media(athlete_id);
create index idx_media_campaign on media(campaign_id);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
-- Public: anyone can READ published campaigns and their data
-- Private: only authenticated users can write

alter table campaigns enable row level security;
alter table athletes enable row level security;
alter table media enable row level security;

-- Public read for published campaigns
create policy "Public can view published campaigns"
  on campaigns for select
  using (published = true);

-- Authenticated users can do everything
create policy "Auth users full access to campaigns"
  on campaigns for all
  using (auth.role() = 'authenticated');

-- Public read for athletes in published campaigns
create policy "Public can view athletes in published campaigns"
  on athletes for select
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = athletes.campaign_id
      and campaigns.published = true
    )
  );

create policy "Auth users full access to athletes"
  on athletes for all
  using (auth.role() = 'authenticated');

-- Public read for media in published campaigns
create policy "Public can view media in published campaigns"
  on media for select
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = media.campaign_id
      and campaigns.published = true
    )
  );

create policy "Auth users full access to media"
  on media for all
  using (auth.role() = 'authenticated');

-- ─── STORAGE BUCKET ─────────────────────────────────────────
-- Run these separately in Supabase Dashboard > Storage, or via SQL:

insert into storage.buckets (id, name, public)
values ('campaign-media', 'campaign-media', true)
on conflict do nothing;

-- Allow authenticated uploads
create policy "Auth users can upload media"
  on storage.objects for insert
  with check (
    bucket_id = 'campaign-media'
    and auth.role() = 'authenticated'
  );

-- Allow public reads
create policy "Public can view campaign media"
  on storage.objects for select
  using (bucket_id = 'campaign-media');

-- Allow authenticated deletes
create policy "Auth users can delete media"
  on storage.objects for delete
  using (
    bucket_id = 'campaign-media'
    and auth.role() = 'authenticated'
  );
