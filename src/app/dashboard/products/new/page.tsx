import type { Metadata } from "next";
import { requireStore } from "@/lib/store";
import ProductForm from "@/components/dashboard/ProductForm";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const { store } = await requireStore();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">New product</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Add a product to {store.name}. It becomes searchable by the AI assistant
        as soon as it is saved.
      </p>
      <ProductForm storeId={store.id} />
    </div>
  );
}
