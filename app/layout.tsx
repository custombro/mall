import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import CBRouteDock from "@/app/_components/CBRouteDock";

export const metadata: Metadata = {
  title: "CustomBro Workshop Mall",
  description: "공방형 제작 운영 UI + 웹 조립툴",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body><>
          <CBRouteDock />
          {children}
        </></body>
    </html>
  );
}