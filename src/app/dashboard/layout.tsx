import { requireStore } from "@/lib/store";
import SideNav from "@/components/dashboard/SideNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { store, user } = await requireStore();

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <SideNav storeName={store.name} email={user.email ?? ""} />
      <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
