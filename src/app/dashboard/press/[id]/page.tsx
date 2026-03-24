"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import type { PressArticle } from "@/lib/types";
import Link from "next/link";

const CATEGORIES = ["Campaign", "Industry", "Award", "Draft", "Creative", "Milestone", "Experiential"];

export default function PressEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<PressArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createBrowserSupabase();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [publication, setPublication] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [id]);

  async function loadArticle() {
    const { data } = await supabase.from("press_articles").select("*").eq("id", id).single();
    if (data) {
      setArticle(data);
      setTitle(data.title || "");
      setSlug(data.slug || "");
      setPublication(data.publication || "");
      setAuthor(data.author || "");
      setCategory(data.category || "");
      setExcerpt(data.excerpt || "");
      setContent(data.content || "");
      setExternalUrl(data.external_url || "");
      setImageUrl(data.image_url || "");
      setPublishedDate(data.published_date || "");
      setFeatured(data.featured);
    }
    setLoading(false);
  }

  async function saveArticle(publish?: boolean) {
    if (!article) return;
    setSaving(true);
    const updates: Record<string, unknown> = {
      title,
      slug,
      publication: publication || null,
      author: author || null,
      category: category || null,
      excerpt: excerpt || null,
      content: content || null,
      external_url: externalUrl || null,
      image_url: imageUrl || null,
      published_date: publishedDate || null,
      featured,
      updated_at: new Date().toISOString(),
    };
    if (publish !== undefined) updates.published = publish;

    const { data } = await supabase
      .from("press_articles")
      .update(updates)
      .eq("id", article.id)
      .select()
      .single();
    if (data) {
      setArticle(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }
  if (!article) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Article not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <Link href="/dashboard?tab=press" className="text-xs text-gray-500 hover:text-gray-300 mb-1 block">
            ← Back to Press
          </Link>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">
            {article.publication || "Press Article"}
          </div>
          <h1 className="text-lg font-black">{article.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {article.published && (
            <Link href={`/press`} target="_blank" className="text-xs text-[#D73F09] hover:underline">
              View Live →
            </Link>
          )}
          <button
            onClick={() => saveArticle()}
            disabled={saving}
            className="px-4 py-2 border border-gray-700 text-gray-400 text-sm font-bold rounded-lg hover:border-[#D73F09] hover:text-[#D73F09] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save Draft"}
          </button>
          <button
            onClick={() => saveArticle(!article.published)}
            disabled={saving}
            className="px-5 py-2 bg-[#D73F09] text-white text-sm font-bold rounded-lg hover:bg-[#B33407] disabled:opacity-50"
          >
            {article.published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#D73F09] outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#D73F09] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Publication</label>
            <input value={publication} onChange={(e) => setPublication(e.target.value)} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#D73F09] outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Author</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#D73F09] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#D73F09] outline-none appearance-none">
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white text-sm focus:border-[#D73F09] outline-none resize-y" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white text-sm focus:border-[#D73F09] outline-none resize-y" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">External URL</label>
            <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#D73F09] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Image URL</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#D73F09] outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Published Date</label>
            <input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#D73F09] outline-none" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-5 h-5 rounded border-gray-700 bg-black text-[#D73F09] focus:ring-[#D73F09]" />
              <span className="text-sm font-bold text-gray-400">Featured Article</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
