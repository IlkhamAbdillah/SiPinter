"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▣" },
  { href: "/upload", label: "Upload", icon: "↑" },
  { href: "/review", label: "Review", icon: "☰" },
  { href: "/penilaian", label: "Penilaian", icon: "✓" },
  { href: "/rekapitulasi", label: "Rekapitulasi", icon: "▦" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="logo">S</span>
        <span>SiPinter</span>
      </div>

      <nav className="nav">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "active" : ""}
            >
              <span aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="user">
        <span className="avatar">M</span>
        <span className="u-text">
          <strong>Monica Adelia</strong>
          <br />
          <span className="meta">Dosen pengampu</span>
        </span>
      </div>
    </aside>
  );
}
