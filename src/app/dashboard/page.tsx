import type { Metadata } from "next";
import Link from "next/link";
import { Package, Receipt, TrendingUp, Wallet } from "lucide-react";
import { requireStore } from "@/lib/store";
import { formatMoney, type Order } from "@/lib/types";
import RevenueChart from "@/components/dashboard/RevenueChart";

export const metadata: Metadata = { title: "Overview" };

const DAYS = 30;

type ItemRow = {
  product_title: string;
  quantity: number;
  unit_price: number;
};

// Request-scoped time window; this page is always dynamically rendered.
function buildWindow(days: number) {
  const now = Date.now();
  const since = new Date(now - days * 86_400_000);
  since.setHours(0, 0, 0, 0);
  const dayKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dayKeys.push(new Date(now - i * 86_400_000).toISOString().slice(0, 10));
  }
  return { since, dayKeys };
}

export default async function OverviewPage() {
  const { supabase, store } = await requireStore();
  const { since, dayKeys } = buildWindow(DAYS);

  const [ordersRes, productCountRes, itemsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, status, customer_name, placed_at")
      .eq("store_id", store.id)
      .gte("placed_at", since.toISOString())
      .order("placed_at", { ascending: false }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id),
    supabase
      .from("order_items")
      .select("product_title, quantity, unit_price, orders!inner(store_id, placed_at)")
      .eq("orders.store_id", store.id)
      .gte("orders.placed_at", since.toISOString()),
  ]);

  const orders = (ordersRes.data ?? []) as Order[];
  const productCount = productCountRes.count ?? 0;
  const items = (itemsRes.data ?? []) as unknown as ItemRow[];

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = orders.length;
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

  // Revenue per day, zero-filled so the chart has no gaps.
  const byDay = new Map<string, number>();
  for (const key of dayKeys) {
    byDay.set(key, 0);
  }
  for (const order of orders) {
    const key = order.placed_at.slice(0, 10);
    if (byDay.has(key)) byDay.set(key, byDay.get(key)! + Number(order.total));
  }
  const chartData = [...byDay.entries()].map(([date, total]) => ({
    date,
    total: Math.round(total * 100) / 100,
  }));

  // Top products by revenue.
  const byProduct = new Map<string, number>();
  for (const item of items) {
    byProduct.set(
      item.product_title,
      (byProduct.get(item.product_title) ?? 0) +
        Number(item.unit_price) * item.quantity
    );
  }
  const topProducts = [...byProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topMax = topProducts[0]?.[1] ?? 0;

  const stats = [
    {
      label: `Revenue (${DAYS}d)`,
      value: formatMoney(revenue, store.currency),
      icon: Wallet,
    },
    { label: `Orders (${DAYS}d)`, value: String(orderCount), icon: Receipt },
    {
      label: "Avg. order value",
      value: formatMoney(avgOrder, store.currency),
      icon: TrendingUp,
    },
    { label: "Products", value: String(productCount), icon: Package },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="mt-1 text-sm text-muted">
        How {store.name} performed over the last {DAYS} days.
      </p>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-medium">Daily revenue</h2>
        <p className="text-sm text-muted">Last {DAYS} days</p>
        <div className="mt-4">
          <RevenueChart data={chartData} currency={store.currency} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-medium">Top products by revenue</h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders in this period yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topProducts.map(([title, value]) => (
                <li key={title}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate">{title}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {formatMoney(value, store.currency)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${topMax > 0 ? Math.max(4, (value / topMax) * 100) : 0}%`,
                        background: "var(--chart-1)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-medium">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              No orders yet. Seeded demo stores include 60 days of history.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {orders.slice(0, 6).map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate">{order.customer_name || "Customer"}</p>
                    <p className="text-xs text-muted">
                      {new Date(order.placed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {order.status}
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums">
                    {formatMoney(Number(order.total), store.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {productCount === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Your catalog is empty.{" "}
          <Link href="/dashboard/products/new" className="text-accent hover:underline">
            Add your first product
          </Link>{" "}
          to unlock the AI assistant.
        </div>
      )}
    </div>
  );
}
