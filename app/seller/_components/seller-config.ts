export type SellerTier = "입문" | "운영중" | "확장";
export type SellerStatus = "모집중" | "판매중" | "검수필요";

export type SellerProgram = {
  id: string;
  title: string;
  tier: SellerTier;
  headline: string;
  monthlyTarget: string;
  summary: string;
  recommendedRoute: string;
};

export type SellerProduct = {
  id: string;
  title: string;
  category: string;
  sellerTier: SellerTier;
  status: SellerStatus;
  sku: string;
  marginHint: string;
  stockNote: string;
  summary: string;
  recommendedRoute: string;
};

export type SettlementCard = {
  id: string;
  label: string;
  value: string;
  toneClass: string;
  note: string;
};

export const sellerTierOptions: SellerTier[] = ["입문", "운영중", "확장"];
export const sellerStatusOptions: SellerStatus[] = ["모집중", "판매중", "검수필요"];

export const sellerPrograms: SellerProgram[] = [
  {
    id: "program-starter",
    title: "크루 스타터",
    tier: "입문",
    headline: "소량 판매 테스트용 입문 프로그램",
    monthlyTarget: "월 20~50건",
    summary: "기본 키링/소형 굿즈로 판매 시작점을 만드는 입문형 셀러 코스",
    recommendedRoute: "/workbench/keyring",
  },
  {
    id: "program-active",
    title: "액티브 셀러",
    tier: "운영중",
    headline: "반복 판매와 재주문 흐름이 붙는 운영 단계",
    monthlyTarget: "월 50~150건",
    summary: "보관함 재호출과 옵션 스토어를 함께 쓰며 반복 주문을 굴리는 운영형",
    recommendedRoute: "/storage",
  },
  {
    id: "program-scale",
    title: "스케일 셀러",
    tier: "확장",
    headline: "행사/대량/프로모션까지 확장하는 단계",
    monthlyTarget: "월 150건 이상",
    summary: "대량 주문과 행사 상품, 프리미엄 패키지까지 엮는 확장형 셀러 구조",
    recommendedRoute: "/b2b",
  },
];

export const sellerProducts: SellerProduct[] = [
  {
    id: "seller-prod-1",
    title: "팬굿즈 기본 키링",
    category: "키링",
    sellerTier: "입문",
    status: "모집중",
    sku: "SLR-KR-001",
    marginHint: "중간 마진 / 반복판매 적합",
    stockNote: "기본 링과 3T 투명 아크릴 기준 안정적",
    summary: "가장 먼저 시작하기 좋은 기본 판매 상품",
    recommendedRoute: "/workbench/keyring",
  },
  {
    id: "seller-prod-2",
    title: "프리미엄 에폭시 키링",
    category: "키링",
    sellerTier: "운영중",
    status: "판매중",
    sku: "SLR-KR-002",
    marginHint: "상대적 고마진 / 패키지 동반 권장",
    stockNote: "에폭시와 패키지 카드 재고 확인 필요",
    summary: "판매용 고급 구성으로 전환하기 좋은 상품",
    recommendedRoute: "/option-store",
  },
  {
    id: "seller-prod-3",
    title: "POP 전시 세트",
    category: "POP",
    sellerTier: "확장",
    status: "검수필요",
    sku: "SLR-POP-001",
    marginHint: "단가 높음 / 검수 중요",
    stockNote: "5T 보강판과 스탠드 발 재고 확인 필요",
    summary: "전시/행사형 판매 구조로 확장할 때 쓰는 상품",
    recommendedRoute: "/pop-studio",
  },
  {
    id: "seller-prod-4",
    title: "행사 배포 패키지",
    category: "행사",
    sellerTier: "확장",
    status: "판매중",
    sku: "SLR-EVT-001",
    marginHint: "대량 매출형 / 개별 마진 낮음",
    stockNote: "2.7T 경량판과 OPP 포장 옵션 연동",
    summary: "행사/배포 목적의 확장형 판매 세트",
    recommendedRoute: "/b2b",
  },
  {
    id: "seller-prod-5",
    title: "재호출 리오더 세트",
    category: "리오더",
    sellerTier: "운영중",
    status: "판매중",
    sku: "SLR-RD-001",
    marginHint: "운영 효율형 / 재주문 전환 강점",
    stockNote: "보관함에서 빠르게 재호출 가능한 구조",
    summary: "기존 작업물을 다시 꺼내 빠르게 주문 전환하는 구조",
    recommendedRoute: "/storage",
  },
];

export const settlementCards: SettlementCard[] = [
  {
    id: "settlement-1",
    label: "이번 주 예상 정산",
    value: "₩ 428,000",
    toneClass: "rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4",
    note: "현재 판매중 상품 기준 단순 추정",
  },
  {
    id: "settlement-2",
    label: "재주문 전환 가능",
    value: "12건",
    toneClass: "rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4",
    note: "보관함/리오더 흐름 연결 가능 수",
  },
  {
    id: "settlement-3",
    label: "검수 대기",
    value: "3건",
    toneClass: "rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4",
    note: "POP/프리미엄 판매 전 확인 필요",
  },
];

export function getTierClass(tier: SellerTier) {
  switch (tier) {
    case "입문":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "운영중":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    default:
      return "border-violet-300/30 bg-violet-300/15 text-violet-100";
  }
}

export function getStatusClass(status: SellerStatus) {
  switch (status) {
    case "모집중":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "판매중":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    default:
      return "border-amber-300/30 bg-amber-300/15 text-amber-100";
  }
}

export function getRouteLabel(href: string) {
  const map: Record<string, string> = {
    "/workbench/keyring": "키링 작업대",
    "/option-store": "옵션 스토어",
    "/pop-studio": "POP 스튜디오",
    "/b2b": "B2B 허브",
    "/storage": "보관함",
  };

  return map[href] ?? href;
}