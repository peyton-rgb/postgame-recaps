import { createPlainSupabase } from "@/lib/supabase";
import type { CaseStudy } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Case Studies | Postgame",
};

export default async function CaseStudiesPage() {
  const supabase = createPlainSupabase();
  const { data: studies } = await supabase
    .from("case_studies")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("published_date", { ascending: false });

  const allStudies = (studies || []) as CaseStudy[];
  const featuredStudy = allStudies.find((s) => s.featured);
  const rest = allStudies.filter((s) => s.id !== featuredStudy?.id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF8", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#D73F09] mb-4">Postgame</p>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Case Studies
          </h1>
          <div className="w-16 h-0.5 bg-[#D73F09] mx-auto mt-6" />
        </div>
      </div>

      {/* Featured */}
      {featuredStudy && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <Link href={`/case-studies/${featuredStudy.slug}`} className="block group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {featuredStudy.image_url && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={featuredStudy.image_url}
                    alt={featuredStudy.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className={`p-8 ${featuredStudy.image_url ? "" : "md:col-span-2"}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D73F09]">Featured</span>
                  {featuredStudy.category && (
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {featuredStudy.category}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 group-hover:text-[#D73F09] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {featuredStudy.title}
                </h2>
                <p className="text-sm font-bold text-gray-500 mb-4">{featuredStudy.brand_name}</p>
                {featuredStudy.hero_stat && (
                  <div className="mb-4">
                    <span className="text-4xl font-black text-[#D73F09]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {featuredStudy.hero_stat}
                    </span>
                    {featuredStudy.hero_stat_label && (
                      <span className="text-sm text-gray-500 ml-2">{featuredStudy.hero_stat_label}</span>
                    )}
                  </div>
                )}
                {featuredStudy.overview && (
                  <p className="text-gray-600 leading-relaxed line-clamp-3">{featuredStudy.overview}</p>
                )}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((study) => (
              <Link
                key={study.id}
                href={`/case-studies/${study.slug}`}
                className="block group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {study.image_url && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={study.image_url}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {study.category && (
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D73F09]">
                        {study.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-[#D73F09] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {study.title}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 mb-3">{study.brand_name}</p>
                  {study.hero_stat && (
                    <div className="mb-3">
                      <span className="text-2xl font-black text-[#D73F09]">{study.hero_stat}</span>
                      {study.hero_stat_label && (
                        <span className="text-xs text-gray-500 ml-2">{study.hero_stat_label}</span>
                      )}
                    </div>
                  )}
                  {study.overview && (
                    <p className="text-gray-600 text-sm line-clamp-2">{study.overview}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {allStudies.length === 0 && (
        <div className="text-center py-32 text-gray-400">
          <p className="text-lg">No case studies published yet.</p>
        </div>
      )}
    </div>
  );
}
