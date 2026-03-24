/**
 * Parser for Wix NIL Tracker raw export data.
 *
 * Usage: npx tsx scripts/parse-nil-tracker.ts < raw-data.txt > src/data/nil-tracker-seed.json
 *
 * The raw data follows this field order per record:
 * 1. Status (PUBLISHED/DRAFT)
 * 2. Player Name (may be empty)
 * 3. College Name (may be empty)
 * 4. Title (may be empty)
 * 5. Image URL (wix:__image://... or empty)
 * 6. Overview JSON ({"nodes":[...]} or empty)
 * 7. Video URL (wix:__video://... or empty)
 * 8. Date (YYYY-MM-DD or empty)
 * 9. NIL Tracker All URL (/niltracker/)
 * 10. NIL Tracker Article URL (/nil-tracker/...)
 * 11. Sport Tags (JSON array)
 * 12. Brand Tags (JSON array)
 * 13. Industry Tags (JSON array)
 * 14. Campaign Types (JSON array)
 * 15. Case Study Highlight (optional "Yes" or empty/array)
 * 16. Athlete Content URL (optional)
 * 17. Publish Date (ISO or empty)
 * 18. Unpublish Date (optional)
 * 19. Duplicate URL (/copy-of-niltracker/)
 * 20. ID (UUID)
 * 21. Created Date (ISO)
 * 22. Updated Date (ISO)
 * 23. Owner (UUID)
 * 24. College HTML (optional, e.g. <p class="font_8">Alabama</p>)
 */

export interface RawNilTrackerItem {
  status: string;
  player_name: string;
  college_name: string;
  title: string;
  image_url: string;
  overview: string;
  video_url: string;
  date: string;
  slug: string;
  sport_tags: string[];
  brand_tags: string[];
  industry_tags: string[];
  campaign_types: string[];
  case_study_highlight: boolean;
  publish_date: string;
  wix_id: string;
  created_at: string;
  updated_at: string;
  college_display: string;
}

function parseCollegeFromHtml(html: string): string {
  const match = html.match(/>([^<]+)</);
  return match ? match[1].trim() : "";
}

function tryParseJsonArray(str: string): string[] {
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return [];
}

