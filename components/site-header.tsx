import Link from "next/link";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/workbench/keyring", label: "제작" },
  { href: "/storage", label: "서랍" },
  { href: "/orders", label: "주문" },
  { href: "/order-check", label: "주문확인" },
  { href: "/my", label: "내정보" },
] as const;

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200">
              CB Mall
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-white">작업 허브</p>
              <p className="text-xs text-zinc-400">Home / Workbench / Drawer / Orders</p>
            </div>
          </div>
        </Link>

        <nav className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-cyan-300/40 hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}