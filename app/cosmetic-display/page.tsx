import type { Metadata } from "next";
import SalesLanding from "../_components/SalesLanding";
import { STUDIO_LINKS } from "../../lib/studio-links";

export const metadata: Metadata = {
  title: "화장품 아크릴 진열대 제작 | 앰플·세럼 미니 진열대 | 커스텀브로",
  description: "화장품 용기 크기와 수량에 맞춘 미니 아크릴 진열대. 구조·소재·인쇄·제품 위치를 3D로 확인하고 제작 검토를 요청하세요.",
  alternates: { canonical: "https://mall.custombro.org/cosmetic-display" },
};

export default function CosmeticDisplayPage() {
  return <SalesLanding
    eyebrow="CUSTOMBRO · COSMETIC DISPLAY"
    title={<>화장품 한 병부터<br/>브랜드 라인업까지.</>}
    lead="앰플·세럼·크림 등 제품 크기와 진열 수량을 기준으로 받침, 타공판, 배면판과 인쇄 위치를 구성합니다."
    primaryHref={STUDIO_LINKS.display}
    primaryLabel="진열대 직접 디자인"
    secondaryHref={STUDIO_LINKS.consultation}
    secondaryLabel="제품 정보로 상담 시작"
    points={[
      { title: "제품 맞춤", body: "용기의 지름 또는 가로·세로, 높이와 진열 개수를 기준으로 구조를 검토합니다." },
      { title: "3D 미리보기", body: "마우스로 회전·확대하며 판 두께, 타공 위치, 배면판과 제품 배치를 확인합니다." },
      { title: "소재 선택", body: "투명·진백·미러·컬러·무광 등 부품별 소재 선택을 지원합니다." },
      { title: "인쇄 방식", body: "투명 유광은 배면 인쇄를 선택할 수 있고, 그 외 소재는 전면 인쇄 기준으로 안내합니다." },
      { title: "수량별 견적", body: "동일 디자인 반복 제작은 준비비 분산과 작업 효율을 반영해 예상 단가를 비교합니다." },
      { title: "제작 전 검토", body: "실물 치수, 끼움 여유, 안정성, 접착·절곡 조건은 제작 전에 확정합니다." },
    ]}
    note="화면의 기본 치수는 설계 시작값이며 실제 제품 실측과 제작 공정을 확인한 뒤 최종 사양을 확정합니다."
  />;
}
