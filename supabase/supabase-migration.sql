-- =============================================
-- Public Page Builder Tables: Deals, Press, Case Studies
-- =============================================

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name text NOT NULL,
  brand_logo_url text,
  athlete_name text,
  athlete_school text,
  athlete_sport text,
  deal_type text,
  tier text NOT NULL DEFAULT 'tier_1' CHECK (tier IN ('tier_1', 'tier_2', 'tier_3')),
  value text,
  description text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  date_announced date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Press Articles table
CREATE TABLE IF NOT EXISTS press_articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  publication text,
  author text,
  excerpt text,
  content text,
  external_url text,
  image_url text,
  category text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  published_date date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Case Studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand_name text NOT NULL,
  brand_logo_url text,
  category text,
  hero_stat text,
  hero_stat_label text,
  overview text,
  challenge text,
  solution text,
  results text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  highlights text[] NOT NULL DEFAULT '{}',
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  published_date date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Authenticated users: full access
CREATE POLICY "Authenticated users can do everything on deals"
  ON deals FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on press_articles"
  ON press_articles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on case_studies"
  ON case_studies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users: read published only
CREATE POLICY "Anyone can read published deals"
  ON deals FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Anyone can read published press_articles"
  ON press_articles FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Anyone can read published case_studies"
  ON case_studies FOR SELECT
  TO anon
  USING (published = true);
