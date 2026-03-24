"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import type { NilTrackerItem } from "@/lib/types";
import { wixImageToUrl } from "@/lib/wix-media";

export default function NilTrackerDashboard() {
  const [items, setItems] = useState<NilTrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState("");
  const [filter, setFilter] = useState("");
  const supabase = createBrowserSupabase();

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data } = await supabase
      .from("nil_tracker_items")
      .select("*")
      .order("date", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function seedData() {
    setSeeding(true);
    setSeedResult("");
    try {
      const res = await fetch("/api/seed-nil-tracker", { method: "POST" });
      const json = await res.json();
      setSeedResult(json.message || JSON.stringify(json));
      await loadItems();
    } catch (e) {
      setSeedResult("Error seeding data");
    }
    setSeeding(false);
  }

  const filtered = filter
    ? items.filter(
        (i) =>
          i.player_name?.toLowerCase().includes(filter.toLowerCase()) ||
          i.brand_tags.some((b) =>
            b.toLowerCase().includes(filter.toLowerCase())
          ) ||
          i.college_name?.toLowerCase().includes(filter.toLowerCase()) ||
          i.title?.toLowerCase().includes(filter.toLowerCase())
      )
    : items;

  const publishedCount = items.filter((i) => i.status === "PUBLISHED").length;
  const draftCount = items.filter((i) => i.status === "DRAFT").length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search athletes, brands, schools..."
            className="px-4 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm w-80 focus:border-[#D73F09] outline-none"
          />
          <span className="text-xs text-gray-500">
            {publishedCount} published / {draftCount} drafts
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/nil-tracker"
            target="_blank"
            className="px-4 py-2 border border-gray-700 text-gray-400 text-sm font-bold rounded-lg hover:border-[#D73F09] hover:text-[#D73F09] transition-colors"
          >
            View Public Page
          </a>
          <button
            onClick={seedData}
            disabled={seeding}
            className="px-5 py-2 bg-[#D73F09] text-white text-sm font-bold rounded-lg hover:bg-[#B33407] disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Seed from Wix Data"}
          </button>
        </div>
      </div>

      {seedResult && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm">
          {seedResult}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-20">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">
            No NIL tracker items yet. Seed from Wix data to populate.
          </p>
          <button
            onClick={seedData}
            disabled={seeding}
            className="text-[#D73F09] font-bold text-sm hover:underline"
          >
            {seeding ? "Seeding..." : "Seed NIL Tracker Data →"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const imgUrl = item.image_url?.startsWith("wix:")
              ? wixImageToUrl(item.image_url)
              : item.image_url;
            return (
              <div
                key={item.id}
                className="relative p-0 bg-[#111] border border-gray-800 rounded-xl hover:border-gray-600 transition-colors group overflow-hidden"
              >
                {imgUrl && (
                  <div className="aspect-square overflow-hidden bg-gray-900">
                    <img
                      src={imgUrl}
                      alt={item.player_name || ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {item.brand_tags.join(", ") || "No brand"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === "PUBLISHED"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold mb-1 line-clamp-2">
                    {item.player_name || "Unknown"}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {item.college_name || item.college_display || ""}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.sport_tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-gray-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {item.date && (
                    <p className="text-[10px] text-gray-600 mt-2">
                      {item.date}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
