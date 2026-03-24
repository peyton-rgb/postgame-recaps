import { createPlainSupabase } from "@/lib/supabase";
import type { NilTrackerItem } from "@/lib/types";
import { wixImageToUrl, wixVideoPosterToUrl } from "@/lib/wix-media";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "NIL Tracker | Postgame",
  description:
    "Tracking the latest NIL deals and brand partnerships powered by Postgame.",
};

function ItemCard({ item }: { item: NilTrackerItem }) {
  const imageUrl = item.image_url?.startsWith("wix:")
    ? wixImageToUrl(item.image_url)
    : item.image_url;

  const posterUrl = item.video_url?.startsWith("wix:")
    ? wixVideoPosterToUrl(item.video_url)
    : null;

  const displayImage = imageUrl || posterUrl;

  return (
    <a
      href={item.slug ? `/nil-tracker${item.slug.startsWith("/") ? item.slug : `/${item.slug}`}` : "#"}
      className="group block border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors bg-[#0a0a0a]"
    >
      {displayImage && (
        <div className="aspect-square overflow-hidden bg-gray-900">
          <img
            src={displayImage}
            alt={item.title || item.player_name || ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        {item.brand_tags.length > 0 && (
          <p className="text-[#D73F09] text-xs font-bold uppercase tracking-wider mb-1">
            {item.brand_tags.join(" / ")}
          </p>
        )}
        <h3
          className="text-sm font-bold leading-snug mb-2 line-clamp-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {item.title || `${item.player_name} x ${item.brand_tags[0] || "Brand"}`}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          {item.player_name && <span>{item.player_name}</span>}
          {item.college_name && (
            <>
              <span className="text-gray-700">|</span>
              <span>{item.college_name}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {item.sport_tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-white/5 border border-gray-800 rounded text-[10px] text-gray-400"
            >
              {tag}
            </span>
          ))}
          {item.industry_tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#D73F09]/10 border border-[#D73F09]/20 rounded text-[10px] text-[#D73F09]/80"
            >
              {tag}
            </span>
          ))}
        </div>
        {item.date && (
          <p className="text-[10px] text-gray-600 mt-3">
            {new Date(item.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </a>
  );
}

export default async function NilTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; brand?: string; industry?: string }>;
}) {
  const params = await searchParams;
  const supabase = createPlainSupabase();

  let query = supabase
    .from("nil_tracker_items")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("date", { ascending: false });

  if (params.sport) {
    query = query.contains("sport_tags", [params.sport]);
  }
  if (params.brand) {
    query = query.contains("brand_tags", [params.brand]);
  }
  if (params.industry) {
    query = query.contains("industry_tags", [params.industry]);
  }

  const { data } = await query;
  const items = (data || []) as NilTrackerItem[];

  // Collect unique filter values
  const allSports = [...new Set(items.flatMap((i) => i.sport_tags))].sort();
  const allBrands = [...new Set(items.flatMap((i) => i.brand_tags))].sort();
  const allIndustries = [...new Set(items.flatMap((i) => i.industry_tags))].sort();

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* Hero */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1
            className="text-6xl md:text-8xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#D73F09" }}
          >
            NIL TRACKER
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tracking the latest NIL deals and brand partnerships powered by
            Postgame.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            {items.length} campaigns tracked
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-800 sticky top-0 bg-black/95 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto">
          <FilterDropdown
            label="Sport"
            param="sport"
            options={allSports}
            current={params.sport}
          />
          <FilterDropdown
            label="Brand"
            param="brand"
            options={allBrands}
            current={params.brand}
          />
          <FilterDropdown
            label="Industry"
            param="industry"
            options={allIndustries}
            current={params.industry}
          />
          {(params.sport || params.brand || params.industry) && (
            <a
              href="/nil-tracker"
              className="px-3 py-1.5 text-xs text-gray-400 border border-gray-700 rounded-lg hover:text-white hover:border-gray-500 whitespace-nowrap"
            >
              Clear filters
            </a>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          <div className="text-center py-32 text-gray-600">
            <p className="text-lg">No NIL tracker items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({
  label,
  param,
  options,
  current,
}: {
  label: string;
  param: string;
  options: string[];
  current?: string;
}) {
  if (options.length === 0) return null;
  return (
    <div className="relative">
      <select
        defaultValue={current || ""}
        className="appearance-none bg-transparent border border-gray-700 text-xs text-gray-300 rounded-lg px-3 py-1.5 pr-7 focus:border-[#D73F09] outline-none cursor-pointer"
        onChange={(e) => {
          const url = new URL(window.location.href);
          if (e.target.value) {
            url.searchParams.set(param, e.target.value);
          } else {
            url.searchParams.delete(param);
          }
          window.location.href = url.toString();
        }}
      >
        <option value="">All {label}s</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
