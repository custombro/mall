export type ProductMode = "keyring" | "pop" | "";

export type CBMallState = {
  productMode: ProductMode;
  materialId: string;
  materialName: string;
  materialThickness: string;
  materialNote: string;
  optionId: string;
  optionName: string;
  optionGroup: string;
  optionNote: string;
  updatedAt: string;
};

export const CB_STATE_KEY = "CB_MALL_DESIGN_STATE_V1";

export const MATERIALS = [
  { id: "acrylic-clear-3t", name: "투명 아크릴", thickness: "3T", note: "기본 키링용 메인 자재" },
  { id: "acrylic-frost-3t", name: "반투명 아크릴", thickness: "3T", note: "부드러운 확산 표현 샘플용" },
  { id: "acrylic-hologram-3t", name: "홀로그램 아크릴", thickness: "3T", note: "반짝임 강조 샘플용" },
  { id: "acrylic-black-3t", name: "블랙 아크릴", thickness: "3T", note: "강한 대비 키링용" }
] as const;

export const OPTIONS = [
  { id: "ring-silver", name: "실버 O링", group: "연결부자재", note: "기본 연결 링" },
  { id: "ballchain-silver", name: "실버 볼체인", group: "연결부자재", note: "기본 체인형 부자재" },
  { id: "strap-black", name: "블랙 스트랩", group: "악세사리", note: "가볍게 걸 수 있는 스트랩" },
  { id: "clasp-gold", name: "골드 카라비너", group: "고급부자재", note: "포인트용 고급 연결 부자재" }
] as const;

export function getDefaultState(): CBMallState {
  return {
    productMode: "",
    materialId: "",
    materialName: "",
    materialThickness: "",
    materialNote: "",
    optionId: "",
    optionName: "",
    optionGroup: "",
    optionNote: "",
    updatedAt: "",
  };
}

export function loadState(): CBMallState {
  if (typeof window === "undefined") {
    return getDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(CB_STATE_KEY);
    if (!raw) {
      return getDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<CBMallState>;
    return {
      ...getDefaultState(),
      ...parsed,
    };
  } catch {
    return getDefaultState();
  }
}

export function saveState(partialState: Partial<CBMallState>) {
  if (typeof window === "undefined") {
    return;
  }

  const nextState: CBMallState = {
    ...loadState(),
    ...partialState,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(CB_STATE_KEY, JSON.stringify(nextState));
}

export function resetState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CB_STATE_KEY);
}