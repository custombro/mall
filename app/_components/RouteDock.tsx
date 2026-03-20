"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRouteDockKindClass, routeDockItems } from "./route-dock-config";

export default function RouteDock() {
  const pathname = usePathname();

  return (
    <div className="sticky bottom-4 z-40">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-3 shadow-2xl shadow-black/30 backdrop-blur">
        {routeDockItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:bg-white/10 ${getRouteDockKindClass(item.kind, active)}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}