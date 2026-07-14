import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Store } from "./types";

/**
 * Server-side guard for dashboard pages: requires a signed-in user with at
 * least one store, or redirects to the right step.
 */
export async function requireStore() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: store } = await supabase
    .from("stores")
    .select()
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Store>();
  if (!store) redirect("/onboarding");

  return { supabase, user, store };
}
