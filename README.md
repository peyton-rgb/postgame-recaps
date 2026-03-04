# Postgame Recaps

Campaign recap builder for athlete content. Build masonry galleries with photos and videos, publish them as shareable URLs.

## Architecture

```
/dashboard          → Your internal tool (create campaigns, upload content)
/dashboard/[id]     → Campaign editor (select athletes, upload media, preview)
/recap/[slug]       → Public recap page (what clients see)
```

**Stack:** Next.js 14 + Supabase (Postgres + Storage + Auth) + Tailwind + Vercel

---

## Setup Guide

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon key** from Settings → API

### 2. Run Database Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Paste the contents of `supabase/migration.sql`
3. Click **Run** — this creates the tables, RLS policies, and storage bucket

### 3. Set Up Auth

1. Go to **Authentication → Settings**
2. Enable **Email** provider (magic link or password — your choice)
3. Create your account: **Authentication → Users → Add User**

### 4. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5. Install & Run Locally

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### 7. Custom Domain (Optional)

1. In Vercel, go to your project → **Settings → Domains**
2. Add `postgame.co` (or whatever your domain is)
3. Update DNS records as instructed

Now recaps are live at `postgame.co/recap/campaign-slug`

---

## How It Works

### Creating a Recap

1. Go to `/dashboard` → click **New Campaign**
2. Enter campaign name (e.g. "Adidas EVO SL") and client name
3. Open the campaign → **Step 1:** Select which athletes to feature
4. **Step 2:** Upload photos and videos for each athlete
   - When you upload a video, a popup asks you to upload a thumbnail image
   - Video always becomes slide 1 in the carousel
   - Photos become additional slides
5. Click **Preview Recap** to see the masonry gallery
6. Click **Publish** → the recap is live at `/recap/[slug]`

### Importing Athletes from CSV

To bulk-import athletes (like from your tracker spreadsheet), you can:
1. Use Supabase's CSV import in the Table Editor
2. Or build an import feature in the dashboard (future enhancement)

### Video Playback

- In the published recap (`/recap/[slug]`), videos play natively in the browser
- Click the play button → full video with controls
- Carousel arrows cycle through all media

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing / redirect
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind + global styles
│   ├── dashboard/
│   │   ├── page.tsx                # Campaign list
│   │   └── [id]/
│   │       └── page.tsx            # Campaign editor (curator)
│   └── recap/
│       └── [slug]/
│           └── page.tsx            # Public recap (server component)
├── components/
│   ├── SchoolBadge.tsx             # School color badge
│   ├── ThumbnailModal.tsx          # Video thumbnail upload popup
│   ├── RecapGallery.tsx            # Masonry gallery (used in both preview & public)
│   └── MasonryPreview.tsx          # Dashboard preview wrapper
└── lib/
    ├── supabase.ts                 # Supabase client helpers
    └── types.ts                    # TypeScript types
```

---

## Future Enhancements

- [ ] CSV athlete import
- [ ] Drag-and-drop card reordering
- [ ] Custom branding per campaign (colors, logos)
- [ ] Analytics (view counts per recap)
- [ ] Download all media as ZIP
- [ ] Embed code generator for client websites
