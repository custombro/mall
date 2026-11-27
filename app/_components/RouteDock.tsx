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
    <nav aria-label="주요 이동" className="cb-route-dock">
      <div className="cb-route-dock__list">
        {routeDockItems.map((item) => {
          const active = isActive(pathname, item.href, item.matchStartsWith);
          const className = active ? "cb-route-dock__item is-active" : "cb-route-dock__item";
          // Cloudflare Pages Function owns this route, not the Next.js router.
          // Use a real document navigation instead of client-side RSC prefetch.
          return item.href.startsWith("/studio-entry?") ? (
            <a key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={className}>
              {item.label}
            </a>
          ) : (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={className}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
