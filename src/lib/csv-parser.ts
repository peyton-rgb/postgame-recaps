import type { AthleteMetrics } from "./types";

export interface ParsedAthlete {
  first: string;
  last: string;
  name: string;
  ig_handle: string;
  ig_followers: number;
  reach_level: string;
  school: string;
  sport: string;
  gender: string;
  metrics: AthleteMetrics;
}

function parseNum(val: string | undefined): number | undefined {
  if (!val || val.trim() === "") return undefined;
  const cleaned = val.replace(/,/g, "").replace(/%/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

function parseRate(val: string | undefined): number | undefined {
  if (!val || val.trim() === "") return undefined;
  const cleaned = val.replace(/,/g, "").replace(/%/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parsePerformanceCSV(csvText: string): ParsedAthlete[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Skip header row
  const dataRows = lines.slice(1);
  const athletes: ParsedAthlete[] = [];

  for (const line of dataRows) {
    const cols = parseCSVLine(line);

    const first = cols[0]?.trim() || "";
    const last = cols[1]?.trim() || "";

    // Skip junk rows
    if (!first || !last) continue;
    if (first.toUpperCase().includes("CALCULATIONS")) continue;
    if (first.toUpperCase().includes("DO NOT")) continue;

    const school = cols[27]?.trim() || "";
    const sport = cols[28]?.trim() || "";
    if (!school && !sport) continue;

    const igFeedUrl = cols[5]?.trim() || undefined;
    const igReelUrl = cols[15]?.trim() || undefined;
    const tiktokUrl = cols[21]?.trim() || undefined;

    const metrics: AthleteMetrics = {
      ig_feed: {
        post_url: igFeedUrl,
        reach: parseNum(cols[6]),
        impressions: parseNum(cols[7]),
        likes: parseNum(cols[8]),
        comments: parseNum(cols[9]),
        total_engagements: parseNum(cols[10]),
        engagement_rate: parseRate(cols[11]),
      },
      ig_story: {
        count: parseNum(cols[12]),
        impressions: parseNum(cols[13]),
      },
      ig_reel: {
        post_url: igReelUrl,
        views: parseNum(cols[16]),
        likes: parseNum(cols[17]),
        comments: parseNum(cols[18]),
        total_engagements: parseNum(cols[19]),
        engagement_rate: parseRate(cols[20]),
      },
      tiktok: {
        post_url: tiktokUrl,
        views: parseNum(cols[22]),
        likes_comments: parseNum(cols[23]),
        saves_shares: parseNum(cols[24]),
        total_engagements: parseNum(cols[25]),
        engagement_rate: parseRate(cols[26]),
      },
    };

    // Title-case the name
    const titleCase = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    athletes.push({
      first: titleCase(first),
      last: titleCase(last),
      name: `${titleCase(first)} ${titleCase(last)}`,
      ig_handle: cols[2]?.trim() || "",
      ig_followers: parseNum(cols[3]) || 0,
      reach_level: cols[4]?.trim() || "",
      school,
      sport,
      gender: cols[29]?.trim() || "",
      metrics,
    });
  }

  return athletes;
}
