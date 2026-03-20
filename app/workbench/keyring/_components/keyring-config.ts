export type KeyringShape = "싱글" | "더블" | "쉐이커";
export type AcrylicThickness = "2.7T" | "3T" | "5T";
export type PrintSide = "단면" | "양면";
export type RingOption = "실버 링" | "골드 링" | "볼체인" | "카라비너";
export type FinishOption = "기본" | "에폭시" | "글리터" | "형광 포인트";

export type KeyringPreset = {
  id: string;
  title: string;
  shape: KeyringShape;
  thickness: AcrylicThickness;
  printSide: PrintSide;
  ring: RingOption;
  finish: FinishOption;
  minQty: number;
  note: string;
  useCase: string;
};

export type KeyringAddon = {
  id: string;
  label: string;
  priceDelta: number;
  description: string;
};

export type KeyringMaterialCard = {
  id: string;
  title: string;
  panelClass: string;
  summary: string;
};

export const keyringPresets: KeyringPreset[] = [
  {
    id: "preset-fan",
    title: "팬굿즈 반복 키링",
    shape: "싱글",
    thickness: "3T",
    printSide: "양면",
    ring: "실버 링",
    finish: "기본",
    minQty: 20,
    note: "반복 주문이 잦고 이미지 교체가 빠른 기본형",
    useCase: "팬굿즈 · 캐릭터 키링",
  },
  {
    id: "preset-event",
    title: "행사 배포형",
    shape: "싱글",
    thickness: "2.7T",
    printSide: "단면",
    ring: "볼체인",
    finish: "기본",
    minQty: 50,
    note: "벌크 패키징과 행사 배포를 고려한 경량형",
    useCase: "행사 · 배포용",
  },
  {
    id: "preset-premium",
    title: "고급 판매형",
    shape: "더블",
    thickness: "5T",
    printSide: "양면",
    ring: "골드 링",
    finish: "에폭시",
    minQty: 10,
    note: "두께감과 마감 포인트를 살린 판매용 고급형",
    useCase: "판매 · 샘플 전시",
  },
];

export const acrylicOptions: AcrylicThickness[] = ["2.7T", "3T", "5T"];
export const printSideOptions: PrintSide[] = ["단면", "양면"];
export const ringOptions: RingOption[] = ["실버 링", "골드 링", "볼체인", "카라비너"];
export const finishOptions: FinishOption[] = ["기본", "에폭시", "글리터", "형광 포인트"];
export const shapeOptions: KeyringShape[] = ["싱글", "더블", "쉐이커"];

export const keyringAddons: KeyringAddon[] = [
  {
    id: "addon-white",
    label: "화이트 베이스 강화",
    priceDelta: 300,
    description: "색감 유지가 필요한 일러스트용",
  },
  {
    id: "addon-holo",
    label: "홀로그램 포인트",
    priceDelta: 500,
    description: "반짝임 포인트용 후가공",
  },
  {
    id: "addon-package",
    label: "개별 포장",
    priceDelta: 250,
    description: "판매용 OPP/카드 포함",
  },
  {
    id: "addon-proof",
    label: "교정 샘플 1회",
    priceDelta: 1500,
    description: "색상/배치 확인용 소량 샘플",
  },
];

export const materialCards: KeyringMaterialCard[] = [
  {
    id: "mat-clear",
    title: "투명 아크릴",
    panelClass: "rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4",
    summary: "가장 범용적인 기본 소재. 팬굿즈/행사/일반 판매 모두 대응",
  },
  {
    id: "mat-frost",
    title: "반투명 / 서리 아크릴",
    panelClass: "rounded-3xl border border-slate-300/15 bg-slate-300/10 p-4",
    summary: "부드러운 느낌과 은은한 질감이 필요한 디자인에 적합",
  },
  {
    id: "mat-fluo",
    title: "형광 아크릴",
    panelClass: "rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4",
    summary: "포인트 컬러나 야광성 느낌을 주고 싶은 테스트/이벤트용",
  },
];

export function estimateUnitPrice(input: {
  thickness: AcrylicThickness;
  printSide: PrintSide;
  finish: FinishOption;
  addonCount: number;
}) {
  let price = 2100;

  if (input.thickness === "3T") price += 250;
  if (input.thickness === "5T") price += 700;
  if (input.printSide === "양면") price += 450;
  if (input.finish === "에폭시") price += 600;
  if (input.finish === "글리터") price += 450;
  if (input.finish === "형광 포인트") price += 350;

  price += input.addonCount * 220;

  return price;
}