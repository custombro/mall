export type ModeCategory = "제작" | "보관" | "자재" | "판매운영";

export type ModeRouteCard = {
  id: string;
  title: string;
  category: ModeCategory;
  href: string;
  eyebrow: string;
  summary: string;
  whenToUse: string;
  statusLine: string;
  tags: string[];
};

export const modeCategoryOptions: Array<ModeCategory> = [
  "제작",
  "보관",
  "자재",
  "판매운영",
];

export const modeRouteCards: ModeRouteCard[] = [
  {
    id: "route-keyring",
    title: "키링 작업대",
    category: "제작",
    href: "/workbench/keyring",
    eyebrow: "Workbench / Keyring",
    summary: "프리셋, 두께, 인쇄면, 링, 후가공, 수량을 조합하는 실제 작업 공간",
    whenToUse: "키링 주문을 새로 잡거나 판매형·행사형·프리미엄 구성을 바로 조합할 때",
    statusLine: "프리셋 + 수동 조합 + 예상 단가",
    tags: ["키링", "프리셋", "견적", "후가공"],
  },
  {
    id: "route-pop",
    title: "POP 스튜디오",
    category: "제작",
    href: "/pop-studio",
    eyebrow: "Workbench / POP",
    summary: "파트를 고르고 스냅 가능한 위치를 보며 구조를 판단하는 POP 작업면",
    whenToUse: "향수 POP, 전시 스탠드, 안내판 구조를 붙이기 전에 위치·보강을 판단할 때",
    statusLine: "스냅 가이드 + 파츠 배치 + 구조 판단",
    tags: ["POP", "스냅", "보강", "전시"],
  },
  {
    id: "route-storage",
    title: "보관함",
    category: "보관",
    href: "/storage",
    eyebrow: "Recall / Storage",
    summary: "끝난 작업을 쌓아두는 곳이 아니라 다시 꺼내 다음 작업으로 보내는 서랍형 허브",
    whenToUse: "반복 주문, 리오더, 검수 후 재사용, 운영중 샘플 재호출이 필요할 때",
    statusLine: "서랍형 재호출 + 상태 필터 + 다음 공간 연결",
    tags: ["리오더", "재호출", "보관", "검수"],
  },
  {
    id: "route-seller",
    title: "판매자 센터",
    category: "판매운영",
    href: "/seller",
    eyebrow: "Sales / Crew",
    summary: "입문·운영·확장 셀러 구조와 판매 상품 흐름을 단계별로 운영하는 공간",
    whenToUse: "크루 판매 상품을 고르거나 리오더·정산 감각·검수 흐름을 볼 때",
    statusLine: "등급 기반 판매 구조 + 상품 상태 + 운영 흐름",
    tags: ["셀러", "크루", "정산", "리오더"],
  },
  {
    id: "route-b2b",
    title: "B2B 허브",
    category: "판매운영",
    href: "/b2b",
    eyebrow: "Sales / Bulk",
    summary: "행사·기관·브랜드 대량 주문을 일반 주문과 분리해 수량·납기·자재를 먼저 판단하는 허브",
    whenToUse: "100개 이상 발주, 기관·브랜드 행사, 납기 중심 운영이 필요한 주문일 때",
    statusLine: "수량·납기 판정 + 프로젝트 큐 + 자재 연동",
    tags: ["대량", "기관", "브랜드", "납기"],
  },
  {
    id: "route-clearance",
    title: "재고 정리",
    category: "판매운영",
    href: "/clearance",
    eyebrow: "Sales / Clearance",
    summary: "남는 재고를 즉시판매·검수후판매·묶음정리·보류로 나눠 정규 흐름과 분리하는 공간",
    whenToUse: "행사 종료 재고, 샘플 잔량, 테스트 파츠, 보류 자재를 빠르게 소진해야 할 때",
    statusLine: "정리 상태 분리 + 잔량 소진 + 출처 추적",
    tags: ["클리어런스", "잔량", "소진", "묶음"],
  }
];

export function getCategoryClass(category: ModeCategory) {
  switch (category) {
    case "제작":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "보관":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    case "자재":
      return "border-violet-300/30 bg-violet-300/15 text-violet-100";
    default:
      return "border-amber-300/30 bg-amber-300/15 text-amber-100";
  }
}