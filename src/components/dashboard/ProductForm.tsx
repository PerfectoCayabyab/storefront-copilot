"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";

const TONES = ["professional", "playful", "luxury", "technical"] as const;

export default function ProductForm({
  storeId,
  product,
}: {
  storeId: string;
  product?: Product;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.title ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [inventory, setInventory] = useState(product ? String(product.inventory) : "0");
  const [status, setStatus] = useState<Product["status"]>(product?.status ?? "active");
  const [description, setDescription] = useState(product?.description ?? "");

  const [tone, setTone] = useState<(typeof TONES)[number]>("professional");
  const [keywords, setKeywords] = useState("");

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const generateDescription = async () => {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          keywords,
          tone,
          currentDescription: description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed.");
      setDescription(data.description);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setSaving(true);
    try {
      const payload = {
        storeId,
        title,
        category,
        description,
        price: Number(price),
        inventory: Number(inventory),
        status,
      };
      const res = await fetch(
        isEdit ? `/api/products/${product!.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save product.");
      if (data.warning) {
        setWarning(data.warning);
        setSaving(false);
        return;
      }
      router.push("/dashboard/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save product.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Ridgeline Waterproof Shell Jacket"
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
              Category
            </label>
            <input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Apparel"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Product["status"])}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label htmlFor="price" className="mb-1.5 block text-sm font-medium">
              Price
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="189.00"
            />
          </div>
          <div>
            <label htmlFor="inventory" className="mb-1.5 block text-sm font-medium">
              Inventory
            </label>
            <input
              id="inventory"
              type="number"
              min="0"
              step="1"
              required
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* AI copywriter */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden />
          <h2 className="font-medium">Description</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Write it yourself, or generate it with AI from the title, category, and
          keywords. Generating with an existing description improves it instead.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor="keywords" className="mb-1.5 block text-sm font-medium">
              Keywords <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="waterproof, lightweight, 3-layer shell"
            />
          </div>
          <div>
            <label htmlFor="tone" className="mb-1.5 block text-sm font-medium">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as (typeof TONES)[number])}
              className="rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating || !title.trim()}
            className="flex items-center gap-2 rounded-lg border border-line bg-background px-4 py-2 text-sm font-medium hover:bg-surface-muted disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            )}
            {generating ? "Generating…" : "Generate with AI"}
          </button>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          className="mt-4 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent"
          placeholder="A 3-layer waterproof shell with fully taped seams…"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
      {warning && (
        <p role="status" className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
          {warning}{" "}
          <button
            type="button"
            onClick={() => {
              router.push("/dashboard/products");
              router.refresh();
            }}
            className="underline"
          >
            Continue anyway
          </button>
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isEdit ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/products")}
          className="rounded-lg px-4 py-2.5 text-sm text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
