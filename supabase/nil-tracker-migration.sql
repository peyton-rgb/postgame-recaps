-- NIL Tracker Items table
-- Migrated from Wix CMS nil tracker collection

CREATE TABLE IF NOT EXISTS nil_tracker_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wix_id text UNIQUE,                    -- Original Wix item ID
  status text NOT NULL DEFAULT 'DRAFT',  -- PUBLISHED or DRAFT
  player_name text,
  college_name text,
  title text,
  image_url text,                        -- Transformed from wix image format
  overview jsonb,                        -- Rich text content from Wix
  video_url text,                        -- Transformed from wix video format
  video_poster_url text,                 -- Video thumbnail/poster
  date date,                             -- Campaign/deal date
  slug text,                             -- URL slug for article page
  sport_tags text[] DEFAULT '{}',        -- e.g. {"Football","Basketball"}
  brand_tags text[] DEFAULT '{}',        -- e.g. {"Hollister","adidas"}
  industry_tags text[] DEFAULT '{}',     -- e.g. {"Clothing & Retail"}
  campaign_types text[] DEFAULT '{}',    -- e.g. {"Elevated","Team"}
  case_study_highlight boolean DEFAULT false,
  college_display text,                  -- College name for display (from HTML field)
  publish_date timestamptz,
  unpublish_date timestamptz,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_nil_tracker_status ON nil_tracker_items(status);
CREATE INDEX IF NOT EXISTS idx_nil_tracker_date ON nil_tracker_items(date DESC);
CREATE INDEX IF NOT EXISTS idx_nil_tracker_brand ON nil_tracker_items USING GIN(brand_tags);
CREATE INDEX IF NOT EXISTS idx_nil_tracker_sport ON nil_tracker_items USING GIN(sport_tags);
CREATE INDEX IF NOT EXISTS idx_nil_tracker_industry ON nil_tracker_items USING GIN(industry_tags);
CREATE INDEX IF NOT EXISTS idx_nil_tracker_slug ON nil_tracker_items(slug);

-- RLS policies
ALTER TABLE nil_tracker_items ENABLE ROW LEVEL SECURITY;

-- Public read access for published items
CREATE POLICY "Public can view published nil tracker items"
  ON nil_tracker_items FOR SELECT
  USING (status = 'PUBLISHED');

-- Authenticated users have full access
CREATE POLICY "Authenticated users have full access to nil tracker"
  ON nil_tracker_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
