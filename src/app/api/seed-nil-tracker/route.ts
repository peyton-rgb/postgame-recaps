import { createServerSupabase } from "@/lib/supabase-server";
import { nilTrackerSeedData } from "@/data/nil-tracker-seed";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createServerSupabase();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batchSize = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < nilTrackerSeedData.length; i += batchSize) {
    const batch = nilTrackerSeedData.slice(i, i + batchSize);
    const { error } = await supabase.from("nil_tracker_items").upsert(
      batch.map((item) => ({
        wix_id: item.wix_id || null,
        status: item.status,
        player_name: item.player_name || null,
        college_name: item.college_name || null,
        title: item.title || null,
        image_url: item.image_url || null,
        overview: item.overview ? JSON.parse(item.overview) : null,
        video_url: item.video_url || null,
        video_poster_url: item.video_poster_url || null,
        date: item.date || null,
        slug: item.slug || null,
        sport_tags: item.sport_tags,
        brand_tags: item.brand_tags,
        industry_tags: item.industry_tags,
        campaign_types: item.campaign_types,
        case_study_highlight: item.case_study_highlight,
        college_display: item.college_display || null,
        publish_date: item.publish_date || null,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      })),
      { onConflict: "wix_id" }
    );

    if (error) {
      console.error(`Batch ${i / batchSize + 1} error:`, error);
      errors += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  return NextResponse.json({
    message: `Seeded ${inserted} items. ${errors} errors.`,
    total: nilTrackerSeedData.length,
    inserted,
    errors,
  });
}
