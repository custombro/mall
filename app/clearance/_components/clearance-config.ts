export type ClearanceStatus = "즉시판매" | "검수후판매" | "묶음정리" | "보류";

export type ClearanceItem = {
  id: string;
  title: string;
  category: string;
  status: ClearanceStatus;
  stockCount: number;
  packageType: string;
  priceHint: string;
  summary: string;
  note: string;
  sourceRoute: string;
  recommendedRoute: string;
};

export type ClearanceShelf = {
  id: string;
  title: string;
  subtitle: string;
  toneClass: string;
  items: ClearanceItem[];
};

export const clearanceStatusOptions: ClearanceStatus[] = [
  "즉시판매",
  "검수후판매",
  "묶음정리",
  "보류",
];

export const clearanceShelves: ClearanceShelf[] = [
  {
    id: "shelf-a",
    title: "즉시 판매 선반",
    subtitle: "정규 제작 흐름에서 분리되어 바로 소진 가능한 재고",
    toneClass: "rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4",
    items: [
      {
        id: "cl-a1",
        title: "행사 종료 키링 잔량",
        category: "키링",
        status: "즉시판매",
        stockCount: 37,
        packageType: "벌크 / 기본 OPP 혼합",
        priceHint: "빠른 소진가 적용",
        summary: "행사 종료 후 남은 기본 키링 재고",
        note: "정규 작업과 분리해 빠르게 소진하는 게 우선",
        sourceRoute: "/storage",
        recommendedRoute: "/seller",
      },
      {
        id: "cl-a2",
        title: "샘플용 에폭시 키링",
        category: "프리미엄 샘플",
        status: "검수후판매",
        stockCount: 12,
        packageType: "개별 포장",
        priceHint: "샘플 특가 / 묶음 판매 가능",
        summary: "고급 마감 샘플이지만 소량 검수 필요",
        note: "옵션 스토어와 패키지 구성을 같이 보며 판매 전환",
        sourceRoute: "/option-store",
        recommendedRoute: "/seller",
      },
    ],
  },
  {
    id: "shelf-b",
    title: "묶음 정리 선반",
    subtitle: "섞여 있는 재고를 세트화해서 정리하는 구역",
    toneClass: "rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4",
    items: [
      {
        id: "cl-b1",
        title: "POP 테스트 파츠 세트",
        category: "POP",
        status: "묶음정리",
        stockCount: 9,
        packageType: "혼합 파츠 묶음",
        priceHint: "세트 단위 소진",
        summary: "POP 테스트판과 보강 파츠가 섞여 있는 재고",
        note: "단품보다 묶음 구성으로 처리하는 편이 효율적",
        sourceRoute: "/pop-studio",
        recommendedRoute: "/parts-room",
      },
      {
        id: "cl-b2",
        title: "형광 아크릴 샘플 묶음",
        category: "원자재 샘플",
        status: "묶음정리",
        stockCount: 6,
        packageType: "샘플팩",
        priceHint: "테스트팩 가격 적용",
        summary: "형광/특수판 잔량을 샘플 묶음으로 전환",
        note: "원자재 룸 기준으로 잔량을 테스트팩 형태로 분리",
        sourceRoute: "/materials-room",
        recommendedRoute: "/option-store",
      },
    ],
  },
  {
    id: "shelf-c",
    title: "보류 / 재판정 선반",
    subtitle: "상태 확인 후 판매 여부를 다시 정해야 하는 재고",
    toneClass: "rounded-3xl border border-violet-300/15 bg-violet-300/10 p-4",
    items: [
      {
        id: "cl-c1",
        title: "프리미엄 카드 패키지 잔량",
        category: "패키지",
        status: "보류",
        stockCount: 18,
        packageType: "패키지 자재",
        priceHint: "단독 판매보다 결합 판매 권장",
        summary: "프리미엄 패키지 잔량이 남은 상태",
        note: "판매자 센터와 옵션 스토어 기준으로 재결합 판단 필요",
        sourceRoute: "/seller",
        recommendedRoute: "/option-store",
      },
      {
        id: "cl-c2",
        title: "검수 대기 전시 받침",
        category: "전시 옵션",
        status: "검수후판매",
        stockCount: 7,
        packageType: "개별 포장 미완료",
        priceHint: "검수 후 소량 판매 가능",
        summary: "전시용 받침이지만 상태 확인 전 판매 보류",
        note: "POP 구조 호환성과 스크래치 여부 확인 필요",
        sourceRoute: "/parts-room",
        recommendedRoute: "/pop-studio",
      },
    ],
  },
];

export function getStatusClass(status: ClearanceStatus) {
  switch (status) {
    case "즉시판매":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    case "검수후판매":
      return "border-amber-300/30 bg-amber-300/15 text-amber-100";
    case "묶음정리":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    default:
      return "border-violet-300/30 bg-violet-300/15 text-violet-100";
  }
}

export function getRouteLabel(href: string) {
  const map: Record<string, string> = {
    "/seller": "판매자 센터",
    "/option-store": "옵션 스토어",
    "/parts-room": "부자재 룸",
    "/pop-studio": "POP 스튜디오",
    "/materials-room": "원자재 룸",
    "/storage": "보관함",
  };
  return map[href] ?? href;
}