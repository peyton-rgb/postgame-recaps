"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import type { Deal } from "@/lib/types";

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from("deals")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      setDeals((data || []) as Deal[]);
      setLoading(false);
    }
    load();
  }, []);

  // Extract unique filter values
  const sports = useMemo(() => [...new Set(deals.map((d) => d.athlete_sport).filter(Boolean))].sort(), [deals]);
  const colleges = useMemo(() => [...new Set(deals.map((d) => d.athlete_school).filter(Boolean))].sort(), [deals]);
  const brands = useMemo(() => [...new Set(deals.map((d) => d.brand_name).filter(Boolean))].sort(), [deals]);
  const types = useMemo(() => {
    const all = new Set<string>();
    deals.forEach((d) => {
      if (d.deal_type) d.deal_type.split(",").map((t) => t.trim()).forEach((t) => all.add(t));
    });
    return [...all].sort();
  }, [deals]);

  // Apply filters
  const filtered = useMemo(() => {
    return deals.filter((d) => {
      if (sportFilter && d.athlete_sport !== sportFilter) return false;
      if (collegeFilter && d.athlete_school !== collegeFilter) return false;
      if (brandFilter && d.brand_name !== brandFilter) return false;
      if (typeFilter && (!d.deal_type || !d.deal_type.includes(typeFilter))) return false;
      return true;
    });
  }, [deals, sportFilter, collegeFilter, brandFilter, typeFilter]);

  const hasFilters = sportFilter || collegeFilter || brandFilter || typeFilter;

  function resetFilters() {
    setSportFilter("");
    setCollegeFilter("");
    setBrandFilter("");
    setTypeFilter("");
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#D73F09" }}
          >
            POSTGAME NIL DEAL TRACKER
          </h1>
          <p className="text-gray-400 text-base max-w-3xl mx-auto leading-relaxed">
            Postgame is known for our large scale NIL campaigns featuring thousands of college athletes
            with a wide range of social following across all schools and sports. Below is a sample list
            of Headliner Athletes that we&apos;ve worked with over the years. Use the filters below to
            search by sport, school, brand, or campaign type.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-2">Filter by</span>
            <FilterSelect label="Sport" value={sportFilter} onChange={setSportFilter} options={sports} />
            <FilterSelect label="College" value={collegeFilter} onChange={setCollegeFilter} options={colleges} />
            <FilterSelect label="Brand" value={brandFilter} onChange={setBrandFilter} options={brands} />
            <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={types} />
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#D73F09] text-[#D73F09] rounded hover:bg-[#D73F09] hover:text-white transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          {hasFilters && (
            <p className="text-xs text-gray-500 mt-3">
              Showing {filtered.length} of {deals.length} deals
            </p>
          )}
        </div>
      </div>

      {/* Deal Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading deals...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No deals match your filters.</p>
            {hasFilters && (
              <button onClick={resetFilters} className="text-[#D73F09] font-bold text-sm hover:underline">
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-4 py-2 text-sm border rounded bg-black appearance-none cursor-pointer pr-8 ${
        value
          ? "border-[#D73F09] text-[#D73F09]"
          : "border-gray-700 text-gray-400 hover:border-gray-500"
      }`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
      }}
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all group">
      {/* Athlete Name = Header */}
      <h3
        className="text-xl font-bold tracking-tight mb-1"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        {deal.athlete_name || "Team Campaign"}
      </h3>

      {/* Brand = Sub-header */}
      <p className="text-[#D73F09] text-sm font-bold mb-3">{deal.brand_name}</p>

      {/* School + Sport line */}
      {(deal.athlete_school || deal.athlete_sport) && (
        <p className="text-xs text-gray-400 mb-3">
          {[deal.athlete_school, deal.athlete_sport].filter(Boolean).join(" · ")}
        </p>
      )}

      {/* Description */}
      {deal.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{deal.description}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        {deal.deal_type &&
          deal.deal_type.split(",").map((t) => (
            <span key={t.trim()} className="px-2 py-0.5 bg-white/5 border border-gray-800 rounded-full text-gray-400">
              {t.trim()}
            </span>
          ))}
      </div>

      {/* Date */}
      {deal.date_announced && (
        <p className="text-[10px] text-gray-600 mt-3">
          {new Date(deal.date_announced + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
