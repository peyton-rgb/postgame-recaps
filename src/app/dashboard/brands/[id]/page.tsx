"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase";
import { PostgameLogo } from "@/components/PostgameLogo";
import type { Brand } from "@/lib/types";

interface BrandCampaign {
  id: string;
  name: string;
  status: string | null;
  created_at: string;
}

interface CampaignRecap {
  id: string;
  name: string;
  client_name: string | null;
  published: boolean;
  created_at: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ColorSwatch({
  color,
  label,
  onSave,
}: {
  color: string;
  label: string;
  onSave: (val: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [val, setVal] = useState(color);
  const [hex, setHex] = useState(color);

  useEffect(() => {
    setVal(color);
    setHex(color);
  }, [color]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-gray-600 font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className="relative w-8 h-8 rounded-lg border border-white/10 cursor-pointer overflow-hidden"
          style={{ backgroundColor: val }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="color"
            value={val}
            onChange={(e) => { setVal(e.target.value); setHex(e.target.value); }}
            onBlur={() => { if (val !== color) onSave(val); }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
        <input
          value={hex}
          onChange={(e) => { setHex(e.target.value); setVal(e.target.value); }}
          onBlur={() => { if (hex !== color && /^#[0-9a-f]{6}$/i.test(hex)) onSave(hex); }}
          className="w-24 px-2 py-1 bg-transparent border border-transparent hover:border-gray-700 focus:border-gray-600 rounded text-xs text-gray-400 font-mono outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function InlineText({
  value,
  placeholder,
  onSave,
  className = "",
  multiline = false,
}: {
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
  className?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  function save() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  if (editing) {
    const shared = {
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: save,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Escape") { setDraft(value); setEditing(false); }
        if (!multiline && e.key === "Enter") save();
      },
      autoFocus: true,
      className: `w-full bg-black border border-[#D73F09] rounded-lg px-3 py-2 text-white outline-none ${className}`,
    };
    return multiline ? (
      <textarea {...shared} rows={3} style={{ resize: "vertical" }} />
    ) : (
      <input {...shared} />
    );
  }

  return (
    <div
      className={`group flex items-start gap-2 cursor-text ${className}`}
      onClick={() => setEditing(true)}
    >
      <span className={value ? "" : "text-gray-700 italic"}>
        {value || placeholder}
      </span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-0 group-hover:opacity-40 flex-shrink-0 mt-0.5 transition-opacity"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </div>
  );
}

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandCampaigns, setBrandCampaigns] = useState<BrandCampaign[]>([]);
  const [campaignRecaps, setCampaignRecaps] = useState<CampaignRecap[]>([]);
  const [assets, setAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"campaigns" | "media-kit">("campaigns");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);

  const supabase = createBrowserSupabase();

  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  async function loadAll() {
    const [
      { data: brandData },
      { data: bcData },
      { data: crData },
    ] = await Promise.all([
      supabase.from("brands").select("*").eq("id", id).single(),
      supabase
        .from("brand_campaigns")
        .select("id, name, status, created_at")
        .eq("brand_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("campaign_recaps")
        .select("id, name, client_name, published, created_at")
        .eq("brand_id", id)
        .order("created_at", { ascending: false }),
    ]);

    if (!brandData) {
      router.push("/dashboard/brands");
      return;
    }

    setBrand(brandData);
    setBrandCampaigns(bcData || []);
    setCampaignRecaps(crData || []);
    setLoading(false);
    loadAssets();
  }

  async function loadAssets() {
    const { data } = await supabase.storage
      .from("campaign-media")
      .list(`brands/${id}/assets`, { sortBy: { column: "created_at", order: "desc" } });

    if (data) {
      const urls = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => {
          const { data: { publicUrl } } = supabase.storage
            .from("campaign-media")
            .getPublicUrl(`brands/${id}/assets/${f.name}`);
          return publicUrl;
        });
      setAssets(urls);
    }
  }

  async function saveField(field: keyof Brand, value: string) {
    if (!brand) return;
    const { data } = await supabase
      .from("brands")
      .update({ [field]: value || null })
      .eq("id", id)
      .select()
      .single();
    if (data) setBrand(data);
  }

  async function uploadLogo(file: File) {
    if (!brand) return;
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const path = `brands/${id}/logo.${ext}`;
    const { error } = await supabase.storage
      .from("campaign-media")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from("campaign-media")
        .getPublicUrl(path);
      await saveField("logo_url", publicUrl);
    }
    setUploadingLogo(false);
  }

  async function uploadAsset(file: File) {
    setUploadingAsset(true);
    const path = `brands/${id}/assets/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("campaign-media")
      .upload(path, file, { upsert: true });
    if (!error) {
      loadAssets();
    }
    setUploadingAsset(false);
  }

  async function deleteAsset(url: string) {
    const pathMatch = url.match(/brands\/.+$/);
    if (!pathMatch) return;
    await supabase.storage.from("campaign-media").remove([pathMatch[0]]);
    setAssets((prev) => prev.filter((a) => a !== url));
  }

  function triggerFileInput(accept: string, onFile: (f: File) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) onFile(f);
    };
    input.click();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!brand) return null;

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
            <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
              Dashboard
            </Link>
            <span className="text-gray-700">/</span>
            <Link href="/dashboard/brands" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
              Brands
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-sm font-black text-white">{brand.name}</span>
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
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto">
        {/* Brand hero */}
        <div className="flex items-start gap-6 mb-10">
          {/* Logo */}
          <div className="relative group flex-shrink-0">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="w-24 h-24 object-contain rounded-2xl bg-gray-900 border border-gray-800"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-black border border-white/10"
                style={{ backgroundColor: brand.primary_color || "#D73F09" }}
              >
                {getInitials(brand.name)}
              </div>
            )}
            <button
              onClick={() => triggerFileInput("image/*", uploadLogo)}
              disabled={uploadingLogo}
              className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white disabled:opacity-30"
            >
              {uploadingLogo ? "..." : "Change"}
            </button>
          </div>

          {/* Name + details */}
          <div className="flex-1 min-w-0">
            <InlineText
              value={brand.name}
              placeholder="Brand name"
              onSave={(v) => saveField("name", v)}
              className="text-3xl font-black text-white mb-2"
            />

            {/* Website */}
            <div className="flex items-center gap-2 mb-4">
              {brand.website ? (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#D73F09] hover:underline mr-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {brand.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
              <InlineText
                value={brand.website || ""}
                placeholder="Add website..."
                onSave={(v) => saveField("website", v)}
                className="text-sm text-gray-500"
              />
            </div>

            {/* Color swatches */}
            <div className="flex items-center gap-6">
              <ColorSwatch
                color={brand.primary_color || "#D73F09"}
                label="Primary"
                onSave={(v) => saveField("primary_color", v)}
              />
              <ColorSwatch
                color={brand.secondary_color || "#000000"}
                label="Secondary"
                onSave={(v) => saveField("secondary_color", v)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Notes
          </label>
          <InlineText
            value={brand.notes || ""}
            placeholder="Add notes..."
            onSave={(v) => saveField("notes", v)}
            className="text-sm text-gray-400"
            multiline
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6 flex gap-1">
          {(["campaigns", "media-kit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors capitalize ${
                activeTab === tab
                  ? "text-white border-b-2 border-[#D73F09] bg-white/5"
                  : "text-gray-500 hover:text-gray-300 border-b-2 border-transparent"
              }`}
            >
              {tab === "media-kit" ? "Media Kit" : "Campaigns"}
            </button>
          ))}
        </div>

        {/* Campaigns tab */}
        {activeTab === "campaigns" && (
          <div className="space-y-10">
            {/* Brand Campaigns */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                Brand Campaigns
              </h3>
              {brandCampaigns.length === 0 ? (
                <p className="text-sm text-gray-700 py-4">No brand campaigns linked to this brand.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brandCampaigns.map((c) => {
                    const isArchived = c.status === "archived";
                    return (
                      <div
                        key={c.id}
                        className="p-5 bg-[#111] border border-gray-800 rounded-xl hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              isArchived
                                ? "bg-gray-800 text-gray-600"
                                : "bg-green-900/30 text-green-400"
                            }`}
                          >
                            {isArchived ? "Archived" : "Active"}
                          </span>
                        </div>
                        <h3 className="text-base font-black mb-2">{c.name}</h3>
                        <p className="text-xs text-gray-600">
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Campaign Recaps */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                Campaign Recaps
              </h3>
              {campaignRecaps.length === 0 ? (
                <p className="text-sm text-gray-700 py-4">No campaign recaps linked to this brand.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaignRecaps.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 bg-[#111] border border-gray-800 rounded-xl hover:border-gray-600 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/${c.id}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {c.client_name || "—"}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            c.published
                              ? "bg-green-900/30 text-green-400"
                              : "bg-gray-800 text-gray-500"
                          }`}
                        >
                          {c.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <h3 className="text-base font-black mb-2">{c.name}</h3>
                      <p className="text-xs text-gray-600">
                        {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Kit tab */}
        {activeTab === "media-kit" && (
          <div>
            {/* Logo section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Brand Logo
                </h3>
                <button
                  onClick={() => triggerFileInput("image/*", uploadLogo)}
                  disabled={uploadingLogo}
                  className="px-3 py-1.5 text-xs font-bold border border-gray-700 rounded-lg text-gray-400 hover:border-gray-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? "Uploading..." : "Replace Logo"}
                </button>
              </div>
              <div className="p-6 bg-[#111] border border-gray-800 rounded-xl inline-flex">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-h-32 max-w-xs object-contain"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-xl flex items-center justify-center text-white text-2xl font-black"
                    style={{ backgroundColor: brand.primary_color || "#D73F09" }}
                  >
                    {getInitials(brand.name)}
                  </div>
                )}
              </div>
            </div>

            {/* Assets section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Brand Assets
                </h3>
                <button
                  onClick={() => triggerFileInput("image/*,video/*,.pdf,.ai,.eps,.svg", uploadAsset)}
                  disabled={uploadingAsset}
                  className="px-3 py-1.5 text-xs font-bold bg-[#D73F09] rounded-lg text-white hover:bg-[#B33407] transition-colors disabled:opacity-50"
                >
                  {uploadingAsset ? "Uploading..." : "+ Upload Asset"}
                </button>
              </div>

              {assets.length === 0 ? (
                <div
                  onClick={() => triggerFileInput("image/*,video/*,.pdf,.ai,.eps,.svg", uploadAsset)}
                  className="border-2 border-dashed border-gray-800 rounded-xl p-12 text-center cursor-pointer hover:border-gray-600 transition-colors"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#444"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-3"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-gray-600 font-bold">Upload brand assets</p>
                  <p className="text-xs text-gray-700 mt-1">
                    Logos, style guides, brand files — PNG, SVG, PDF, AI, EPS
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {assets.map((url) => {
                    const filename = decodeURIComponent(url.split("/").pop() || "").replace(/^\d+-/, "");
                    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url);
                    return (
                      <div
                        key={url}
                        className="relative group bg-[#111] border border-gray-800 rounded-xl overflow-hidden"
                      >
                        {isImage ? (
                          <img
                            src={url}
                            alt={filename}
                            className="w-full aspect-square object-contain p-3"
                          />
                        ) : (
                          <div className="w-full aspect-square flex flex-col items-center justify-center gap-2 text-gray-600 p-4">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span className="text-xs text-center break-all">{filename}</span>
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a
                            href={url}
                            download={filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                            title="Download"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </a>
                          <button
                            onClick={() => deleteAsset(url)}
                            className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors"
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>

                        <p className="px-2 pb-2 text-[10px] text-gray-600 truncate">{filename}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
