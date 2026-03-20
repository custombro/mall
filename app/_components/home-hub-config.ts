export type HomeRouteKind = "제작" | "보관" | "자재" | "판매운영";

export type HomeQuickRoute = {
  id: string;
  title: string;
  href: string;
  kind: HomeRouteKind;
  eyebrow: string;
  summary: string;
  note: string;
};

export const homeQuickRoutes: HomeQuickRoute[] = [
  {
    id: "quick-mode-select",
    title: "모드 선택으로 시작",
    href: "/mode-select",
    kind: "제작",
    eyebrow: "Primary Gateway",
    summary: "지금 해야 할 일을 먼저 분기해서 정확한 공간으로 들어가는 메인 진입점",
    note: "홈은 설명보다 진입 허브 역할만 담당",
  },
  {
    id: "quick-keyring",
    title: "키링 작업대",
    href: "/workbench/keyring",
    kind: "제작",
    eyebrow: "Workbench",
    summary: "프리셋·두께·링·후가공·수량을 바로 조합하는 제작 공간",
    note: "새 키링 주문과 판매형 구성 시작점",
  },
  {
    id: "quick-pop",
    title: "POP 스튜디오",
    href: "/pop-studio",
    kind: "제작",
    eyebrow: "Snap Guide",
    summary: "붙일 수 있는 위치와 보강 구조를 스냅 가이드로 판단하는 작업면",
    note: "전시·안내판·향수 POP 판단용",
  },
  {
    id: "quick-storage",
    title: "보관함",
    href: "/storage",
    kind: "보관",
    eyebrow: "Recall Drawer",
    summary: "끝난 작업을 다시 꺼내 리오더와 재사용으로 연결하는 허브",
    note: "반복 주문과 재호출 중심",
  },
  {
    id: "quick-materials",
    title: "원자재 룸",
    href: "/materials-room",
    kind: "자재",
    eyebrow: "Metal Rack",
    summary: "금속 랙 기반으로 원장 두께·재질·재고 상태를 먼저 확인하는 공간",
    note: "3T·5T·2.7T·특수판 판단",
  },
  {
    id: "quick-parts",
    title: "부자재 룸",
    href: "/parts-room",
    kind: "자재",
    eyebrow: "Parts Wall",
    summary: "링·체인·자석·스탠드·보강 파츠를 분리해서 조합 판단",
    note: "체결 방식과 보강 파츠 판단용",
  },
  {
    id: "quick-option",
    title: "옵션 스토어",
    href: "/option-store",
    kind: "자재",
    eyebrow: "Split Choice",
    summary: "후가공·포장·결합·프리미엄 옵션을 본체와 분리해서 선택하는 공간",
    note: "옵션은 본체 화면과 분리",
  },
  {
    id: "quick-seller",
    title: "판매자 센터",
    href: "/seller",
    kind: "판매운영",
    eyebrow: "Crew Sales",
    summary: "입문·운영·확장 셀러 구조와 판매 상품 흐름을 운영하는 허브",
    note: "크루 판매와 리오더 판단",
  },
  {
    id: "quick-b2b",
    title: "B2B 허브",
    href: "/b2b",
    kind: "판매운영",
    eyebrow: "Bulk Orders",
    summary: "행사·기관·브랜드 주문을 일반 주문과 분리해 수량·납기·자재를 먼저 판정",
    note: "대량 주문 운영용",
  },
  {
    id: "quick-clearance",
    title: "재고 정리",
    href: "/clearance",
    kind: "판매운영",
    eyebrow: "Leftover Flow",
    summary: "행사 종료 재고·샘플 잔량·보류 자재를 일반 제작 흐름과 분리해 소진",
    note: "즉시판매·검수후판매·묶음정리",
  },
];

export function getHomeRouteKindClass(kind: HomeRouteKind) {
  switch (kind) {
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