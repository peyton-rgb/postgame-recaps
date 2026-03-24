#!/usr/bin/env node
/**
 * Generates nil-tracker-seed.ts from raw Wix CMS data pasted into stdin.
 *
 * Usage: node scripts/generate-seed.js < raw-data.txt > src/data/nil-tracker-seed.ts
 */

const fs = require('fs');
const rawData = fs.readFileSync('/dev/stdin', 'utf8');

const lines = rawData.split('\n');
const records = [];
let i = 0;

function extractPosterUri(videoUrl) {
  if (!videoUrl) return '';
  const m = videoUrl.match(/posterUri=([^&]+)/);
  return m ? m[1] : '';
}

while (i < lines.length) {
  const line = lines[i].trim();

  // Find record start
  if (line !== 'PUBLISHED' && line !== 'DRAFT') {
    i++;
    continue;
  }

  const status = line;
  i++;

  // Player Name
  let playerName = (lines[i] || '').trim();
  i++;

  // College Name (might be empty)
  let collegeName = (lines[i] || '').trim();
  // Check if this is actually the title (no college)
  if (collegeName && !collegeName.startsWith('wix:') && !collegeName.startsWith('{')) {
    i++;
  } else {
    collegeName = '';
  }

  // Title (can be multi-line)
  let title = (lines[i] || '').trim();
  i++;

  // Keep reading title lines until we hit image or overview
  while (i < lines.length) {
    const nextLine = lines[i].trim();
    if (nextLine.startsWith('wix:__image://') || nextLine.startsWith('{"nodes":') || nextLine === '') break;
    title += ' ' + nextLine;
    i++;
  }

  // Image URL
  let imageUrl = '';
  if (i < lines.length && lines[i].trim().startsWith('wix:__image://')) {
    imageUrl = lines[i].trim();
    i++;
  }

  // Overview JSON (skip it - can span many lines)
  if (i < lines.length && lines[i].trim().startsWith('{"nodes":')) {
    let depth = 0;
    while (i < lines.length) {
      const l = lines[i];
      for (const ch of l) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      i++;
      if (depth <= 0) break;
    }
  }

  // Video URL
  let videoUrl = '';
  if (i < lines.length && lines[i].trim().startsWith('wix:__video://')) {
    videoUrl = lines[i].trim();
    i++;
  }

  // Date
  let date = '';
  if (i < lines.length && /^\d{4}-\d{2}-\d{2}$/.test(lines[i].trim())) {
    date = lines[i].trim();
    i++;
  }

  // /niltracker/
  if (i < lines.length && lines[i].trim().startsWith('/niltracker')) {
    i++;
  }

  // Slug (/nil-tracker/...)
  let slug = '';
  if (i < lines.length && lines[i].trim().startsWith('/nil-tracker/')) {
    slug = lines[i].trim().replace('/nil-tracker/', '');
    i++;
  }

  // Sport Tags
  let sportTags = [];
  if (i < lines.length && lines[i].trim().startsWith('[')) {
    try { sportTags = JSON.parse(lines[i].trim()); } catch(e) {}
    i++;
  }

  // Brand Tags
  let brandTags = [];
  if (i < lines.length && lines[i].trim().startsWith('[')) {
    try { brandTags = JSON.parse(lines[i].trim()); } catch(e) {}
    i++;
  }

  // Industry Tags
  let industryTags = [];
  if (i < lines.length && lines[i].trim().startsWith('[')) {
    try { industryTags = JSON.parse(lines[i].trim()); } catch(e) {}
    i++;
  }

  // Campaign Types
  let campaignTypes = [];
  if (i < lines.length && lines[i].trim().startsWith('[')) {
    try { campaignTypes = JSON.parse(lines[i].trim()); } catch(e) {}
    i++;
  }

  // Case Study Highlight
  let caseStudy = false;
  if (i < lines.length) {
    const csLine = lines[i].trim();
    if (csLine === 'Yes' || csLine.startsWith('["Yes"]')) {
      caseStudy = true;
      i++;
    }
  }

  // Skip to /nil-tracker-1/ or UUID area
  // Look for /nil-tracker-1/ line
  while (i < lines.length) {
    const l = lines[i].trim();
    if (l.startsWith('/nil-tracker-1/')) { i++; break; }
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(l)) break; // hit UUID
    if (l.startsWith('/copy-of-niltracker')) break;
    i++;
  }

  // Publish Date
  let publishDate = '';
  if (i < lines.length && /^\d{4}-\d{2}-\d{2}T/.test(lines[i].trim())) {
    publishDate = lines[i].trim();
    i++;
  }

  // Skip empty lines and unpublish date
  while (i < lines.length && (lines[i].trim() === '' || /^\d{4}-\d{2}-\d{2}T/.test(lines[i].trim()))) {
    i++;
  }

  // /copy-of-niltracker/
  if (i < lines.length && lines[i].trim().startsWith('/copy-of-niltracker')) {
    i++;
  }

  // ID (UUID)
  let wixId = '';
  if (i < lines.length && /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(lines[i].trim())) {
    wixId = lines[i].trim();
    i++;
  }

  // Created Date
  let createdAt = '';
  if (i < lines.length && /^\d{4}-\d{2}-\d{2}T/.test(lines[i].trim())) {
    createdAt = lines[i].trim();
    i++;
  }

  // Updated Date
  let updatedAt = '';
  if (i < lines.length && /^\d{4}-\d{2}-\d{2}T/.test(lines[i].trim())) {
    updatedAt = lines[i].trim();
    i++;
  }

  // Owner UUID
  if (i < lines.length && /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(lines[i].trim())) {
    i++;
  }

  // College HTML
  let collegeDisplay = '';
  if (i < lines.length && lines[i].trim().startsWith('<p')) {
    const m = lines[i].trim().match(/>([^<]+)</);
    if (m) collegeDisplay = m[1].trim();
    i++;
  }

  if (wixId) {
    records.push({
      wix_id: wixId,
      status,
      player_name: playerName,
      college_name: collegeName,
      title: title.trim(),
      image_url: imageUrl,
      video_url: videoUrl,
      video_poster_url: extractPosterUri(videoUrl),
      date,
      slug,
      sport_tags: sportTags,
      brand_tags: brandTags,
      industry_tags: industryTags,
      campaign_types: campaignTypes,
      case_study_highlight: caseStudy,
      college_display: collegeDisplay,
      publish_date: publishDate,
      created_at: createdAt,
      updated_at: updatedAt,
    });
  }
}

