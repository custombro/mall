export type PopPreset = {
  id: string;
  title: string;
  useCase: string;
  baseSize: string;
  tiers: string;
  description: string;
};

export type PopMaterialCard = {
  id: string;
  title: string;
  panelClass: string;
  summary: string;
};

export type PopZone = {
  id: string;
  label: string;
  description: string;
};

export type PopLayer = {
  id: string;
  label: string;
  kind: "base" | "panel" | "holder" | "callout";
  description: string;
  adhesive: boolean;
  recommendedZoneId: string;
  compatibleZoneIds: string[];
};

export const popPresets: PopPreset[] = [
  {
    id: "preset-perfume",
    title: "향수 진열 POP",
    useCase: "브랜드 쇼케이스",
    baseSize: "A5 ~ A4",
    tiers: "2단 또는 3단",
    description: "향수나 소형 화장품을 올려두는 진열형 구조. 하중과 보강 체크가 중요",
  },
  {
    id: "preset-counter",
    title: "카운터 안내 POP",
    useCase: "매장 안내 / 프로모션",
    baseSize: "A6 ~ A5",
    tiers: "단층",
    description: "가격/행사 문구를 전면에 두고 뒤판과 받침의 안정성을 먼저 잡는 구조",
  },
  {
    id: "preset-collectible",
    title: "캐릭터 전시 스탠드",
    useCase: "굿즈 / 캐릭터 전시",
    baseSize: "A5",
    tiers: "2단",
    description: "전면 그래픽과 후면 받침, 소형 오브젝트 홀더의 균형이 중요한 구조",
  },
];

export const popMaterialCards: PopMaterialCard[] = [
  {
    id: "mat-clear",
    title: "투명 아크릴",
    panelClass: "rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4",
    summary: "가장 기본적인 POP 재질. 진열 상품과 배경을 가리지 않고 보여주기 쉬움",
  },
  {
    id: "mat-white",
    title: "화이트 인쇄 강조",
    panelClass: "rounded-3xl border border-slate-300/15 bg-slate-300/10 p-4",
    summary: "문구/로고 선명도 확보가 중요한 안내형 POP에 적합",
  },
  {
    id: "mat-thick",
    title: "5T 보강형",
    panelClass: "rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4",
    summary: "하중이 있거나 장기 진열이 필요한 구조에서 안정성 확보에 유리",
  },
];

export const popZones: PopZone[] = [
  { id: "zone-top-left", label: "좌상단", description: "소형 로고, 스티커, 코너 안내" },
  { id: "zone-top-center", label: "상단 중앙", description: "헤더 타이틀, 상단 배너" },
  { id: "zone-top-right", label: "우상단", description: "포인트 문구, 할인 배지" },
  { id: "zone-middle-left", label: "좌중앙", description: "보조 설명, 측면 서브 패널" },
  { id: "zone-middle-center", label: "중앙", description: "메인 그래픽, 전면 패널, 주 진열 위치" },
  { id: "zone-middle-right", label: "우중앙", description: "가격/효과 문구, 보조 파츠" },
  { id: "zone-bottom-left", label: "좌하단", description: "바닥 고정부, 하단 보강" },
  { id: "zone-bottom-center", label: "하단 중앙", description: "받침대, 제품 홀더, 베이스 중심축" },
  { id: "zone-bottom-right", label: "우하단", description: "우측 보강, 소형 지지대" },
];

export const popLayers: PopLayer[] = [
  {
    id: "layer-back-panel",
    label: "후면 메인 판",
    kind: "panel",
    description: "POP의 전체 메시지와 그래픽을 담는 뒤판",
    adhesive: true,
    recommendedZoneId: "zone-middle-center",
    compatibleZoneIds: ["zone-middle-center", "zone-top-center"],
  },
  {
    id: "layer-base-stand",
    label: "하단 받침 / 베이스",
    kind: "base",
    description: "전체 구조를 받쳐주는 중심 하단 부품",
    adhesive: true,
    recommendedZoneId: "zone-bottom-center",
    compatibleZoneIds: ["zone-bottom-left", "zone-bottom-center", "zone-bottom-right"],
  },
  {
    id: "layer-product-holder",
    label: "제품 홀더",
    kind: "holder",
    description: "향수/소형 제품을 올려두는 홀더 또는 선반",
    adhesive: true,
    recommendedZoneId: "zone-middle-center",
    compatibleZoneIds: ["zone-middle-left", "zone-middle-center", "zone-middle-right"],
  },
  {
    id: "layer-price-callout",
    label: "가격/포인트 말풍선",
    kind: "callout",
    description: "행사 문구, 가격 배지, 콜아웃 요소",
    adhesive: false,
    recommendedZoneId: "zone-top-right",
    compatibleZoneIds: ["zone-top-left", "zone-top-right", "zone-middle-right"],
  },
];

export function getZoneLabel(zoneId: string) {
  return popZones.find((zone) => zone.id === zoneId)?.label ?? zoneId;
}