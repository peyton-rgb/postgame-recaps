import { createServerSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { CampaignRecap } from "@/components/CampaignRecap";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerSupabase();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("name, client_name")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!campaign) return { title: "Not Found" };

  return {
    title: `${campaign.name} — ${campaign.client_name} Campaign Recap`,
    description: `Campaign recap for ${campaign.name} by ${campaign.client_name}`,
  };
}

export default async function RecapPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerSupabase();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!campaign) notFound();

  const [{ data: athletes }, { data: media }] = await Promise.all([
    supabase
      .from("athletes")
      .select("*")
      .eq("campaign_id", campaign.id)
      .order("sort_order"),
    supabase
      .from("media")
      .select("*")
      .eq("campaign_id", campaign.id)
      .order("sort_order"),
  ]);

  const mediaByAthlete: Record<string, any[]> = {};
  (media || []).forEach((m: any) => {
    if (!mediaByAthlete[m.athlete_id]) mediaByAthlete[m.athlete_id] = [];
    mediaByAthlete[m.athlete_id].push(m);
  });

  return (
    <CampaignRecap
      campaign={campaign}
      athletes={athletes || []}
      media={mediaByAthlete}
    />
  );
}
