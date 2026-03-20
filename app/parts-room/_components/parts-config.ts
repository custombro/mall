export type PartCategory = "링" | "체인" | "스탠드" | "자석" | "보조파츠";

export type PartItem = {
  id: string;
  title: string;
  category: PartCategory;
  binCode: string;
  finish: string;
  stockCount: number;
  status: "안정" | "주의" | "부족";
  compatibleProducts: string[];
  note: string;
  recommendedRoute: string;
};

export type PartWall = {
  id: string;
  title: string;
  subtitle: string;
  toneClass: string;
  parts: PartItem[];
};

export const partCategoryOptions: PartCategory[] = [
  "링",
  "체인",
  "스탠드",
  "자석",
  "보조파츠",
];

export const partWalls: PartWall[] = [
  {
    id: "wall-a",
    title: "전면 파츠 월 A",
    subtitle: "키링 기본 파츠와 체결 부품 구역",
    toneClass: "rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4",
    parts: [
      {
        id: "part-a1",
        title: "실버 기본 링",
        category: "링",
        binCode: "A-01",
        finish: "실버",
        stockCount: 420,
        status: "안정",
        compatibleProducts: ["키링", "기본 굿즈"],
        note: "가장 자주 쓰는 기본 링. 키링 작업대와 직결",
        recommendedRoute: "/workbench/keyring",
      },
      {
        id: "part-a2",
        title: "골드 프리미엄 링",
        category: "링",
        binCode: "A-02",
        finish: "골드",
        stockCount: 95,
        status: "주의",
        compatibleProducts: ["고급 키링", "판매 샘플"],
        note: "프리미엄 구성용. 판매형 키링 옵션과 함께 자주 선택",
        recommendedRoute: "/option-store",
      },
      {
        id: "part-a3",
        title: "볼체인 세트",
        category: "체인",
        binCode: "A-03",
        finish: "실버",
        stockCount: 260,
        status: "안정",
        compatibleProducts: ["행사 배포", "경량 키링"],
        note: "대량 행사/배포형에 자주 사용",
        recommendedRoute: "/b2b",
      },
    ],
  },
  {
    id: "wall-b",
    title: "중앙 파츠 월 B",
    subtitle: "POP/스탠드/보강 관련 파츠 구역",
    toneClass: "rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4",
    parts: [
      {
        id: "part-b1",
        title: "소형 아크릴 스탠드 발",
        category: "스탠드",
        binCode: "B-01",
        finish: "투명",
        stockCount: 60,
        status: "주의",
        compatibleProducts: ["POP", "전시 스탠드"],
        note: "POP 스튜디오와 함께 확인해야 하는 기본 스탠드 발",
        recommendedRoute: "/pop-studio",
      },
      {
        id: "part-b2",
        title: "자석 결합 세트",
        category: "자석",
        binCode: "B-02",
        finish: "메탈",
        stockCount: 38,
        status: "주의",
        compatibleProducts: ["옵션 결합", "교체형 구조"],
        note: "탈부착형 구조나 옵션 교체형 제품에 사용",
        recommendedRoute: "/option-store",
      },
      {
        id: "part-b3",
        title: "보강 연결 브릿지",
        category: "보조파츠",
        binCode: "B-03",
        finish: "투명",
        stockCount: 18,
        status: "부족",
        compatibleProducts: ["향수 POP", "하중 구조"],
        note: "하중 보강용 파츠라 POP 작업 전 재고 확인 필요",
        recommendedRoute: "/pop-studio",
      },
    ],
  },
  {
    id: "wall-c",
    title: "후면 파츠 월 C",
    subtitle: "보관함 재호출 및 운영용 보조 파츠 구역",
    toneClass: "rounded-3xl border border-violet-300/15 bg-violet-300/10 p-4",
    parts: [
      {
        id: "part-c1",
        title: "예비 체결 세트",
        category: "보조파츠",
        binCode: "C-01",
        finish: "혼합",
        stockCount: 74,
        status: "안정",
        compatibleProducts: ["재호출 작업", "AS 대응"],
        note: "보관함에서 다시 꺼낸 작업물의 수리/재조립용",
        recommendedRoute: "/storage",
      },
      {
        id: "part-c2",
        title: "카라비너 세트",
        category: "체인",
        binCode: "C-02",
        finish: "블랙",
        stockCount: 22,
        status: "주의",
        compatibleProducts: ["특수 키링", "아웃도어 굿즈"],
        note: "특수 옵션용이라 일반 링과 분리 관리",
        recommendedRoute: "/workbench/keyring",
      },
    ],
  },
];

export function getStatusClass(status: PartItem["status"]) {
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
    "/option-store": "옵션 스토어",
    "/b2b": "B2B 허브",
    "/storage": "보관함",
  };

  return map[href] ?? href;
}