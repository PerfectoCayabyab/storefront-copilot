import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import ProductsTable from "@/components/dashboard/ProductsTable";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const { supabase, store } = await requireStore();

  const { data } = await supabase
    .from("products")
    .select()
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });
  const products = (data ?? []) as Product[];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} product{products.length === 1 ? "" : "s"} in {store.name}
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New product
        </Link>
      </div>

      <div className="mt-6">
        <ProductsTable products={products} currency={store.currency} />
      </div>
    </div>
  );
}
