import { GoogleGenAI } from "@google/genai";

// Free-tier models from Google AI Studio. gemini-2.5-flash was retired for
// new API keys, so default to the current stable flash; override via env if
// this happens again. gemini-embedding-001 still works and must stay fixed —
// changing it would invalidate the stored 768-dim vectors.
export const CHAT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
export const EMBEDDING_MODEL = "gemini-embedding-001";
// Must match the vector(768) column in supabase/migrations/0001_init.sql.
export const EMBEDDING_DIMS = 768;

export function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to .env.local.");
  }
  return new GoogleGenAI({ apiKey });
}

// gemini-embedding-001 vectors are only pre-normalized at 3072 dims, so we
// normalize truncated vectors ourselves before storing/searching.
function normalize(values: number[]): number[] {
  const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return values;
  return values.map((v) => v / norm);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const ai = getGenAI();
  const res = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: { outputDimensionality: EMBEDDING_DIMS },
  });
  const embeddings = res.embeddings ?? [];
  if (embeddings.length !== texts.length) {
    throw new Error("Gemini returned an unexpected number of embeddings.");
  }
  return embeddings.map((e) => normalize(e.values ?? []));
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

/** The text that represents a product in the vector index. */
export function productEmbeddingContent(product: {
  title: string;
  description: string;
  category: string;
  price: number;
}): string {
  return [
    `Product: ${product.title}`,
    product.category ? `Category: ${product.category}` : "",
    `Price: ${product.price}`,
    product.description ? `Description: ${product.description}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
