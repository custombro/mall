"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import routeDockItems from "./route-dock-config";

function isActive(pathname: string, href: string, matchStartsWith: string[] = []) {
  if (href === "/") return pathname === "/";
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  return matchStartsWith.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function RouteDock() {
  const pathname = usePathname() ?? "/";

  return (
    <nav aria-label="전역 이동" className="cb-route-dock">
      <div className="cb-route-dock__list">
        {routeDockItems.map((item) => {
          const active = isActive(pathname, item.href, item.matchStartsWith);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "cb-route-dock__item is-active" : "cb-route-dock__item"}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
