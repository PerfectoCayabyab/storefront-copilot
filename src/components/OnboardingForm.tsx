"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2, Sparkles, Store } from "lucide-react";

export default function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [busy, setBusy] = useState<"demo" | "custom" | null>(null);

  const createStore = async (seedDemo: boolean) => {
    setError(null);
    setWarning(null);
    setBusy(seedDemo ? "demo" : "custom");
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          seedDemo ? { seedDemo: true } : { name, description, currency }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create store.");
      if (data.warning) {
        setWarning(data.warning);
        // Give the user a moment to read the warning before redirecting.
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 3500);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(null);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <Bot className="h-6 w-6 text-accent" aria-hidden />
          Storefront Copilot
        </div>

        <div className="rounded-2xl border border-line bg-surface p-8">
          <h1 className="text-xl font-semibold">Set up your store</h1>
          <p className="mt-1 text-sm text-muted">
            Start with a fully seeded demo store, or create your own from scratch.
          </p>

          <button
            onClick={() => createStore(true)}
            disabled={busy !== null}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-medium text-white hover:bg-accent-strong disabled:opacity-60"
          >
            {busy === "demo" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {busy === "demo"
              ? "Seeding demo store…"
              : "Create demo store (16 products, 60 days of orders)"}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
            <span className="h-px flex-1 bg-line" />
            or start empty
            <span className="h-px flex-1 bg-line" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createStore(false);
            }}
            className="space-y-4"
          >
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
                placeholder="Aurora Outfitters"
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                What do you sell?{" "}
                <span className="font-normal text-muted">(helps the AI assistant)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="Outdoor apparel and gear for hikers and campers…"
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
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {["USD", "EUR", "GBP", "PHP", "AUD", "CAD", "SGD", "JPY"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            )}
            {warning && (
              <p role="status" className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
                {warning} Redirecting to your dashboard…
              </p>
            )}

            <button
              type="submit"
              disabled={busy !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-background px-4 py-2.5 font-medium hover:bg-surface-muted disabled:opacity-60"
            >
              {busy === "custom" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Store className="h-4 w-4" aria-hidden />
              )}
              Create empty store
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
