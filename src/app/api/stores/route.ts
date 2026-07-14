import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_PRODUCTS, DEMO_STORE, buildDemoOrders } from "@/lib/demo-data";
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
  const seedDemo = Boolean(body.seedDemo);
  const name = seedDemo ? DEMO_STORE.name : String(body.name ?? "").trim();
  const description = seedDemo
    ? DEMO_STORE.description
    : String(body.description ?? "").trim();
  const currency = seedDemo
    ? DEMO_STORE.currency
    : String(body.currency ?? "USD").trim() || "USD";

  if (!name) {
    return NextResponse.json({ error: "Store name is required." }, { status: 400 });
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .insert({ owner_id: user.id, name, description, currency })
    .select()
    .single();
  if (storeError || !store) {
    return NextResponse.json(
      { error: storeError?.message ?? "Failed to create store." },
      { status: 500 }
    );
  }

  let warning: string | undefined;

  if (seedDemo) {
    // 1. Products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .insert(DEMO_PRODUCTS.map((p) => ({ ...p, store_id: store.id })))
      .select();
    if (productsError || !products) {
      return NextResponse.json(
        { error: `Store created, but seeding products failed: ${productsError?.message}` },
        { status: 500 }
      );
    }

    // 2. Orders — rows come back in insertion order, matching demoOrders.
    const demoOrders = buildDemoOrders();
    const now = Date.now();
    const orderRows = demoOrders.map((order, idx) => {
      const placedAt = new Date(now - order.daysAgo * 86_400_000);
      placedAt.setHours(9 + (idx % 11), (idx * 13) % 60, 0, 0);
      const total = order.items.reduce(
        (sum, item) => sum + DEMO_PRODUCTS[item.productIndex].price * item.quantity,
        0
      );
      return {
        store_id: store.id,
        customer_name: order.customer_name,
        status: order.status,
        total: Math.round(total * 100) / 100,
        placed_at: placedAt.toISOString(),
      };
    });

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .insert(orderRows)
      .select("id");
    if (ordersError || !orders) {
      return NextResponse.json(
        { error: `Store created, but seeding orders failed: ${ordersError?.message}` },
        { status: 500 }
      );
    }

    // 3. Order items
    const itemRows = demoOrders.flatMap((order, idx) =>
      order.items.map((item) => {
        const demoProduct = DEMO_PRODUCTS[item.productIndex];
        const product = products.find((p) => p.title === demoProduct.title);
        return {
          order_id: orders[idx].id,
          product_id: product?.id ?? null,
          product_title: demoProduct.title,
          quantity: item.quantity,
          unit_price: demoProduct.price,
        };
      })
    );
    const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
    if (itemsError) {
      return NextResponse.json(
        { error: `Store created, but seeding order items failed: ${itemsError.message}` },
        { status: 500 }
      );
    }

    // 4. Vector index — optional: works only once GEMINI_API_KEY is set.
    try {
      await syncProductEmbeddings(supabase, products);
    } catch (e) {
      warning = `Store seeded, but the AI index could not be built: ${
        e instanceof Error ? e.message : "unknown error"
      }. You can retry from Settings → "Rebuild AI index".`;
    }
  }

  return NextResponse.json({ storeId: store.id, warning });
}
