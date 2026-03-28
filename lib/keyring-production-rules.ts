export const HOLE_DIAMETER_OPTIONS_MM = [2, 2.5, 3] as const;
export const DEFAULT_HOLE_DIAMETER_MM = 2.5;
export const MAX_KEYRING_HOLES = 5;
export const BODY_OFFSET_MM = 2.5;
export const MAX_OUTER_PROTRUSION_RATIO = 0.5;

export type HoleDiameterMm = typeof HOLE_DIAMETER_OPTIONS_MM[number];

export const KEYRING_RULE_TEXT = {
  cutline: "본체 최종 칼선은 실루엣 기준 바깥 2.5mm 오프셋으로 생성됩니다.",
  parts: "분리 파츠 오프셋끼리 붙지 않으면 자동 접수하지 않고 디자인 수정 요청으로 전환됩니다.",
  holes: "구멍은 2 / 2.5 / 3mm 중 선택 가능하며 기본값은 2.5mm, 최대 5개까지 허용됩니다.",
  contact: "구멍 외곽선은 본체 외곽선과 최소 1점 이상 접촉 또는 겹침 상태여야 합니다.",
  protrusion: "바깥 돌출은 선택한 구멍 지름의 절반까지만 허용됩니다.",
  background: "배경 추출 신뢰도가 낮으면 제작 불가 / 원본 수정 요청으로 차단됩니다.",
  stroke: "본체 칼선은 빨강 100% 0.01mm, 구멍 선은 검정 0.01mm 기준입니다.",
} as const;

export type HoleConstraintInput = {
  holeDiameterMm: number;
  bodyOffsetTouches: boolean;
  fullyInsideBody: boolean;
  outerProtrusionMm: number;
};

export type HoleConstraintResult = {
  ok: boolean;
  reason:
    | "OK"
    | "BODY_TOUCH_REQUIRED"
    | "FULLY_INSIDE_FORBIDDEN"
    | "OUTER_PROTRUSION_EXCEEDED"
    | "UNSUPPORTED_HOLE_DIAMETER";
};

export function getAllowedOuterProtrusionMm(holeDiameterMm: number): number {
  return holeDiameterMm * MAX_OUTER_PROTRUSION_RATIO;
}

export function validateHoleConstraint(input: HoleConstraintInput): HoleConstraintResult {
  if (!HOLE_DIAMETER_OPTIONS_MM.includes(input.holeDiameterMm as HoleDiameterMm)) {
    return { ok: false, reason: "UNSUPPORTED_HOLE_DIAMETER" };
  }

  if (!input.bodyOffsetTouches) {
    return { ok: false, reason: "BODY_TOUCH_REQUIRED" };
  }

  if (input.fullyInsideBody) {
    return { ok: false, reason: "FULLY_INSIDE_FORBIDDEN" };
  }

  if (input.outerProtrusionMm > getAllowedOuterProtrusionMm(input.holeDiameterMm)) {
    return { ok: false, reason: "OUTER_PROTRUSION_EXCEEDED" };
  }

  return { ok: true, reason: "OK" };
}

export type IntakeGateInput = {
  backgroundConfidence: number | null;
  separatedOffsetIsConnected: boolean;
};

export function shouldBlockAutoIntake(input: IntakeGateInput): boolean {
  if (!input.separatedOffsetIsConnected) return true;
  if (input.backgroundConfidence !== null && input.backgroundConfidence < 0.8) return true;
  return false;
}
