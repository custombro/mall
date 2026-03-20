export type MaterialCategory = "투명" | "반투명" | "형광" | "컬러" | "특수";

export type AcrylicSheet = {
  id: string;
  title: string;
  thickness: "2.7T" | "3T" | "5T";
  category: MaterialCategory;
  rackCode: string;
  size: string;
  stockSheets: number;
  status: "안정" | "주의" | "부족";
  useCases: string[];
  note: string;
  recommendedRoute: string;
};

export type MaterialRack = {
  id: string;
  title: string;
  subtitle: string;
  toneClass: string;
  sheets: AcrylicSheet[];
};

export const materialCategoryOptions: MaterialCategory[] = [
  "투명",
  "반투명",
  "형광",
  "컬러",
  "특수",
];

export const materialRacks: MaterialRack[] = [
  {
    id: "rack-a",
    title: "전면 랙 A",
    subtitle: "가장 자주 쓰는 기본 투명 아크릴 구역",
    toneClass: "rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4",
    sheets: [
      {
        id: "sheet-a1",
        title: "투명 3T 기본판",
        thickness: "3T",
        category: "투명",
        rackCode: "A-01",
        size: "1200 x 2400",
        stockSheets: 8,
        status: "안정",
        useCases: ["키링", "기본 POP", "일반 굿즈"],
        note: "반복 발주가 가장 많은 기본판. 키링 작업대와 가장 자주 연결",
        recommendedRoute: "/workbench/keyring",
      },
      {
        id: "sheet-a2",
        title: "투명 5T 보강판",
        thickness: "5T",
        category: "투명",
        rackCode: "A-02",
        size: "1200 x 2400",
        stockSheets: 3,
        status: "주의",
        useCases: ["향수 POP", "하중 보강", "진열대"],
        note: "하중이 걸리는 POP에 자주 사용. 보강 검토 메모와 함께 POP 스튜디오로 연결",
        recommendedRoute: "/pop-studio",
      },
      {
        id: "sheet-a3",
        title: "투명 2.7T 경량판",
        thickness: "2.7T",
        category: "투명",
        rackCode: "A-03",
        size: "1200 x 2400",
        stockSheets: 6,
        status: "안정",
        useCases: ["행사 배포", "경량 키링", "대량주문"],
        note: "배포용/대량용에 적합한 경량 원장",
        recommendedRoute: "/b2b",
      },
    ],
  },
  {
    id: "rack-b",
    title: "중앙 랙 B",
    subtitle: "형광/반투명/특수 테스트 원장 구역",
    toneClass: "rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4",
    sheets: [
      {
        id: "sheet-b1",
        title: "형광 아크릴 테스트판",
        thickness: "3T",
        category: "형광",
        rackCode: "B-01",
        size: "1200 x 2400",
        stockSheets: 2,
        status: "주의",
        useCases: ["포인트 POP", "이벤트 굿즈", "샘플"],
        note: "테스트 소진 속도가 빨라 재고 체크 필요",
        recommendedRoute: "/pop-studio",
      },
      {
        id: "sheet-b2",
        title: "서리 반투명판",
        thickness: "3T",
        category: "반투명",
        rackCode: "B-02",
        size: "1200 x 2400",
        stockSheets: 4,
        status: "안정",
        useCases: ["고급 키링", "은은한 안내판"],
        note: "질감 강조형 작업에 적합",
        recommendedRoute: "/workbench/keyring",
      },
      {
        id: "sheet-b3",
        title: "특수 컬러판",
        thickness: "5T",
        category: "특수",
        rackCode: "B-03",
        size: "1200 x 2400",
        stockSheets: 1,
        status: "부족",
        useCases: ["특주 샘플", "쇼케이스"],
        note: "남은 재고가 적어 우선순위 판단 필요",
        recommendedRoute: "/option-store",
      },
    ],
  },
  {
    id: "rack-c",
    title: "후면 랙 C",
    subtitle: "컬러/보조 자재와 장기 보관용 원장 구역",
    toneClass: "rounded-3xl border border-violet-300/15 bg-violet-300/10 p-4",
    sheets: [
      {
        id: "sheet-c1",
        title: "화이트 베이스용 컬러판",
        thickness: "3T",
        category: "컬러",
        rackCode: "C-01",
        size: "1200 x 2400",
        stockSheets: 5,
        status: "안정",
        useCases: ["문구 POP", "색상 강조형 안내판"],
        note: "화이트 인쇄와 함께 쓰기 좋은 컬러 계열",
        recommendedRoute: "/pop-studio",
      },
      {
        id: "sheet-c2",
        title: "장기 보관 예비판",
        thickness: "5T",
        category: "투명",
        rackCode: "C-02",
        size: "1200 x 2400",
        stockSheets: 2,
        status: "주의",
        useCases: ["재호출 작업", "긴급 보강"],
        note: "보관함에서 재호출된 작업 보강용으로 남겨둔 판",
        recommendedRoute: "/storage",
      },
    ],
  },
];

export function getStatusClass(status: AcrylicSheet["status"]) {
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
    "/b2b": "B2B 허브",
    "/option-store": "옵션 스토어",
    "/storage": "보관함",
  };

  return map[href] ?? href;
}