"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  ShoppingBag,
  Wallet,
  Boxes,
  BookOpen,
  BarChart3,
  Settings,
  Tags,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "سەرەکی", icon: LayoutDashboard },
  { href: "/products", label: "کاڵاکان", icon: Package },
  { href: "/categories", label: "پۆلەکان", icon: Tags },
  { href: "/customers", label: "کڕیاران", icon: Users },
  { href: "/suppliers", label: "دابینکەران", icon: Truck },
  { href: "/sales", label: "فرۆشتن", icon: ShoppingCart },
  { href: "/purchases", label: "کڕین", icon: ShoppingBag },
  { href: "/stock", label: "کۆگا", icon: Boxes },
  { href: "/expenses", label: "خەرجییەکان", icon: Wallet },
  { href: "/accounts", label: "حیسابات", icon: BookOpen },
  { href: "/reports", label: "ڕاپۆرتەکان", icon: BarChart3 },
  { href: "/settings", label: "ڕێکخستن", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Nav = (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-teal-600 text-white shadow-sm"
                : "text-ink-soft hover:bg-teal-50 hover:text-teal-700"
            }`}
          >
            <Icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="font-display text-xl font-bold text-teal-700">
          هەژمار
        </Link>
        <button
          type="button"
          className="btn-ghost !px-2.5 !py-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="مینیو"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)}>
          <aside
            className="absolute inset-y-0 right-0 w-72 bg-white shadow-xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[var(--line)] px-5 py-4">
              <p className="font-display text-2xl font-bold text-teal-700">هەژمار</p>
              <p className="text-xs text-ink-muted">ژمێریاری و کۆگا</p>
            </div>
            {Nav}
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 border-l border-[var(--line)] bg-white md:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-[var(--line)] px-5 py-5">
            <Link href="/dashboard" className="font-display text-2xl font-bold text-teal-700">
              هەژمار
            </Link>
            <p className="mt-1 text-xs text-ink-muted">سیستەمی ژمێریاری و کۆگا</p>
          </div>
          <div className="flex-1 overflow-y-auto">{Nav}</div>
        </div>
      </aside>
    </>
  );
}
