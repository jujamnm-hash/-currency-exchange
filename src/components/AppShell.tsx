"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  PlusCircle,
  ScrollText,
  Settings,
  BookOpen,
} from "lucide-react";

const links = [
  { href: "/dashboard/", label: "سەرەکی", icon: Home },
  { href: "/people/", label: "کەسەکان", icon: Users },
  { href: "/new-debt/", label: "قەرزی نوێ", icon: PlusCircle },
  { href: "/debts/", label: "قەرزەکان", icon: ScrollText },
  { href: "/settings/", label: "ڕێکخستن", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard/") return pathname === "/dashboard" || pathname === "/dashboard/";
  return pathname.startsWith(href.replace(/\/$/, ""));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="side-nav" aria-label="سەرەکی">
        <div className="side-brand">
          <BookOpen className="side-brand-icon" strokeWidth={1.75} />
          <div>
            <p className="side-brand-name">قەرزنامە</p>
            <p className="side-brand-sub">تۆماری قەرز</p>
          </div>
        </div>
        <nav className="side-links">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`side-link ${isActive(pathname, href) ? "active" : ""}`}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <p className="side-footer">داتا لەسەر ئایپادەکەت دەمێنێتەوە</p>
      </aside>

      <div className="main-column">
        <header className="top-bar">
          <div className="top-brand">
            <BookOpen size={22} strokeWidth={1.75} />
            <span>قەرزنامە</span>
          </div>
        </header>
        <main className="page-main">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="گەڕان">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`bottom-link ${isActive(pathname, href) ? "active" : ""}`}
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
