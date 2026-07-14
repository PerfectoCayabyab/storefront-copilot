"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/types";

type Point = { date: string; total: number };

const CHART_COLOR = "var(--chart-1)";

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function RevenueChart({
  data,
  currency,
}: {
  data: Point[];
  currency: string;
}) {
  const compact = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <div className="h-64 w-full" role="img" aria-label="Daily revenue line chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.25} />
              <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--color-line)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-line)" }}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={compact}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-muted)", strokeDasharray: "3 3" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-lg">
                  <p className="text-muted">{shortDate(String(label))}</p>
                  <p className="font-medium tabular-nums">
                    {formatMoney(Number(payload[0].value), currency)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={CHART_COLOR}
            strokeWidth={2}
            fill="url(#revenueFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
