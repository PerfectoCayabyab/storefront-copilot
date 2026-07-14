"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DatabaseZap, Loader2 } from "lucide-react";
import type { Store } from "@/lib/types";

export default function SettingsForm({ store }: { store: Store }) {
  const router = useRouter();
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description);
  const [currency, setCurrency] = useState(store.currency);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save settings.");
      setSavedMessage("Settings saved.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const rebuildIndex = async () => {
    setError(null);
    setSyncMessage(null);
    setSyncing(true);
    try {
      const res = await fetch("/api/ai/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: store.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Index rebuild failed.");
      setSyncMessage(`AI index rebuilt — ${data.synced} product(s) indexed.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Index rebuild failed.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-medium">Store details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Store name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
              Description{" "}
              <span className="font-normal text-muted">
                (given to the AI assistant as context)
              </span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="currency" className="mb-1.5 block text-sm font-medium">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full max-w-40 rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {["USD", "EUR", "GBP", "PHP", "AUD", "CAD", "SGD", "JPY"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {savedMessage && (
          <p role="status" className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            {savedMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Save settings
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-medium">AI index</h2>
        <p className="mt-1 text-sm text-muted">
          The assistant searches vector embeddings of your products. Rebuild the
          index if products were added while the Gemini API key was missing, or
          if answers seem out of date.
        </p>

        {syncMessage && (
          <p role="status" className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            {syncMessage}
          </p>
        )}

        <button
          onClick={rebuildIndex}
          disabled={syncing}
          className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-background px-5 py-2.5 text-sm font-medium hover:bg-surface-muted disabled:opacity-60"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <DatabaseZap className="h-4 w-4 text-accent" aria-hidden />
          )}
          {syncing ? "Rebuilding…" : "Rebuild AI index"}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
