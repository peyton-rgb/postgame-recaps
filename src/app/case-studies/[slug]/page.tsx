import { createPlainSupabase } from "@/lib/supabase";
import type { CaseStudy } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createPlainSupabase();
  const { data } = await supabase
    .from("case_studies")
    .select("title, brand_name")
    .eq("slug", params.slug)
    .single();

  return {
    title: data ? `${data.title} | ${data.brand_name} - Postgame` : "Case Study Not Found",
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const supabase = createPlainSupabase();
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!data) notFound();
  const study = data as CaseStudy;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF8", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Nav */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/case-studies" className="text-sm text-gray-500 hover:text-[#D73F09] transition-colors">
            ← All Case Studies
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D73F09]">
            {study.brand_name}
          </span>
          {study.category && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {study.category}
              </span>
            </>
          )}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          {study.title}
        </h1>

        {study.hero_stat && (
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-5xl md:text-6xl font-black text-[#D73F09]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {study.hero_stat}
            </span>
            {study.hero_stat_label && (
              <span className="text-lg text-gray-500">{study.hero_stat_label}</span>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      {study.image_url && (
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img src={study.image_url} alt={study.title} className="w-full object-cover" />
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-16">
        {study.overview && (
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Overview
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">{study.overview}</p>
          </section>
        )}

        {study.challenge && (
          <section className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Challenge
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{study.challenge}</p>
          </section>
        )}

        {study.solution && (
          <section className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Solution
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{study.solution}</p>
          </section>
        )}

        {study.results && (
          <section className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Results
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{study.results}</p>
          </section>
        )}

        {study.highlights && study.highlights.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {study.highlights.map((highlight, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D73F09]/10 text-[#D73F09] flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed">{highlight}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="pt-8 border-t border-gray-200">
          <Link href="/case-studies" className="text-[#D73F09] font-bold hover:underline">
            ← Back to All Case Studies
          </Link>
        </div>
      </div>
    </div>
  );
}
