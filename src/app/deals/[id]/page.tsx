"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import type { Deal } from "@/lib/types";
import Link from "next/link";

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from("deals")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .single();
      setDeal(data as Deal | null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-500" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gray-500" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <p style={{ fontSize: "clamp(14px, 2vw, 24px)", lineHeight: 1.4 }}>Deal not found.</p>
        <Link href="/deals" className="text-[#D73F09] font-bold mt-4 hover:underline" style={{ fontSize: "clamp(14px, 2vw, 18px)" }}>
          Back to Deal Tracker
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* Nav */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <Link href="/deals" className="text-gray-500 hover:text-white transition-colors" style={{ fontSize: "clamp(12px, 1.3vw, 16px)" }}>
            &larr; Back to Deal Tracker
          </Link>
          <img src="/postgame-logo-white.png" alt="Postgame" className="h-5 md:h-6 object-contain" />
        </div>
      </div>

      {/* Hero Image */}
      {deal.image_url && (
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
          <div className="aspect-[4/5] max-h-[600px] overflow-hidden rounded-xl">
            <img
              src={deal.image_url}
              alt={deal.athlete_name || deal.brand_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Athlete Name */}
        <h1
          className="font-bold tracking-tight"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            marginBottom: "8px",
          }}
        >
          {deal.athlete_name || "Team Campaign"}
        </h1>

        {/* Brand */}
        <p
          className="text-[#D73F09] font-bold"
          style={{ fontSize: "clamp(18px, 2.5vw, 28px)", marginBottom: "16px" }}
        >
          {deal.brand_name}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center" style={{ gap: "12px", marginBottom: "32px" }}>
          {(deal.athlete_school || deal.athlete_sport) && (
            <span className="text-gray-400" style={{ fontSize: "clamp(14px, 1.5vw, 18px)", lineHeight: 1.4 }}>
              {[deal.athlete_school, deal.athlete_sport].filter(Boolean).join(" \u00B7 ")}
            </span>
          )}
          {deal.date_announced && (
            <span className="text-gray-600" style={{ fontSize: "clamp(12px, 1.3vw, 16px)" }}>
              {new Date(deal.date_announced + "T00:00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Tags */}
        {deal.deal_type && (
          <div className="flex flex-wrap" style={{ gap: "8px", marginBottom: "32px" }}>
            {deal.deal_type.split(",").map((t) => (
              <span
                key={t.trim()}
                className="bg-white/5 border border-gray-800 rounded-full text-gray-400"
                style={{ fontSize: "clamp(11px, 1.2vw, 14px)", padding: "6px 16px" }}
              >
                {t.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {deal.description ? (
          <div
            className="text-gray-300"
            style={{ fontSize: "clamp(14px, 2vw, 20px)", lineHeight: 1.6 }}
          >
            {deal.description.split("\n").map((para, i) => (
              <p key={i} style={{ marginBottom: "16px" }}>
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-600" style={{ fontSize: "clamp(14px, 2vw, 20px)", lineHeight: 1.4 }}>
            More details coming soon.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800">
        <div
          className="max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-10 text-center text-gray-600"
          style={{ fontSize: "clamp(11px, 1.5vw, 18px)", lineHeight: 1.2 }}
        >
          <p>&copy; {new Date().getFullYear()} Postgame. All rights reserved.</p>
          <p className="mt-2">
            To learn more about promoting your brand through college athletes, contact us at{" "}
            <a href="mailto:info@pstgm.com" className="text-[#D73F09] hover:underline">
              info@pstgm.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
