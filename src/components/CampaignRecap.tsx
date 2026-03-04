"use client";

import { useState } from "react";
import { SchoolBadge } from "./SchoolBadge";
import type { Campaign, Athlete, Media, VisibleSections } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────

function fmt(n: number | undefined): string {
  if (n == null) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function pct(n: number | undefined): string {
  if (n == null) return "0%";
  return n.toFixed(2) + "%";
}

function computeStats(athletes: Athlete[]) {
  const schools = new Set(athletes.map((a) => a.school));
  const sports = new Set(athletes.map((a) => a.sport));

  let totalPosts = 0;
  let totalImpressions = 0;
  let totalEngagements = 0;
  let totalEngRateSum = 0;
  let engRateCount = 0;
  let igFeedPosts = 0;
  let igReelPosts = 0;
  let tiktokPosts = 0;
  let totalReach = 0;

  for (const a of athletes) {
    const m = a.metrics || {};
    if (m.ig_feed?.post_url) {
      igFeedPosts++;
      totalPosts++;
    }
    if (m.ig_reel?.post_url) {
      igReelPosts++;
      totalPosts++;
    }
    if (m.tiktok?.post_url) {
      tiktokPosts++;
      totalPosts++;
    }

    totalImpressions += (m.ig_feed?.impressions || 0) + (m.ig_story?.impressions || 0) + (m.ig_reel?.views || 0) + (m.tiktok?.views || 0);
    totalEngagements += (m.ig_feed?.total_engagements || 0) + (m.ig_reel?.total_engagements || 0) + (m.tiktok?.total_engagements || 0);
    totalReach += (m.ig_feed?.reach || 0) + (a.ig_followers || 0);

    const rates = [m.ig_feed?.engagement_rate, m.ig_reel?.engagement_rate, m.tiktok?.engagement_rate].filter((r): r is number => r != null && r > 0);
    if (rates.length > 0) {
      totalEngRateSum += rates.reduce((s, r) => s + r, 0) / rates.length;
      engRateCount++;
    }
  }

  const avgEngRate = engRateCount > 0 ? totalEngRateSum / engRateCount : 0;

  return {
    athleteCount: athletes.length,
    schoolCount: schools.size,
    sportCount: sports.size,
    totalPosts,
    totalImpressions,
    totalEngagements,
    avgEngRate,
    igFeedPosts,
    igReelPosts,
    tiktokPosts,
    totalReach,
  };
}

function getTopPerformers(athletes: Athlete[], count = 5) {
  return [...athletes]
    .map((a) => {
      const m = a.metrics || {};
      const rates = [m.ig_feed?.engagement_rate, m.ig_reel?.engagement_rate, m.tiktok?.engagement_rate].filter((r): r is number => r != null && r > 0);
      const best = rates.length > 0 ? Math.max(...rates) : 0;
      return { ...a, bestEngRate: best };
    })
    .filter((a) => a.bestEngRate > 0)
    .sort((a, b) => b.bestEngRate - a.bestEngRate)
    .slice(0, count);
}

// ── Masonry Card (reused from RecapGallery) ───────────────────

function MasonryCard({ athlete, items }: { athlete: Athlete; items: Media[] }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);

  const current = items[slideIdx];
  const isVideo = current?.type === "video";
  const displaySrc = current?.thumbnail_url || (current?.type !== "video" ? current?.file_url : null);

  return (
    <div
      className="break-inside-avoid mb-2 rounded-lg overflow-hidden bg-[#111]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden">
        {isVideo && playing ? (
          <video src={current.file_url} autoPlay controls playsInline className="w-full block" onEnded={() => setPlaying(false)} />
        ) : displaySrc ? (
          <img src={displaySrc} className="w-full block" draggable={false} alt={athlete.name} />
        ) : isVideo ? (
          <div className="w-full aspect-[4/5] bg-[#0a0a0a] flex items-center justify-center" onClick={() => setPlaying(true)}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        ) : (
          <div className="w-full aspect-[4/5] bg-[#0a0a0a] flex items-center justify-center">
            <span className="text-[10px] text-gray-700 font-black uppercase">No media</span>
          </div>
        )}

        {isVideo && !playing && (
          <div onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center cursor-pointer z-[2]">
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21" /></svg>
            </div>
          </div>
        )}

        <span className="absolute top-2 right-2 z-[3] px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-black/65 text-white backdrop-blur">
          {athlete.post_type}
        </span>

        {items.length > 1 && hovered && !playing && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-[4] flex justify-between px-1.5">
            <button onClick={(e) => { e.stopPropagation(); setPlaying(false); setSlideIdx((i) => (i <= 0 ? items.length - 1 : i - 1)); }} className="w-7 h-7 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setPlaying(false); setSlideIdx((i) => (i >= items.length - 1 ? 0 : i + 1)); }} className="w-7 h-7 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}

        {items.length > 1 && (
          <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 flex gap-1 z-[3] transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}>
            {items.map((_, i) => (
              <div key={i} onClick={(e) => { e.stopPropagation(); setPlaying(false); setSlideIdx(i); }} className={`w-1.5 h-1.5 rounded-full cursor-pointer ${slideIdx === i ? "bg-white" : "bg-white/35"}`} />
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-[2] px-3 pt-5 pb-2.5 bg-gradient-to-t from-black/85 to-transparent flex items-end gap-2">
          <SchoolBadge school={athlete.school} size={26} />
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase text-white truncate">{athlete.name}</div>
            <div className="text-[9px] text-white/55 font-semibold flex items-center gap-1.5">
              {athlete.school}
              {athlete.ig_followers ? <span className="text-white/40">· {fmt(athlete.ig_followers)}</span> : null}
              <span className="px-1 py-px rounded text-[7px] font-bold uppercase bg-[#D73F09] text-white">{athlete.sport}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Recap Component ──────────────────────────────────────

export function CampaignRecap({
  campaign,
  athletes,
  media,
}: {
  campaign: Campaign;
  athletes: Athlete[];
  media: Record<string, Media[]>;
}) {
  const [filter, setFilter] = useState("all");
  const settings = campaign.settings || {};
  const vis: VisibleSections = settings.visible_sections || {};
  const show = (key: keyof VisibleSections) => vis[key] !== false;

  const stats = computeStats(athletes);
  const topPerformers = getTopPerformers(athletes);
  const cols = settings.columns || 4;

  const filtered = athletes.filter((a) => {
    if (filter === "all") return true;
    if (filter === "photo") return a.post_type !== "IG Reel";
    return a.post_type === "IG Reel";
  });

  const contentTypes = [
    stats.igFeedPosts > 0 && "IG Feed",
    stats.igReelPosts > 0 && "Reels",
    stats.tiktokPosts > 0 && "TikTok BTS",
  ].filter(Boolean).join(", ");

  const rosterAthletes = [...athletes].sort((a, b) => (b.ig_followers || 0) - (a.ig_followers || 0));

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">

      {/* ── SECTION 1: HERO HEADER ─────────────────────────── */}
      <div className="relative px-8 md:px-12 pt-10 pb-10 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            {/* Top badges */}
            <div className="flex items-center gap-2 mb-3">
              {campaign.client_logo_url && (
                <img src={campaign.client_logo_url} className="h-6 object-contain" alt={campaign.client_name} />
              )}
              {settings.quarter && (
                <span className="px-2.5 py-1 bg-[#1e1e1e] border border-gray-700 rounded text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  {settings.quarter}
                </span>
              )}
              {settings.campaign_type && (
                <span className="px-2.5 py-1 bg-[#1e1e1e] border border-gray-700 rounded text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  {settings.campaign_type}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-3">
              {campaign.name}
            </h1>

            {settings.description && (
              <p className="text-sm text-gray-400 max-w-lg leading-relaxed mb-4">
                {settings.description.slice(0, 200)}
                {(settings.description?.length || 0) > 200 ? "..." : ""}
              </p>
            )}

            {/* Tag pills */}
            {settings.tags && settings.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {settings.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D73F09] text-white">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-px bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
            {[
              { value: stats.athleteCount, label: "ATHLETES" },
              { value: stats.schoolCount, label: "SCHOOLS" },
              { value: stats.sportCount, label: "SPORTS" },
              { value: settings.quarter || "—", label: "YEAR" },
            ].map((s) => (
              <div key={s.label} className="bg-[#1a1a1a] px-6 py-4 text-center min-w-[90px]">
                <div className="text-xl font-black text-[#D73F09]">{s.value}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: CAMPAIGN BRIEF ──────────────────────── */}
      {show("brief") && settings.description && (
        <div className="px-8 md:px-12 py-12 border-t border-gray-800">
          <h2 className="text-xl font-black uppercase tracking-wide mb-8">Campaign Brief</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
              {settings.description}
            </div>
            <div className="space-y-0">
              {[
                { label: "BRAND", value: campaign.client_name },
                { label: "CAMPAIGN", value: `${campaign.name}` },
                { label: "QUARTER", value: settings.quarter },
                { label: "TYPE", value: settings.campaign_type },
                { label: "PLATFORM", value: settings.platform },
                { label: "ATHLETES", value: String(stats.athleteCount) },
                { label: "SCHOOLS", value: String(stats.schoolCount) },
                { label: "SPORTS", value: String(stats.sportCount) },
                { label: "TOTAL REACH", value: fmt(stats.totalReach) + "+ Followers" },
                { label: "TOTAL POSTS", value: String(stats.totalPosts) },
                { label: "CONTENT TYPE", value: contentTypes },
              ].filter((r) => r.value).map((row) => (
                <div key={row.label} className="flex items-baseline py-2.5 border-b border-gray-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 w-32 flex-shrink-0">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-300">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3: CAMPAIGN METRICS ────────────────────── */}
      {show("metrics") && (
        <div className="px-8 md:px-12 py-12 border-t border-gray-800">
          <h2 className="text-xl font-black uppercase tracking-wide mb-8">Campaign Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: stats.totalPosts, label: "TOTAL POSTS", format: false },
              { value: stats.totalImpressions, label: "TOTAL IMPRESSIONS", format: true },
              { value: stats.totalEngagements, label: "TOTAL ENGAGEMENTS", format: true },
              { value: stats.avgEngRate, label: "AVG ENGAGEMENT RATE", format: false, isPct: true },
            ].map((m) => (
              <div key={m.label} className="bg-[#141414] border border-gray-800 rounded-xl p-6 text-center">
                <div className="text-2xl md:text-3xl font-black text-white mb-2">
                  {m.isPct ? pct(m.value) : m.format ? fmt(m.value) : m.value}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 4: PLATFORM BREAKDOWN ──────────────────── */}
      {show("platform_breakdown") && (
        <div className="px-8 md:px-12 py-8 border-t border-gray-800">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Platform Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "IG FEED", value: stats.igFeedPosts, suffix: "POSTS" },
              { label: "IG REELS/BTS", value: stats.igReelPosts, suffix: "POSTS" },
              { label: "TIKTOK", value: stats.tiktokPosts > 0 ? stats.tiktokPosts : null, suffix: stats.tiktokPosts > 0 ? "POSTS" : "DATA TRACKED" },
            ].map((p) => (
              <div key={p.label} className="bg-[#141414] border border-gray-800 rounded-xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{p.label}</div>
                <div className="text-2xl font-black">{p.value ?? "Data"}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mt-1">{p.suffix}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 5: TOP PERFORMERS ──────────────────────── */}
      {show("top_performers") && topPerformers.length > 0 && (
        <div className="px-8 md:px-12 py-12 border-t border-gray-800">
          <h2 className="text-xl font-black uppercase tracking-wide mb-8">Top Performers by Engagement Rate</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {topPerformers.map((a, i) => (
              <div key={a.id} className="flex-shrink-0 w-[180px] bg-[#141414] border border-gray-800 rounded-xl p-4 relative">
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#D73F09] text-white text-xs font-black flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <SchoolBadge school={a.school} size={28} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase truncate">{a.name}</div>
                    <div className="text-[9px] text-gray-500">{a.school}</div>
                  </div>
                </div>
                <div className="text-[9px] text-gray-600 font-bold uppercase mb-1">{a.sport}</div>
                <div className="text-lg font-black text-[#D73F09]">{pct(a.bestEngRate)}</div>
                <div className="text-[8px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">ENG</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 6: CONTENT GALLERY ─────────────────────── */}
      {show("content_gallery") && (
        <div className="px-8 md:px-12 py-12 border-t border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-5">
              <h2 className="text-xl font-black uppercase">Content Gallery</h2>
              <div className="flex gap-1">
                {["all", "photo", "video"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase ${
                      filter === f ? "bg-[#D73F09] text-white" : "border border-gray-700 text-gray-500"
                    }`}
                  >
                    {f === "all" ? "All" : f === "photo" ? "Photos" : "Videos"}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-600 font-semibold">
              {filtered.length} athletes · Feed, Reels & BTS
            </span>
          </div>
          <div style={{ columnCount: cols, columnGap: 8 }} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-2">
            {filtered.map((a) => (
              <MasonryCard key={a.id} athlete={a} items={media[a.id] || []} />
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 7: CAMPAIGN ROSTER ─────────────────────── */}
      {show("roster") && (
        <div className="px-8 md:px-12 py-12 border-t border-gray-800">
          <h2 className="text-xl font-black uppercase tracking-wide mb-8">Campaign Roster</h2>
          <div className="space-y-1">
            {rosterAthletes.map((a, i) => (
              <div key={a.id} className="flex items-center gap-4 py-3 px-4 rounded-lg bg-[#111] border border-gray-800/50">
                <span className="text-sm font-black text-gray-600 w-6 text-right">{i + 1}</span>
                <SchoolBadge school={a.school} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black uppercase">{a.name}</div>
                  <div className="text-[10px] text-gray-600">{a.school}</div>
                </div>
                <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-[#D73F09]/15 text-[#D73F09]">
                  {a.sport}
                </span>
                <span className="text-sm font-bold text-gray-400 w-16 text-right">
                  {a.ig_followers ? fmt(a.ig_followers) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <div className="px-8 md:px-12 py-8 border-t border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-700">Powered by Postgame</span>
        <span className="text-xs text-gray-700">
          &copy; {new Date().getFullYear()} {campaign.client_name}
        </span>
      </div>
    </div>
  );
}
