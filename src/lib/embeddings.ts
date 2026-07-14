import type { SupabaseClient } from "@supabase/supabase-js";
import { embedTexts, productEmbeddingContent } from "./gemini";
import type { Product } from "./types";

const BATCH_SIZE = 50;

/**
 * (Re)builds the vector index rows for the given products. RLS on
 * product_embeddings ensures only the store owner can write them.
 */
export async function syncProductEmbeddings(
  supabase: SupabaseClient,
  products: Pick<Product, "id" | "store_id" | "title" | "description" | "category" | "price">[]
): Promise<number> {
  if (products.length === 0) return 0;

  let synced = 0;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const contents = batch.map((p) =>
      productEmbeddingContent({
        title: p.title,
        description: p.description,
        category: p.category,
        price: Number(p.price),
      })
    );
    const embeddings = await embedTexts(contents);

    const rows = batch.map((p, idx) => ({
      product_id: p.id,
      store_id: p.store_id,
      content: contents[idx],
      embedding: embeddings[idx],
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("product_embeddings").upsert(rows);
    if (error) throw new Error(`Failed to save embeddings: ${error.message}`);
    synced += rows.length;
  }
  return synced;
}
