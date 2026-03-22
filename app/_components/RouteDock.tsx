"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import routeDockItems from "./route-dock-config";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/mode-select") {
    return pathname === "/mode-select" || pathname.startsWith("/workbench");
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default function RouteDock() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Route dock"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {routeDockItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={[
              "flex min-h-[56px] items-center justify-center rounded-2xl border text-sm font-semibold transition",
              active
                ? "border-indigo-300 bg-indigo-500 text-white shadow-lg"
                : "border-slate-200 bg-slate-950 text-white hover:border-slate-400 hover:bg-slate-900",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}