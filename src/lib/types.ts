export type Store = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  currency: string;
  created_at: string;
};

export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  store_id: string;
  title: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  store_id: string;
  customer_name: string;
  total: number;
  status: "pending" | "paid" | "fulfilled" | "refunded";
  placed_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  quantity: number;
  unit_price: number;
};

export type MatchedProduct = {
  product_id: string;
  title: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
  status: ProductStatus;
  similarity: number;
};

export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
