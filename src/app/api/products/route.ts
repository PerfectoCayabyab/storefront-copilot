import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProductEmbeddings } from "@/lib/embeddings";

function parseProductBody(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "").trim();
  const status = ["active", "draft", "archived"].includes(String(body.status))
    ? String(body.status)
    : "active";
  const price = Number(body.price);
  const inventory = Number(body.inventory);

  if (!title) return { error: "Title is required." };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a non-negative number." };
  if (!Number.isInteger(inventory) || inventory < 0)
    return { error: "Inventory must be a non-negative whole number." };

  return { values: { title, description, category, status, price, inventory } };
}

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

  const parsed = parseProductBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // RLS with-check rejects inserts into stores the user does not own.
  const { data: product, error } = await supabase
    .from("products")
    .insert({ ...parsed.values, store_id: storeId })
    .select()
    .single();
  if (error || !product) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create product." },
      { status: 500 }
    );
  }

  let warning: string | undefined;
  try {
    await syncProductEmbeddings(supabase, [product]);
  } catch {
    warning = "Product saved, but the AI index was not updated. Rebuild it from Settings.";
  }

  return NextResponse.json({ product, warning });
}
