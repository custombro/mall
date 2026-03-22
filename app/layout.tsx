import type { Metadata } from "next";

import SiteHeader from "@/components/site-header";
import type { ReactNode } from "react";
import "./globals.css";
import CBRouteDock from "@/app/_components/CBRouteDock";
import Link from "next/link";
import PersistentHomeLogo from "./_components/PersistentHomeLogo";

export const metadata: Metadata = {
  title: "CustomBro Workshop Mall",
  description: "공방형 제작 운영 UI + 웹 조립툴",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>`r`n        <SiteHeader />
        <PersistentHomeLogo />
      <Link
        href="/"
        aria-label="홈으로 이동"
        className="fixed left-4 top-4 z-[120] flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 text-slate-900 shadow-lg shadow-slate-900/10 backdrop-blur transition hover:bg-white"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">CB</span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="text-sm font-semibold">CustomBro Shop</span>
          <span className="text-[11px] text-slate-500">홈으로 이동</span>
        </span>
      </Link><>
          <CBRouteDock />
          {children}
        </></body>
    </html>
  );
}