import type { Metadata } from "next";
import DisplayClient from "./DisplayClient";

const title = "화장품 미니 진열대 맞춤 제작 | 커스텀브로";
const description = "한 병을 위한 앰플 꽂이부터 브랜드 라인업·박람회·팝업용 아크릴 진열대까지. 제품 크기와 수량을 알려주시면 구조, 소재, 인쇄를 함께 검토합니다.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://mall.custombro.org/display" },
  openGraph: { title, description, url: "https://mall.custombro.org/display", siteName: "CUSTOMBRO", locale: "ko_KR", type: "website", images: [{ url: "https://mall.custombro.org/display-og.svg", width: 1200, height: 630, alt: "커스텀브로 화장품 미니 진열대 구성 예시" }] },
  twitter: { card: "summary_large_image", title, description, images: ["https://mall.custombro.org/display-og.svg"] },
};

export default function DisplayPage() {
  return <DisplayClient />;
}
