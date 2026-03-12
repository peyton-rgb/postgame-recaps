import Link from "next/link";
import Image from "next/image";
import { shoots } from "@/lib/run-of-show-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "St. Patrick's Day 2026 — Run of Shows | Postgame x Raising Cane's",
  description:
    "Run of show documents for all Raising Cane's St. Patrick's Day 2026 shoots",
};

export default function RunOfShowIndex() {
  return (
    <div className="min-h-screen bg-[#f5f5f4] text-gray-900">
      {/* Header */}
      <div className="border-b border-[#222] bg-black">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center">
          <Image
            src="/postgame-logo.png"
            alt="Postgame"
            width={150}
            height={31}
            priority
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/raising-canes-logo.png"
              alt="Raising Cane's"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-gray-900">
            St. Patrick's Day 2026
          </h1>
          <p className="text-gray-500">Run of Shows — 7 Shoots Nationwide</p>
        </div>

        {/* Shoot Cards */}
        <div className="space-y-3">
          {shoots.map((shoot) => (
            <Link
              key={shoot.slug}
              href={`/run-of-show/${shoot.slug}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-[#D73F09] transition-colors group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-lg text-gray-900 group-hover:text-[#D73F09] transition-colors">
                      {shoot.city}, {shoot.state}
                    </h2>
                    {shoot.type === "river-dyeing" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        River Dyeing
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{shoot.parade}</div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Date
                    </div>
                    <div className="text-gray-700">{shoot.date}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Start
                    </div>
                    <div className="text-gray-700">
                      {shoot.paradeStartTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Videographer
                    </div>
                    <div className="text-gray-700">{shoot.videographer}</div>
                  </div>
                  <div className="text-gray-300 group-hover:text-[#D73F09] transition-colors">
                    →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center pt-10 mt-10 border-t border-gray-200">
          <Image
            src="/postgame-logo-black.png"
            alt="Postgame"
            width={130}
            height={28}
            className="mb-2"
          />
          <div className="text-xs text-gray-400">
            Raising Cane's — St. Patrick's Day 2026
          </div>
        </div>
      </div>
    </div>
  );
}
