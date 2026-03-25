"use client";

import { useState } from "react";
import Link from "next/link";
import type { PressArticle } from "@/lib/types";

const DATE_FILTERS = [
  { label: "All", value: "all" },
  { label: "This Month", value: "month" },
  { label: "Last 3 Months", value: "3months" },
  { label: "Last 6 Months", value: "6months" },
  { label: "This Year", value: "year" },
];

function isWithinRange(dateStr: string, filter: string): boolean {
  if (filter === "all") return true;
  const d = new Date(dateStr);
  const now = new Date();
  switch (filter) {
    case "month": {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    case "3months": {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 3);
      return d >= cutoff;
    }
    case "6months": {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 6);
      return d >= cutoff;
    }
    case "year": {
      return d.getFullYear() === now.getFullYear();
    }
    default:
      return true;
  }
}

export default function PressContent({ articles }: { articles: PressArticle[] }) {
  const [filter, setFilter] = useState("all");

  // Split into dated and undated
  const datedArticles = articles
    .filter((a) => a.published_date)
    .sort((a, b) => new Date(b.published_date!).getTime() - new Date(a.published_date!).getTime());
  const undatedArticles = articles.filter((a) => !a.published_date);

  // Apply date filter to dated articles
  const filteredDated = filter === "all"
    ? datedArticles
    : datedArticles.filter((a) => isWithinRange(a.published_date!, filter));

  // Only show undated articles when "All" is selected
  const filteredUndated = filter === "all" ? undatedArticles : [];

  // Highlighted = most recent dated article (only in "All" view or if it passes filter)
  const highlightedArticle = filteredDated.length > 0 ? filteredDated[0] : null;
  const rest = [...filteredDated.slice(1), ...filteredUndated];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderLogoLockup = (article: PressArticle, size: "sm" | "lg") => {
    if (!article.show_logo) return null;
    const sizeClasses = size === "lg" ? "h-6 md:h-8" : "h-5 md:h-6";
    const gapClass = size === "lg" ? "gap-2" : "gap-1.5";
    const xSize = size === "lg" ? "text-xs" : "text-[10px]";
    return (
      <div className={`absolute bottom-${size === "lg" ? "3" : "2"} ${article.logo_position === "bottom-right" ? "right-3" : "left-3"} flex items-center ${gapClass} drop-shadow-lg`}>
        <img src="/postgame-logo-white.png" alt="Postgame" className={`${sizeClasses} object-contain`} />
        {article.brand_logo_url && (
          <>
            <span className={`text-white/60 ${xSize} font-bold`}>&times;</span>
            <img src={article.brand_logo_url} alt="" className={`${sizeClasses} object-contain`} />
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="flex justify-center gap-2 flex-wrap mb-12">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* No results */}
      {!highlightedArticle && rest.length === 0 && (
        <p className="text-center text-gray-400 py-16">No articles found for this time period.</p>
      )}

      {/* Highlighted Latest Article */}
      {highlightedArticle && (
        <section className="mb-16">
          <span className="inline-block bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Latest
          </span>
          <Link href={highlightedArticle.url || "#"} target="_blank" className="group grid md:grid-cols-2 gap-8">
            <div className="relative rounded-xl overflow-hidden">
              {highlightedArticle.image_url ? (
                <img
                  src={highlightedArticle.image_url}
                  alt={highlightedArticle.title}
                  className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-72 md:h-96 bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No image</span>
                </div>
              )}
              {renderLogoLockup(highlightedArticle, "lg")}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                {highlightedArticle.category && (
                  <span className="text-orange-600 text-sm font-bold uppercase tracking-wider">
                    {highlightedArticle.category}
                  </span>
                )}
                {highlightedArticle.published_date && (
                  <span className="text-gray-400 text-sm">
                    {formatDate(highlightedArticle.published_date)}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                {highlightedArticle.title}
              </h2>
              {highlightedArticle.description && (
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  {highlightedArticle.description}
                </p>
              )}
            </div>
          </Link>
        </section>
      )}

      {/* Divider */}
      {rest.length > 0 && <hr className="border-gray-200 mb-12" />}

      {/* Article Grid */}
      {rest.length > 0 && (
        <section>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {rest.map((article) => (
              <Link
                key={article.id}
                href={article.url || "#"}
                target="_blank"
                className="block group break-inside-avoid"
              >
                <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  {article.image_url && (
                    <div className="relative">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full object-cover"
                      />
                      {renderLogoLockup(article, "sm")}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {article.category && (
                        <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">
                          {article.category}
                        </span>
                      )}
                      {article.published_date && (
                        <span className="text-gray-400 text-xs">
                          {formatDate(article.published_date)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-sm md:text-base">
                      {article.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
