import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Lightweight health check that also touches the database, so scheduled pings
// count as activity and keep the Supabase free-tier project from auto-pausing.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Supabase env vars are not configured." },
      { status: 500 }
    );
  }

  // Anonymous head-count on stores: RLS returns no rows, but the query still
  // reaches Postgres, which is what registers as activity.
  const supabase = createClient(url, key);
  const { error } = await supabase
    .from("stores")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
