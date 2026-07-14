import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CHAT_MODEL, embedText, getGenAI } from "@/lib/gemini";
import { formatMoney, type MatchedProduct, type Store } from "@/lib/types";

type HistoryMessage = { role: "user" | "model"; text: string };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const storeId = String(body.storeId ?? "");
  const message = String(body.message ?? "").trim();
  const history: HistoryMessage[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (m: HistoryMessage) =>
            (m.role === "user" || m.role === "model") && typeof m.text === "string"
        )
        .slice(-10)
    : [];

  if (!storeId || !message) {
    return NextResponse.json(
      { error: "storeId and message are required." },
      { status: 400 }
    );
  }

  // RLS: returns null unless the requesting user owns this store.
  const { data: store } = await supabase
    .from("stores")
    .select()
    .eq("id", storeId)
    .single<Store>();
  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  try {
    // Retrieval: embed the question, then cosine-search this store's catalog.
    const queryEmbedding = await embedText(message);
    const { data: matches, error: matchError } = await supabase.rpc("match_products", {
      p_store_id: storeId,
      query_embedding: queryEmbedding,
      match_count: 6,
    });
    if (matchError) {
      return NextResponse.json(
        { error: `Catalog search failed: ${matchError.message}` },
        { status: 500 }
      );
    }

    const catalogContext =
      (matches as MatchedProduct[] | null)
        ?.map(
          (m) =>
            `- ${m.title} | ${m.category || "Uncategorized"} | ${formatMoney(
              Number(m.price),
              store.currency
            )} | ${m.inventory} in stock | status: ${m.status}\n  ${m.description}`
        )
        .join("\n") || "(no matching products found)";

    const systemInstruction = [
      `You are the AI assistant for "${store.name}", an online store.`,
      store.description && `About the store: ${store.description}`,
      "You help the merchant and their customers with questions about the catalog: recommendations, comparisons, stock, and prices.",
      "Answer using ONLY the catalog context below. If the answer is not in the context, say you could not find it in the catalog — never invent products, prices, or stock numbers.",
      "Be concise and friendly. Use short paragraphs or bullet lists.",
      "",
      "Catalog context (most relevant products for the latest question):",
      catalogContext,
    ]
      .filter(Boolean)
      .join("\n");

    const ai = getGenAI();
    const stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: [
        ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: "user", parts: [{ text: message }] },
      ],
      config: { systemInstruction },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed." },
      { status: 502 }
    );
  }
}
