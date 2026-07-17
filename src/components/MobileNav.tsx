"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Wrench,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "داشبۆرد", icon: LayoutDashboard },
  { href: "/queue", label: "ڕیز", icon: ListOrdered },
  { href: "/new-order", label: "نوێ", icon: PlusCircle, highlight: true },
  { href: "/customers", label: "کڕیار", icon: Users },
  { href: "/appointments", label: "کات", icon: Calendar },
  { href: "/services", label: "خزمەت", icon: Wrench },
  { href: "/reports", label: "ڕاپۆرت", icon: BarChart3 },
  { href: "/settings", label: "ڕێکخستن", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  const mobileItems = navItems.filter((item) =>
    ["/dashboard", "/queue", "/new-order", "/customers", "/appointments"].includes(item.href)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isHighlight = item.highlight;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition ${
                isHighlight
                  ? "-mt-5 rounded-full bg-brand-600 p-3 text-white shadow-lg shadow-brand-200"
                  : isActive
                  ? "text-brand-600"
                  : "text-gray-500"
              }`}
            >
              <Icon size={isHighlight ? 24 : 20} />
              {!isHighlight && (
                <span className="text-[10px] font-medium">{item.label}</span>
              )}
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
    <nav className="hidden md:flex md:w-64 md:flex-col md:border-l md:border-gray-200 md:bg-white md:p-4">
      <div className="mb-6 px-2">
        <h2 className="text-lg font-bold text-brand-700">غەسلی هەولێر</h2>
        <p className="text-xs text-gray-500">سیستەمی بەڕێوەبردن</p>
      </div>
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50"
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
