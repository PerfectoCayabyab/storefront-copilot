import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProductEmbeddings } from "@/lib/embeddings";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
  if (typeof body.description === "string") updates.description = body.description.trim();
  if (typeof body.category === "string") updates.category = body.category.trim();
  if (["active", "draft", "archived"].includes(String(body.status)))
    updates.status = String(body.status);
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0)
      return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
    updates.price = price;
  }
  if (body.inventory !== undefined) {
    const inventory = Number(body.inventory);
    if (!Number.isInteger(inventory) || inventory < 0)
      return NextResponse.json(
        { error: "Inventory must be a non-negative whole number." },
        { status: 400 }
      );
    updates.inventory = inventory;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error || !product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  let warning: string | undefined;
  try {
    await syncProductEmbeddings(supabase, [product]);
  } catch {
    warning = "Product saved, but the AI index was not updated. Rebuild it from Settings.";
  }

  return NextResponse.json({ product, warning });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // The embedding row is removed via ON DELETE CASCADE.
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
