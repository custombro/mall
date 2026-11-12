import type { Metadata } from "next";
import Link from "next/link";
import RouteDock from "./_components/RouteDock";
import "./globals.css";
import "./home-v2.css";

export const metadata: Metadata = {
  title: "커스텀브로 | 아크릴 키링·미니 진열대",
  description: "키링의 모양과 앞뒤 디자인, 화장품 미니 진열대의 구조를 직접 정하고 예상 제작비와 제작 상담을 이어가는 커스텀브로입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="cb-shell-body">
        <div className="cb-app-shell">
          <header className="cb-shell-header">
            <div className="cb-shell-header__inner">
              <Link href="/" className="cb-shell-brand">
                <span className="cb-shell-brand__mark">CB</span>
                <span>
                  <strong>CUSTOMBRO</strong>
                  <small>Acrylic Studio</small>
                </span>
              </Link>
            </div>
            <RouteDock />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