// Generate TypeScript output
let output = `export interface NilTrackerSeedItem {
  wix_id: string;
  status: string;
  player_name: string;
  college_name: string;
  title: string;
  image_url: string;
  overview: string;
  video_url: string;
  video_poster_url: string;
  date: string;
  slug: string;
  sport_tags: string[];
  brand_tags: string[];
  industry_tags: string[];
  campaign_types: string[];
  case_study_highlight: boolean;
  college_display: string;
  publish_date: string;
  created_at: string;
  updated_at: string;
}

export const nilTrackerSeedData: NilTrackerSeedItem[] = [\n`;

for (const r of records) {
  output += `  {\n`;
  output += `    wix_id: ${JSON.stringify(r.wix_id)},\n`;
  output += `    status: ${JSON.stringify(r.status)},\n`;
  output += `    player_name: ${JSON.stringify(r.player_name)},\n`;
  output += `    college_name: ${JSON.stringify(r.college_name)},\n`;
  output += `    title: ${JSON.stringify(r.title)},\n`;
  output += `    image_url: ${JSON.stringify(r.image_url)},\n`;
  output += `    overview: "",\n`;
  output += `    video_url: ${JSON.stringify(r.video_url)},\n`;
  output += `    video_poster_url: ${JSON.stringify(r.video_poster_url)},\n`;
  output += `    date: ${JSON.stringify(r.date)},\n`;
  output += `    slug: ${JSON.stringify(r.slug)},\n`;
  output += `    sport_tags: ${JSON.stringify(r.sport_tags)},\n`;
  output += `    brand_tags: ${JSON.stringify(r.brand_tags)},\n`;
  output += `    industry_tags: ${JSON.stringify(r.industry_tags)},\n`;
  output += `    campaign_types: ${JSON.stringify(r.campaign_types)},\n`;
  output += `    case_study_highlight: ${r.case_study_highlight},\n`;
  output += `    college_display: ${JSON.stringify(r.college_display)},\n`;
  output += `    publish_date: ${JSON.stringify(r.publish_date)},\n`;
  output += `    created_at: ${JSON.stringify(r.created_at)},\n`;
  output += `    updated_at: ${JSON.stringify(r.updated_at)},\n`;
  output += `  },\n`;
}

output += `];\n`;

process.stdout.write(output);
process.stderr.write(`Parsed ${records.length} records\n`);
