import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CB Mall",
  description: "CustomBro workbench commerce hub",
};

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/workbench", label: "제작" },
  { href: "/storage", label: "서랍" },
  { href: "/orders", label: "주문" },
  { href: "/order-check", label: "주문확인" },
  { href: "/my", label: "내정보" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#090b10] text-white">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090b10]/90 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-bold text-cyan-200">
                  CB
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">CUSTOMBRO</p>
                  <p className="text-sm font-semibold text-white">Workbench Mall</p>
                </div>
              </Link>

              <nav className="hidden items-center gap-2 lg:flex">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/workbench/keyring"
                  className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  작업 시작
                </Link>
              </div>
            </div>

            <div className="border-t border-white/5 lg:hidden">
              <div className="mx-auto grid w-full max-w-7xl grid-cols-3 gap-2 px-5 py-3 md:grid-cols-6 md:px-8">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-white/10 px-3 py-2 text-center text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}