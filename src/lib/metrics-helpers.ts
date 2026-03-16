import type { AthleteMetrics } from "./types";

/**
 * Auto-fill total_engagements and engagement_rate for each platform
 * from the raw metric inputs. Returns a new metrics object.
 */
export function autoFillMetrics(metrics: AthleteMetrics): AthleteMetrics {
  const result: AthleteMetrics = JSON.parse(JSON.stringify(metrics));

  // IG Feed: total = likes + comments, rate = total / impressions * 100
  if (result.ig_feed) {
    const likes = result.ig_feed.likes ?? 0;
    const comments = result.ig_feed.comments ?? 0;
    const impressions = result.ig_feed.impressions ?? 0;
    const total = likes + comments;
    result.ig_feed.total_engagements = total;
    result.ig_feed.engagement_rate =
      impressions > 0 ? Math.round((total / impressions) * 10000) / 100 : 0;
  }

  // IG Reel: total = likes + comments, rate = total / views * 100
  if (result.ig_reel) {
    const likes = result.ig_reel.likes ?? 0;
    const comments = result.ig_reel.comments ?? 0;
    const views = result.ig_reel.views ?? 0;
    const total = likes + comments;
    result.ig_reel.total_engagements = total;
    result.ig_reel.engagement_rate =
      views > 0 ? Math.round((total / views) * 10000) / 100 : 0;
  }

  // TikTok: total = likes_comments + saves_shares, rate = total / views * 100
  if (result.tiktok) {
    const likesComments = result.tiktok.likes_comments ?? 0;
    const savesShares = result.tiktok.saves_shares ?? 0;
    const views = result.tiktok.views ?? 0;
    const total = likesComments + savesShares;
    result.tiktok.total_engagements = total;
    result.tiktok.engagement_rate =
      views > 0 ? Math.round((total / views) * 10000) / 100 : 0;
  }

  return result;
}
