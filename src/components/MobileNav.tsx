"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Network,
  Briefcase,
  GitBranch,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "داشبۆرد", icon: LayoutDashboard },
  { href: "/employees", label: "کارمەند", icon: Users },
  { href: "/markets", label: "مارکێت", icon: Store },
  { href: "/structure", label: "هەیکەل", icon: Network },
  { href: "/positions", label: "پۆست", icon: Briefcase },
  { href: "/org-chart", label: "ڕێکخستن", icon: GitBranch },
  { href: "/settings", label: "ڕێکخستنەکان", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const mobileItems = navItems.filter((item) =>
    ["/dashboard", "/employees", "/markets", "/structure", "/org-chart"].includes(item.href)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-md safe-bottom md:hidden">
      <div className="flex items-center justify-around px-1 py-2">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 transition ${
                isActive ? "text-brand-700" : "text-slate-500"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex md:w-60 md:flex-col md:border-l md:border-slate-200 md:bg-white/80 md:p-4">
      <div className="mb-6 px-2">
        <h2 className="text-lg font-bold text-brand-800">هەیکەلی ئیداری</h2>
        <p className="text-xs text-slate-500">ڕێکخستنی کارمەندان</p>
      </div>
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
