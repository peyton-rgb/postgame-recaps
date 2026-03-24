import { createPlainSupabase } from "@/lib/supabase";
import type { Deal } from "@/lib/types";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Deal Tracker | Postgame",
};

export default async function DealsPage() {
  const supabase = createPlainSupabase();
  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const allDeals = (deals || []) as Deal[];
  const featuredDeals = allDeals.filter((d) => d.featured);
  const tier1 = allDeals.filter((d) => d.tier === "tier_1" && !d.featured);
  const tier2 = allDeals.filter((d) => d.tier === "tier_2" && !d.featured);
  const tier3 = allDeals.filter((d) => d.tier === "tier_3" && !d.featured);

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#D73F09" }}>
            DEAL TRACKER
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tracking the latest NIL deals and brand partnerships powered by Postgame.
          </p>
        </div>
      </div>

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold tracking-tight mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#D73F09" }}>
            FEATURED DEALS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredDeals.map((deal) => (
              <div key={deal.id} className="border border-[#D73F09]/30 bg-[#D73F09]/5 rounded-xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  {deal.brand_logo_url && (
                    <img src={deal.brand_logo_url} alt={deal.brand_name} className="w-12 h-12 rounded-lg object-contain bg-white p-1" />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {deal.brand_name}
                    </h3>
                    {deal.athlete_name && (
                      <p className="text-[#D73F09] text-sm font-medium">{deal.athlete_name}</p>
                    )}
                  </div>
                </div>
                {deal.description && <p className="text-gray-300 text-sm mb-4">{deal.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs">
                  {deal.deal_type && (
                    <span className="px-3 py-1 bg-white/10 rounded-full">{deal.deal_type}</span>
                  )}
                  {deal.value && (
                    <span className="px-3 py-1 bg-[#D73F09]/20 text-[#D73F09] rounded-full font-bold">{deal.value}</span>
                  )}
                  {deal.athlete_school && (
                    <span className="px-3 py-1 bg-white/10 rounded-full">{deal.athlete_school}</span>
                  )}
                  {deal.athlete_sport && (
                    <span className="px-3 py-1 bg-white/10 rounded-full">{deal.athlete_sport}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tier Sections */}
      {[
        { label: "TIER 1", deals: tier1 },
        { label: "TIER 2", deals: tier2 },
        { label: "TIER 3", deals: tier3 },
      ].map(
        ({ label, deals: tierDeals }) =>
          tierDeals.length > 0 && (
            <section key={label} className="max-w-6xl mx-auto px-6 pb-16">
              <h2 className="text-2xl font-bold tracking-tight mb-6 border-b border-gray-800 pb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierDeals.map((deal) => (
                  <div key={deal.id} className="border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      {deal.brand_logo_url && (
                        <img src={deal.brand_logo_url} alt={deal.brand_name} className="w-8 h-8 rounded object-contain bg-white p-0.5" />
                      )}
                      <h3 className="text-lg font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                        {deal.brand_name}
                      </h3>
                    </div>
                    {deal.athlete_name && (
                      <p className="text-sm text-gray-300 mb-1">{deal.athlete_name}</p>
                    )}
                    {deal.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{deal.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {deal.deal_type && (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full">{deal.deal_type}</span>
                      )}
                      {deal.value && (
                        <span className="px-2 py-0.5 bg-[#D73F09]/20 text-[#D73F09] rounded-full font-bold">{deal.value}</span>
                      )}
                    </div>
                    {deal.date_announced && (
                      <p className="text-xs text-gray-600 mt-3">
                        {new Date(deal.date_announced).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
      )}

      {allDeals.length === 0 && (
        <div className="text-center py-32 text-gray-600">
          <p className="text-lg">No deals published yet.</p>
        </div>
      )}
    </div>
  );
}
