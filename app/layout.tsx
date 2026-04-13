import type { Metadata } from "next";
import Link from "next/link";
import RouteDock from "./_components/RouteDock";
import "./globals.css";


export const metadata: Metadata = {
  title: "CB Mall",
  description: "CustomBro workbench commerce hub",
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
                  <small>Workbench Mall</small>
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
