// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getUser } from "@/lib/auth";
import type { AuthUser } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/projects", label: "Projects", exact: false },
  { href: "/dashboard/analytics", label: "Analytics", exact: false },
  { href: "/dashboard/settings", label: "Settings", exact: false },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="h-7 w-7 shrink-0 rounded-lg bg-indigo-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">CollabPlatform</p>
          <p className="text-[11px] text-slate-400">Freelancer dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href, item.exact)
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
            {user?.name ? user.name[0].toUpperCase() : "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">{user?.name || "…"}</p>
            <p className="truncate text-[11px] text-slate-400">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-rose-600"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
