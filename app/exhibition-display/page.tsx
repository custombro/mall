import type { Metadata } from "next";
import SalesLanding from "../_components/SalesLanding";
import { STUDIO_LINKS } from "../../lib/studio-links";

export const metadata: Metadata = {
  title: "박람회·팝업 아크릴 진열대 제작 | 커스텀브로",
  description: "박람회·팝업·매장용 아크릴 진열대. 제품 배치, 브랜드 안내판, QR·POP 요소와 운반·조립 조건을 함께 검토합니다.",
  alternates: { canonical: "https://mall.custombro.org/exhibition-display" },
};

export default function ExhibitionDisplayPage() {
  return <SalesLanding
    eyebrow="CUSTOMBRO · EXHIBITION DISPLAY"
    title={<>박람회 현장에서<br/>제품이 먼저 보이게.</>}
    lead="제품을 세우는 받침뿐 아니라 브랜드 메시지, 안내판, 기둥, QR·POP 요소까지 한 구조 안에서 검토합니다."
    primaryHref={STUDIO_LINKS.display}
    primaryLabel="전시 진열대 구성하기"
    secondaryHref={STUDIO_LINKS.consultation}
    secondaryLabel="행사 조건으로 상담 시작"
    points={[
      { title: "현장 조건", body: "테이블 크기, 진열 제품 수, 행사 일정과 이동·운반 조건을 함께 받습니다." },
      { title: "브랜드 포인트", body: "배면판, 포인트 안내판, 기둥, 로고·문구 인쇄 위치를 조합할 수 있습니다." },
      { title: "조립 구조", body: "판과 판의 결합, 타공·끼움·접착 관계와 바닥까지 이어지는 지지 경로를 검토합니다." },
      { title: "복수 소재", body: "부품별 색상과 소재가 달라질수록 자재·공정 복잡도를 예상가격에 반영합니다." },
      { title: "재주문", body: "승인된 기존 사양은 다음 행사에서 수량·문구·교체판만 바꿔 재검토할 수 있습니다." },
      { title: "제작 상담", body: "고객이 구조를 완성하지 못해도 필요한 치수와 파일을 정리하고 제작 검토 단계까지 안내합니다." },
    ]}
    faqs={[
      { question: "전시용 진열대에 안내판이나 QR·POP 요소를 넣을 수 있나요?", answer: "브랜드 안내판·인쇄 위치·POP 요소를 포함한 구성을 검토할 수 있습니다. 실제 제작 방식은 구조와 크기에 따라 확인합니다." },
      { question: "행사 날짜에 맞춰 납기를 보장하나요?", answer: "아닙니다. 행사 일정과 사양을 상담 시 함께 확인하되 제작 가능 여부와 확정 납기는 검토 후 안내합니다." },
      { question: "처음부터 완성된 도면이 필요하나요?", answer: "도면이 없어도 제품 치수, 진열 개수, 현장 조건을 기준으로 설계와 상담을 시작할 수 있습니다." },
    ]}
    relatedLinks={[
      { label: "화장품 아크릴 진열대", href: "/cosmetic-display" },
      { label: "아크릴 키링", href: "/acrylic-keyring" },
    ]}
    note="확정 납기와 제작 가능 여부는 행사 일정과 실제 사양을 확인한 뒤 결정합니다."
  />;
}
