export type B2BStage = "문의접수" | "견적중" | "생산준비" | "납기관리";
export type B2BProject = {
  id: string;
  title: string;
  clientType: string;
  quantityBand: string;
  stage: B2BStage;
  dueWindow: string;
  summary: string;
  note: string;
  recommendedRoute: string;
};

export type B2BChecklist = {
  id: string;
  label: string;
  description: string;
};

export const b2bStages: B2BStage[] = ["문의접수", "견적중", "생산준비", "납기관리"];

export const b2bProjects: B2BProject[] = [
  {
    id: "b2b-1",
    title: "행사 네임택 대량 발주",
    clientType: "행사 운영팀",
    quantityBand: "100~300",
    stage: "견적중",
    dueWindow: "3월 4주",
    summary: "경량 아크릴과 벌크 포장을 전제로 하는 대량 배포형",
    note: "2.7T 원장과 OPP 포장 옵션 연동 우선",
    recommendedRoute: "/materials-room",
  },
  {
    id: "b2b-2",
    title: "브랜드 쇼케이스 POP",
    clientType: "브랜드사",
    quantityBand: "10~50",
    stage: "생산준비",
    dueWindow: "4월 1주",
    summary: "하중 보강과 진열 안정성이 중요한 POP 프로젝트",
    note: "5T 보강판과 POP 스튜디오 검토 필요",
    recommendedRoute: "/pop-studio",
  },
  {
    id: "b2b-3",
    title: "공공기관 안내판 세트",
    clientType: "공공기관",
    quantityBand: "50~120",
    stage: "문의접수",
    dueWindow: "미정",
    summary: "화이트 인쇄 강조와 납기 대응이 중요한 안내판 구조",
    note: "화이트 베이스 강화 옵션과 견적 분리 필요",
    recommendedRoute: "/option-store",
  },
  {
    id: "b2b-4",
    title: "반복 리오더 패키지",
    clientType: "기존 거래처",
    quantityBand: "30~80",
    stage: "납기관리",
    dueWindow: "상시",
    summary: "기존 작업물 재호출 기반으로 빠르게 반복 납품하는 흐름",
    note: "보관함 기준 리오더 전환이 핵심",
    recommendedRoute: "/storage",
  }
];

export const b2bChecklist: B2BChecklist[] = [
  { id: "ck-1", label: "수량 구간 확인", description: "소량/중량/대량 여부와 단가 구조 먼저 판정" },
  { id: "ck-2", label: "납기 확인", description: "입고일, 제작일, 출고일을 일반 주문과 분리해 관리" },
  { id: "ck-3", label: "자재/옵션 확인", description: "원장 두께, 포장, 후가공, 보강 파츠 동시 확인" },
  { id: "ck-4", label: "반복 발주 가능성", description: "보관함 재호출 대상인지 여부 선판정" }
];

export function getStageClass(stage: B2BStage) {
  switch (stage) {
    case "문의접수":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "견적중":
      return "border-violet-300/30 bg-violet-300/15 text-violet-100";
    case "생산준비":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    default:
      return "border-amber-300/30 bg-amber-300/15 text-amber-100";
  }
}

export function getRouteLabel(href: string) {
  const map: Record<string, string> = {
    "/materials-room": "원자재 룸",
    "/pop-studio": "POP 스튜디오",
    "/option-store": "옵션 스토어",
    "/storage": "보관함",
  };
  return map[href] ?? href;
}