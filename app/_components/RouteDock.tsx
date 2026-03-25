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

  if (pathname === "/") {
    return null;
  }

  return (
    <nav aria-label="빠른 이동" className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
        {routeDockItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                  : "rounded-xl border border-transparent px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}