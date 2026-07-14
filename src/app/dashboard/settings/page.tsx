import type { Metadata } from "next";
import { requireStore } from "@/lib/store";
import SettingsForm from "@/components/dashboard/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { store } = await requireStore();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Store details and AI index maintenance.
      </p>
      <SettingsForm store={store} />
    </div>
  );
}
