export type OptionCategory = "후가공" | "포장" | "결합옵션" | "전시옵션" | "프리미엄";

export type OptionItem = {
  id: string;
  title: string;
  category: OptionCategory;
  code: string;
  priceDelta: number;
  status: "안정" | "주의" | "부족";
  summary: string;
  note: string;
  recommendedRoute: string;
};

export type OptionGroup = {
  id: string;
  title: string;
  subtitle: string;
  toneClass: string;
  items: OptionItem[];
};

export const optionCategoryOptions: OptionCategory[] = [
  "후가공",
  "포장",
  "결합옵션",
  "전시옵션",
  "프리미엄",
];

export const optionGroups: OptionGroup[] = [
  {
    id: "group-a",
    title: "후가공 옵션 선반",
    subtitle: "표면 마감과 색감 보정 계열",
    toneClass: "rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4",
    items: [
      {
        id: "opt-a1",
        title: "에폭시 마감",
        category: "후가공",
        code: "FG-01",
        priceDelta: 600,
        status: "안정",
        summary: "표면 광택과 프리미엄 느낌을 강화",
        note: "판매형 키링이나 고급 샘플에 자주 사용",
        recommendedRoute: "/workbench/keyring",
      },
      {
        id: "opt-a2",
        title: "글리터 포인트",
        category: "후가공",
        code: "FG-02",
        priceDelta: 450,
        status: "안정",
        summary: "반짝임 포인트를 주는 후가공",
        note: "캐릭터/팬굿즈 계열에 적합",
        recommendedRoute: "/workbench/keyring",
      },
      {
        id: "opt-a3",
        title: "화이트 베이스 강화",
        category: "후가공",
        code: "FG-03",
        priceDelta: 300,
        status: "주의",
        summary: "색감 유지가 필요한 인쇄 보강",
        note: "문구 POP나 색상 강조형 작업에 자주 연결",
        recommendedRoute: "/pop-studio",
      },
    ],
  },
  {
    id: "group-b",
    title: "포장 / 결합 옵션 선반",
    subtitle: "포장재와 탈부착/결합 구조 옵션",
    toneClass: "rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4",
    items: [
      {
        id: "opt-b1",
        title: "개별 OPP 포장",
        category: "포장",
        code: "PK-01",
        priceDelta: 250,
        status: "안정",
        summary: "판매용 또는 개별 납품용 기본 포장",
        note: "키링, 행사 굿즈, 샘플 포장에 폭넓게 사용",
        recommendedRoute: "/b2b",
      },
      {
        id: "opt-b2",
        title: "자석 결합 업그레이드",
        category: "결합옵션",
        code: "CP-01",
        priceDelta: 900,
        status: "주의",
        summary: "탈부착형 구조로 업그레이드",
        note: "옵션 스토어와 파츠룸을 함께 확인해야 안정적",
        recommendedRoute: "/parts-room",
      },
      {
        id: "opt-b3",
        title: "교정 샘플 1회",
        category: "프리미엄",
        code: "PM-01",
        priceDelta: 1500,
        status: "안정",
        summary: "색상/배치 확인용 선행 샘플",
        note: "반복 발주 전 검증용으로 적합",
        recommendedRoute: "/storage",
      },
    ],
  },
  {
    id: "group-c",
    title: "전시 / 프리미엄 옵션 선반",
    subtitle: "POP/전시/고급 판매 구조를 위한 옵션",
    toneClass: "rounded-3xl border border-violet-300/15 bg-violet-300/10 p-4",
    items: [
      {
        id: "opt-c1",
        title: "소형 전시 받침 추가",
        category: "전시옵션",
        code: "DS-01",
        priceDelta: 700,
        status: "주의",
        summary: "전시 안정성을 높이는 추가 받침",
        note: "POP 스튜디오와 같이 판단해야 하는 전시용 옵션",
        recommendedRoute: "/pop-studio",
      },
      {
        id: "opt-c2",
        title: "프리미엄 카드 패키지",
        category: "프리미엄",
        code: "PM-02",
        priceDelta: 1200,
        status: "부족",
        summary: "판매용 고급 포장 카드 세트",
        note: "재고 부족 구간이라 선택 전 확인 필요",
        recommendedRoute: "/seller",
      },
    ],
  },
];

export function getStatusClass(status: OptionItem["status"]) {
  switch (status) {
    case "안정":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    case "주의":
      return "border-amber-300/30 bg-amber-300/15 text-amber-100";
    default:
      return "border-rose-300/30 bg-rose-300/15 text-rose-100";
  }
}

export function getRouteLabel(href: string) {
  const map: Record<string, string> = {
    "/workbench/keyring": "키링 작업대",
    "/pop-studio": "POP 스튜디오",
    "/parts-room": "부자재 룸",
    "/storage": "보관함",
    "/b2b": "B2B 허브",
    "/seller": "판매자 센터",
  };

  return map[href] ?? href;
}