export function parseNilTrackerData(rawText: string): RawNilTrackerItem[] {
  const lines = rawText.split("\n");
  const items: RawNilTrackerItem[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Look for record start
    if (line !== "PUBLISHED" && line !== "DRAFT") {
      i++;
      continue;
    }

    const status = line;
    i++;

    // Player Name
    const playerName = (lines[i] || "").trim();
    i++;

    // College Name
    const collegeName = (lines[i] || "").trim();
    i++;

    // Title (can be multi-line if it wraps, but typically single)
    let title = (lines[i] || "").trim();
    i++;
    // If title continues (doesn't start with wix:__image), keep reading
    while (i < lines.length && !lines[i].trim().startsWith("wix:__image://") && lines[i].trim() !== "" && !lines[i].trim().startsWith('{"nodes":')) {
      title += " " + lines[i].trim();
      i++;
    }

    // Image URL
    let imageUrl = "";
    if (i < lines.length && lines[i].trim().startsWith("wix:__image://")) {
      imageUrl = lines[i].trim();
      i++;
    }

    // Overview JSON (can span multiple lines)
    let overview = "";
    if (i < lines.length && lines[i].trim().startsWith('{"nodes":')) {
      let depth = 0;
      let jsonStr = "";
      while (i < lines.length) {
        jsonStr += lines[i];
        for (const ch of lines[i]) {
          if (ch === "{") depth++;
          if (ch === "}") depth--;
        }
        i++;
        if (depth <= 0) break;
      }
      overview = jsonStr.trim();
    }

    // Video URL
    let videoUrl = "";
    if (i < lines.length && lines[i].trim().startsWith("wix:__video://")) {
      videoUrl = lines[i].trim();
      i++;
    }

    // Date
    let date = "";
    if (i < lines.length && /^\d{4}-\d{2}-\d{2}/.test(lines[i].trim())) {
      date = lines[i].trim();
      i++;
    }

    // NIL Tracker All URL
    if (i < lines.length && lines[i].trim().startsWith("/niltracker")) {
      i++;
    }

    // NIL Tracker Article URL (slug)
    let slug = "";
    if (i < lines.length && lines[i].trim().startsWith("/nil-tracker/")) {
      slug = lines[i].trim();
      i++;
    }

    // Sport Tags
    let sportTags: string[] = [];
    if (i < lines.length && lines[i].trim().startsWith("[")) {
      sportTags = tryParseJsonArray(lines[i].trim());
      i++;
    }

    // Brand Tags
    let brandTags: string[] = [];
    if (i < lines.length && lines[i].trim().startsWith("[")) {
      brandTags = tryParseJsonArray(lines[i].trim());
      i++;
    }

    // Industry Tags
    let industryTags: string[] = [];
    if (i < lines.length && lines[i].trim().startsWith("[")) {
      industryTags = tryParseJsonArray(lines[i].trim());
      i++;
    }

    // Campaign Types
    let campaignTypes: string[] = [];
    if (i < lines.length && lines[i].trim().startsWith("[")) {
      campaignTypes = tryParseJsonArray(lines[i].trim());
      i++;
    }

    // Case Study Highlight (optional)
    let caseStudy = false;
    if (i < lines.length) {
      const csLine = lines[i].trim();
      if (csLine === "Yes" || csLine.startsWith('["Yes"]')) {
        caseStudy = true;
        i++;
      }
    }

    // Athlete Content URL (optional)
    // Skip until we find the publish date or /nil-tracker-1/ or /copy-of-niltracker/
    while (i < lines.length) {
      const l = lines[i].trim();
      if (l.startsWith("/nil-tracker-1/") || /^\d{4}-\d{2}-\d{2}T/.test(l) || l === "") break;
      i++;
    }

    // /nil-tracker-1/ URL
    if (i < lines.length && lines[i].trim().startsWith("/nil-tracker-1/")) {
      i++;
    }

    // Publish Date
    let publishDate = "";
    if (i < lines.length && /^\d{4}-\d{2}-\d{2}T/.test(lines[i].trim())) {
      publishDate = lines[i].trim();
      i++;
    }

    // Unpublish Date (optional)
    // Skip empty lines
    while (i < lines.length && lines[i].trim() === "") i++;

    // /copy-of-niltracker/
    if (i < lines.length && lines[i].trim().startsWith("/copy-of-niltracker")) {
      i++;
    }

    // ID (UUID)
    let wixId = "";
    if (i < lines.length && /^[0-9a-f]{8}-/.test(lines[i].trim())) {
      wixId = lines[i].trim();
      i++;
    }

    // Created Date
    let createdAt = "";
    if (i < lines.length && /^\d{4}-\d{2}-\d{2}T/.test(lines[i].trim())) {
      createdAt = lines[i].trim();
      i++;
    }

    // Updated Date
    let updatedAt = "";
    if (i < lines.length && /^\d{4}-\d{2}-\d{2}T/.test(lines[i].trim())) {
      updatedAt = lines[i].trim();
      i++;
    }

    // Owner UUID
    if (i < lines.length && /^[0-9a-f]{8}-/.test(lines[i].trim())) {
      i++;
    }

    // College HTML (optional)
    let collegeDisplay = "";
    if (i < lines.length && lines[i].trim().startsWith("<p")) {
      collegeDisplay = parseCollegeFromHtml(lines[i].trim());
      i++;
    }

    items.push({
      status,
      player_name: playerName,
      college_name: collegeName,
      title,
      image_url: imageUrl,
      overview,
      video_url: videoUrl,
      date,
      slug,
      sport_tags: sportTags,
      brand_tags: brandTags,
      industry_tags: industryTags,
      campaign_types: campaignTypes,
      case_study_highlight: caseStudy,
      publish_date: publishDate,
      wix_id: wixId,
      created_at: createdAt,
      updated_at: updatedAt,
      college_display: collegeDisplay,
    });
  }

  return items;
}
