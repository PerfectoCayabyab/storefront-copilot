import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "@/components/OnboardingForm";

export const metadata: Metadata = { title: "Create your store" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Users with a store skip onboarding.
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (store) redirect("/dashboard");

  return <OnboardingForm />;
}
