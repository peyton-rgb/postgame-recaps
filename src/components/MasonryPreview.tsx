"use client";

import { CampaignRecap } from "./CampaignRecap";
import type { Campaign, Athlete, Media } from "@/lib/types";

export function MasonryPreview({
  campaign,
  athletes,
  media,
  onBack,
}: {
  campaign: Campaign;
  athletes: Athlete[];
  media: Record<string, Media[]>;
  onBack: () => void;
}) {
  return (
    <div>
      {/* Back bar */}
      <div className="sticky top-0 z-50 px-8 py-3 border-b border-gray-800 bg-black/95 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-700 rounded-lg text-sm font-bold text-white hover:border-gray-500"
          >
            ← Back to Editor
          </button>
          <span className="text-sm font-bold">Preview</span>
        </div>
        <span className="text-xs text-gray-600">
          This is how clients will see it
        </span>
      </div>

      {/* Render the same gallery component */}
      <CampaignRecap campaign={campaign} athletes={athletes} media={media} />
    </div>
  );
}
