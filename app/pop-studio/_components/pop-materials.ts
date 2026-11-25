import { THIN_ACRYLIC_THICKNESS } from "@/lib/cbmall-store";

export type SlotKey = "p1" | "p2" | "p3" | "p4";
export type Tone = "clear" | "white" | "black" | "mirror" | "hologram" | "frosted";

export type MaterialItem = {
  id: string;
  code: string;
  name: string;
  slot: SlotKey;
  tone: Tone;
  thickness: string;
  memo: string;
  price: number;
};

export const MATERIALS: MaterialItem[] = [
  { id: "front-clear-27t", code: "P1-A", name: "전면 투명 아크릴", slot: "p1", tone: "clear", thickness: `${THIN_ACRYLIC_THICKNESS}T`, memo: "기본 메인 인쇄면", price: 1200 },
  { id: "front-white-27t", code: "P1-B", name: "전면 백색 아크릴", slot: "p1", tone: "white", thickness: `${THIN_ACRYLIC_THICKNESS}T`, memo: "밝은 배경 강조", price: 1250 },
  { id: "back-clear-27t", code: "P2-A", name: "후면 투명 아크릴", slot: "p2", tone: "clear", thickness: `${THIN_ACRYLIC_THICKNESS}T`, memo: "뒷면 보호층", price: 1100 },
  { id: "back-frosted-27t", code: "P2-B", name: "후면 프로스트 아크릴", slot: "p2", tone: "frosted", thickness: `${THIN_ACRYLIC_THICKNESS}T`, memo: "은은한 후면 질감", price: 1180 },
  { id: "base-black-5t", code: "P3-A", name: "받침 블랙 아크릴", slot: "p3", tone: "black", thickness: "5T", memo: "기본 고정 베이스", price: 1700 },
  { id: "base-clear-5t", code: "P3-B", name: "받침 투명 아크릴", slot: "p3", tone: "clear", thickness: "5T", memo: "시야 확보형 베이스", price: 1700 },
  { id: "accent-holo-27t", code: "P4-A", name: "포인트 홀로그램", slot: "p4", tone: "hologram", thickness: `${THIN_ACRYLIC_THICKNESS}T`, memo: "반짝임 포인트", price: 1500 },
  { id: "accent-mirror-27t", code: "P4-B", name: "포인트 미러", slot: "p4", tone: "mirror", thickness: `${THIN_ACRYLIC_THICKNESS}T`, memo: "금속광 포인트", price: 1550 },
  { id: "accent-frosted-27t", code: "P4-C", name: "포인트 프로스트", slot: "p4", tone: "frosted", thickness: `${THIN_ACRYLIC_THICKNESS}T`, memo: "차분한 포인트", price: 1450 }
];

// Only these retired stock IDs are replaced. Saved/exported presets keep their
// original values; callers apply this mapping to the current working copy.
const LEGACY_MATERIAL_IDS: Readonly<Record<string, string>> = {
  "front-clear-3t": "front-clear-27t",
  "front-white-3t": "front-white-27t",
  "back-clear-3t": "back-clear-27t",
  "back-frosted-3t": "back-frosted-27t",
  "accent-holo-3t": "accent-holo-27t",
  "accent-mirror-3t": "accent-mirror-27t",
  "accent-frosted-3t": "accent-frosted-27t",
};

export function getWorkingPopMaterials(saved: Record<SlotKey, string | null>): Record<SlotKey, string | null> {
  const working = { ...saved };
  for (const slot of ["p1", "p2", "p3", "p4"] as const) {
    const id = saved[slot];
    if (typeof id === "string" && Object.hasOwn(LEGACY_MATERIAL_IDS, id)) {
      working[slot] = LEGACY_MATERIAL_IDS[id];
    }
  }
  return working;
}

export function hasCurrentPopMaterial(slot: SlotKey, id: string | null): boolean {
  return MATERIALS.some((material) => material.id === id && material.slot === slot);
}
