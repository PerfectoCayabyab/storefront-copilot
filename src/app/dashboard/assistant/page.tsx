import type { Metadata } from "next";
import { requireStore } from "@/lib/store";
import AssistantChat from "@/components/dashboard/AssistantChat";

export const metadata: Metadata = { title: "AI Assistant" };

export default async function AssistantPage() {
  const { supabase, store } = await requireStore();

  const { count } = await supabase
    .from("product_embeddings")
    .select("product_id", { count: "exact", head: true })
    .eq("store_id", store.id);

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <h1 className="text-2xl font-semibold">AI Assistant</h1>
      <p className="mt-1 text-sm text-muted">
        Ask about {store.name}&rsquo;s catalog — answers are grounded in your
        indexed products ({count ?? 0} indexed).
      </p>
      <AssistantChat storeId={store.id} indexedCount={count ?? 0} />
    </div>
  );
}
