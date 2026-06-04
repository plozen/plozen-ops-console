"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/", match: "/" },
  { label: "Service", href: "/services", match: "/services" },
  { label: "Automation", href: "#" },
  { label: "Logs", href: "#" },
  { label: "VectorDB", href: "/knowledge", match: "/knowledge" },
];

function isActive(pathname, item) {
  if (!item.match) return false;
  return item.match === "/" ? pathname === "/" : pathname.startsWith(item.match);
}

export default function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <main className="app-shell" aria-labelledby="page-title">
      <aside className="sidebar" aria-label="운영 메뉴">
        <Link className="brand" href="/" aria-label="PLOZEN Ops Console dashboard">
          <span>P</span>
          <strong>PLOZEN Ops Console</strong>
          <em>시스템 관리자</em>
        </Link>
        <nav className="nav" aria-label="페이지 이동">
          {navItems.map((item) =>
            item.href === "#" ? (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ) : (
              <Link key={item.label} className={isActive(pathname, item) ? "is-active" : ""} href={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </aside>
      <section className="content">{children}</section>
    </main>
  );
}
