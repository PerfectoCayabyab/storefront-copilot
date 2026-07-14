import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProductEmbeddings } from "@/lib/embeddings";

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
  if (!storeId) {
    return NextResponse.json({ error: "storeId is required." }, { status: 400 });
  }

  // RLS scopes this select to the caller's own stores.
  const { data: products, error } = await supabase
    .from("products")
    .select("id, store_id, title, description, category, price")
    .eq("store_id", storeId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const synced = await syncProductEmbeddings(supabase, products ?? []);
    return NextResponse.json({ synced });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Embedding sync failed." },
      { status: 502 }
    );
  }
}
