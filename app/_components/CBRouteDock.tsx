"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DockItem = {
  href: string;
  label: string;
};

const dockItems: DockItem[] = [
  { href: "/", label: "홈" },
  { href: "/mode-select", label: "모드 선택" },
  { href: "/workbench/keyring", label: "키링 작업대" },
  { href: "/pop-studio", label: "POP 스튜디오" },
  { href: "/storage", label: "보관함" },
  { href: "/materials-room", label: "원자재 룸" },
  { href: "/parts-room", label: "부자재 룸" },
  { href: "/option-store", label: "옵션 스토어" },
  { href: "/seller", label: "판매자" },
  { href: "/b2b", label: "B2B" },
  { href: "/clearance", label: "재고 정리" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getLinkClass(active: boolean) {
  return active
    ? "rounded-2xl border border-cyan-300/40 bg-cyan-300/15 px-3 py-2 text-sm font-medium text-cyan-100"
    : "rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white";
}

export default function CBRouteDock() {
  const pathname = usePathname() ?? "/";

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              CB Mall Route Dock
            </p>
            <p className="text-sm text-slate-300">
              홈 허브와 분리된 제작/보관/자재/판매 동선을 언제든 바로 이동합니다.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            GitHub-first · Hub IA · Workbench · Storage
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {dockItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClass(active)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}