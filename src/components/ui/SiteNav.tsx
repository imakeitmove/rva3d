"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", aria: "Go to home" },
  { href: "/services", label: "Services", aria: "Go to services" },
  { href: "/work", label: "Work", aria: "Go to work" },
  { href: "/sandbox", label: "Sandbox", aria: "Go to sandbox" },
  { href: "/contact", label: "Contact", aria: "Go to contact" },
  { href: "/portal", label: "Portal", aria: "Go to portal" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 6,
        display: "flex",
        gap: 8,
        alignItems: "center",
        background: "rgba(0,0,0,0.45)",
        padding: "8px 10px",
        borderRadius: 999,
        backdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-label={link.aria}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              color: "#f5f5f5",
              textDecoration: "none",
              fontSize: 14,
              border: active
                ? "1px solid rgba(96,165,250,0.8)"
                : "1px solid transparent",
              background: active ? "rgba(96,165,250,0.2)" : "transparent",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.5)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
