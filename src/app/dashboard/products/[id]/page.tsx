import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/dashboard/ProductForm";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, store } = await requireStore();

  const { data: product } = await supabase
    .from("products")
    .select()
    .eq("id", id)
    .eq("store_id", store.id)
    .maybeSingle<Product>();
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Edit product</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Changes re-index the product for the AI assistant automatically.
      </p>
      <ProductForm storeId={store.id} product={product} />
    </div>
  );
}
