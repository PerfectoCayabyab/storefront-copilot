"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Package,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: MessageSquareText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function SideNav({
  storeName,
  email,
}: {
  storeName: string;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="flex w-full flex-col border-b border-line bg-surface lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 px-6 py-5 font-semibold">
        <Bot className="h-6 w-6 text-accent" aria-hidden />
        Storefront Copilot
      </div>

      <div className="px-6 pb-4">
        <p className="truncate text-sm font-medium">{storeName}</p>
        <p className="truncate text-xs text-muted">{email}</p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pb-0">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-line p-3 lg:block">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}
