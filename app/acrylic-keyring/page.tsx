import type { Metadata } from "next";
import SalesLanding from "../_components/SalesLanding";
import { STUDIO_LINKS } from "../../lib/studio-links";

export const metadata: Metadata = {
  title: "커스텀 아크릴 키링 제작 | 자유도형·양면·라미 | 커스텀브로",
  description: "원형·사각·자유도형 아크릴 키링. 타공 위치, 앞뒤 디자인, 기본형과 1.5T+1.5T 라미아크릴을 직접 설정하고 예상 제작비를 확인하세요.",
  alternates: { canonical: "https://mall.custombro.org/acrylic-keyring" },
};

export default function AcrylicKeyringPage() {
  return <SalesLanding
    eyebrow="CUSTOMBRO · ACRYLIC KEYRING"
    title={<>아크릴 키링을<br/>원하는 모양부터 직접.</>}
    lead="도면이 없어도 시작할 수 있습니다. 모양·크기·타공 위치·앞뒤 디자인을 정하고 3D로 확인한 뒤 제작 검토를 요청하세요."
    primaryHref={STUDIO_LINKS.keyring}
    primaryLabel="키링 직접 만들기"
    secondaryHref={STUDIO_LINKS.support}
    secondaryLabel="디자인 도움 요청"
    points={[
      { title: "모양", body: "원형·사각·둥근 사각·자유도형을 선택하고, 자유도형은 점과 곡선을 직접 편집합니다." },
      { title: "타공", body: "키링 구멍의 지름과 위치를 조절하고 외곽 침범 여부를 제작 요청 전에 확인합니다." },
      { title: "앞·뒤 인쇄", body: "앞면과 뒷면 디자인을 따로 배치해 양면 시안을 만들 수 있습니다." },
      { title: "라미아크릴", body: "투명 1.5T + 1.5T, 총 3mm 구조를 선택하고 두 판 사이 인쇄 구성을 3D로 확인합니다." },
      { title: "수량별 예상가", body: "동일 디자인 수량이 늘어나면 반복 작업 효율을 반영한 계획용 공급가를 비교합니다." },
      { title: "제작 검토", body: "최종 외곽·타공·인쇄 위치는 제작 요청과 함께 저장하며 일반 고객에게 제작 도면은 제공하지 않습니다." },
    ]}
    note="자유도형의 곡선 손잡이와 타공은 실제 제작 데이터와 같은 외곽 정보를 사용하도록 연결됩니다."
  />;
}
