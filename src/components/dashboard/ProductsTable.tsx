"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { formatMoney, type Product } from "@/lib/types";

const statusStyles: Record<Product["status"], string> = {
  active: "bg-accent-soft text-accent",
  draft: "bg-amber-500/10 text-amber-600",
  archived: "bg-surface-muted text-muted",
};

export default function ProductsTable({
  products,
  currency,
}: {
  products: Product[];
  currency: string;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setError(null);
    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete product.");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
        No products yet. Add one to start using the AI assistant.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      {error && (
        <p role="alert" className="border-b border-line bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3 text-right font-medium">Inventory</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-surface-muted/50">
              <td className="max-w-64 px-4 py-3">
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="line-clamp-1 font-medium hover:text-accent"
                >
                  {product.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{product.category || "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[product.status]}`}
                >
                  {product.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatMoney(Number(product.price), currency)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{product.inventory}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    aria-label={`Edit ${product.title}`}
                    className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </Link>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    aria-label={`Delete ${product.title}`}
                    className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
