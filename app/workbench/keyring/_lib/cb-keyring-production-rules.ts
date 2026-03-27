export const KEYRING_PRODUCTION_RULES = {
  version: "2026-03-27-rule-fixed",
  bodyOuterOffsetMm: 2.5,
  separatedPartOuterOffsetMm: 2.5,
  bodyCutline: {
    color: "RED_100",
    strokeMm: 0.01,
    fill: "none",
  },
  holeCutline: {
    color: "BLACK",
    strokeMm: 0.01,
    fill: "none",
  },
  hole: {
    diametersMm: [2, 2.5, 3] as const,
    defaultDiameterMm: 2.5,
    maxCount: 5,
    outerOffsetMm: 2.5,
    mustTouchBodyOutline: true,
    fullyInsideBodyForbidden: true,
    maxOutwardOverhangRatio: 0.5,
  },
  silhouette: {
    tryBackgroundRemovalFirst: true,
    rejectLowConfidenceExtraction: true,
  },
  productionBlockReasons: {
    detachedOffset: "디자인 수정 요청",
    lowConfidenceSilhouette: "원본 수정 요청",
  },
} as const

export type KeyringHoleDiameterMm =
  (typeof KEYRING_PRODUCTION_RULES.hole.diametersMm)[number]

export function getKeyringMaxOutwardOverhangMm(diameterMm: KeyringHoleDiameterMm){
  return diameterMm / 2
}

export function isAllowedKeyringHoleDiameter(diameterMm: number){
  return KEYRING_PRODUCTION_RULES.hole.diametersMm.includes(
    diameterMm as KeyringHoleDiameterMm,
  )
}

export function getKeyringProductionRuleSummary(){
  return {
    bodyOuterOffsetMm: KEYRING_PRODUCTION_RULES.bodyOuterOffsetMm,
    separatedPartOuterOffsetMm: KEYRING_PRODUCTION_RULES.separatedPartOuterOffsetMm,
    bodyCutline: KEYRING_PRODUCTION_RULES.bodyCutline,
    holeCutline: KEYRING_PRODUCTION_RULES.holeCutline,
    holeDiametersMm: [...KEYRING_PRODUCTION_RULES.hole.diametersMm],
    defaultHoleDiameterMm: KEYRING_PRODUCTION_RULES.hole.defaultDiameterMm,
    maxHoleCount: KEYRING_PRODUCTION_RULES.hole.maxCount,
    holeOuterOffsetMm: KEYRING_PRODUCTION_RULES.hole.outerOffsetMm,
    maxOutwardOverhangMmByDiameter: Object.fromEntries(
      KEYRING_PRODUCTION_RULES.hole.diametersMm.map((diameter) => [
        String(diameter),
        getKeyringMaxOutwardOverhangMm(diameter),
      ]),
    ),
  }
}