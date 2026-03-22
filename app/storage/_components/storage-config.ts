export type StorageStatus = "보관중" | "작업중" | "재주문 가능" | "검수 필요";

export type StorageItem = {
  id: string;
  title: string;
  customer: string;
  productLine: string;
  lastWorkedAt: string;
  status: StorageStatus;
  quantity: number;
  drawerCode: string;
  materialSummary: string;
  note: string;
  recommendedRoute: string;
  tags: string[];
};

export type StorageShelf = {
  id: string;
  title: string;
  subtitle: string;
  tone: string;
  drawers: StorageItem[];
};

export const storageStatusOptions: StorageStatus[] = [
  "보관중",
  "작업중",
  "재주문 가능",
  "검수 필요",
];

export const storageTagOptions = [
  "키링",
  "POP",
  "대량주문",
  "재주문",
  "아크릴",
  "UV",
  "행사",
  "보강필요",
] as const;

export const storageShelves: StorageShelf[] = [
  {
    id: "shelf-alpha",
    title: "전면 보관 월 A",
    subtitle: "최근 주문과 재호출 빈도가 높은 작업물",
    tone: "from-cyan-400/20 via-slate-900 to-slate-950",
    drawers: [
      {
        id: "drawer-a1",
        title: "아이돌 캐릭터 키링",
        customer: "팬굿즈 반복주문 고객",
        productLine: "키링",
        lastWorkedAt: "2026-03-18",
        status: "재주문 가능",
        quantity: 24,
        drawerCode: "A-01",
        materialSummary: "3T 투명 아크릴 / 양면 인쇄 / 링 실버",
        note: "최근 반복 발주가 있었고 바로 키링 작업대로 넘기기 좋음",
        recommendedRoute: "/workbench/keyring",
        tags: ["키링", "재주문", "UV", "아크릴"],
      },
      {
        id: "drawer-a2",
        title: "향수 POP 소형 테스트분",
        customer: "브랜드 쇼케이스",
        productLine: "POP",
        lastWorkedAt: "2026-03-17",
        status: "검수 필요",
        quantity: 6,
        drawerCode: "A-02",
        materialSummary: "5T 투명 아크릴 / 바닥 결합형 / 화이트 테스트",
        note: "하중 보강 검토 메모가 남아 있어 POP 스튜디오에서 후속 점검 필요",
        recommendedRoute: "/pop-studio",
        tags: ["POP", "행사", "보강필요", "아크릴"],
      },
      {
        id: "drawer-a3",
        title: "행사 배포용 네임택",
        customer: "오프라인 이벤트 팀",
        productLine: "대량주문",
        lastWorkedAt: "2026-03-12",
        status: "보관중",
        quantity: 120,
        drawerCode: "A-03",
        materialSummary: "2.7T 투명 / 단면 인쇄 / 벌크 포장",
        note: "대량 재발주 가능성이 있어 B2B 흐름으로 연결 추천",
        recommendedRoute: "/b2b",
        tags: ["대량주문", "행사", "UV"],
      },
    ],
  },
  {
    id: "shelf-gamma",
    title: "후면 보관 월 C",
    subtitle: "판매/운영과 연결되는 장기 보관 작업물",
    tone: "from-emerald-400/20 via-slate-900 to-slate-950",
    drawers: [
      {
        id: "drawer-c1",
        title: "크루 판매 시범 상품",
        customer: "셀러 온보딩용",
        productLine: "판매자 샘플",
        lastWorkedAt: "2026-03-16",
        status: "재주문 가능",
        quantity: 18,
        drawerCode: "C-01",
        materialSummary: "기본 키링 세트 / 샘플 패키지 포함",
        note: "판매자 센터에서 후속 판매 흐름 검토 추천",
        recommendedRoute: "/seller",
        tags: ["키링", "재주문"],
      },
      {
        id: "drawer-c2",
        title: "행사 종료 재고 묶음",
        customer: "재고 정리 대상",
        productLine: "클리어런스",
        lastWorkedAt: "2026-03-08",
        status: "보관중",
        quantity: 37,
        drawerCode: "C-02",
        materialSummary: "잔여 키링 / POP 샘플 혼합",
        note: "정규 제작 흐름과 분리해 재고 정리 페이지에서 소진 검토",
        recommendedRoute: "/clearance",
        tags: ["재주문", "행사"],
      },
      {
        id: "drawer-c3",
        title: "신규 라우트 안내 샘플",
        customer: "내부 운영용",
        productLine: "허브 안내",
        lastWorkedAt: "2026-03-20",
        status: "작업중",
        quantity: 5,
        drawerCode: "C-03",
        materialSummary: "허브 소개 카드 / 테스트 데이터",
        note: "홈 허브와 각 공간 연결 검증용 테스트 세트",
        recommendedRoute: "/",
        tags: ["행사"],
      },
    ],
  }
];