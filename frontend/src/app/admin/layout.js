"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LogOut,
  PackagePlus,
  Gift,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { getStoredAuth } from "./adminApi";

const navItems = [
  { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/add-product", label: "Add Product", icon: PackagePlus },
  { href: "/admin/add-combo", label: "Create Combo", icon: Gift },
  { href: "/admin/manage", label: "Products", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/profile", label: "Profile", icon: User },
];

function getPageTitle(pathname) {
  const match = navItems.find((item) => item.href === pathname);
  return match?.label || "Admin";
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const { token, user } = getStoredAuth();

      if (!token || user?.role !== "admin") {
        router.replace("/login");
        return;
      }

      setAdmin(user);
      setChecking(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.replace("/login");
  };

  if (checking) {
    return (
      <section className="min-h-[60vh] bg-[#f7f5f0] px-4 py-10">
        <div className="mx-auto max-w-7xl rounded-lg border border-stone-200 bg-white p-6 text-sm font-semibold text-stone-600">
          Checking admin access...
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f7f5f0] text-stone-950">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
          <div className="mb-4 rounded-lg bg-stone-950 px-4 py-4 text-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200">
              <ShieldCheck size={15} />
              KIA Fashion
            </div>
            <div className="mt-2 text-lg font-black">Admin Console</div>
          </div>

          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-stone-950 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="mb-4 flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Database backed
              </p>
              <h1 className="mt-1 text-2xl font-black text-stone-950">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50"
              >
                Storefront
              </Link>
              <Link
                href="/admin/profile"
                className="hidden rounded-lg border border-stone-200 px-3 py-2 text-left text-xs font-semibold text-stone-600 hover:bg-stone-50 sm:block"
              >
                <span className="block text-[10px] uppercase tracking-widest text-stone-400">Signed in</span>
                <span className="block max-w-[190px] truncate">{admin?.email}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </header>

          {children}
        </div>
      </div>
    </section>
  );
}
