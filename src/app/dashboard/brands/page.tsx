"use client";

import Link from "next/link";
import { PostgameLogo } from "@/components/PostgameLogo";
import BrandList from "@/components/BrandList";
import { createBrowserSupabase } from "@/lib/supabase";

export default function BrandsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <PostgameLogo size="md" />
            </Link>
            <span className="text-gray-700">/</span>
            <Link
              href="/dashboard"
              className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-gray-700">/</span>
            <h1 className="text-sm font-black text-white">Brands</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/media-library"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Media Library
            </Link>
            <button
              onClick={async () => {
                await createBrowserSupabase().auth.signOut();
                window.location.href = "/login";
              }}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <BrandList />
      </div>
    </div>
  );
}
