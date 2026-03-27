import type { BenchSlotId, PieceId } from "../../../../lib/cb-workshop-stage-store";

export type ViewMode = "layout" | "assembly" | "storage";
export type FocusZone = "material" | "parts" | "preview" | "optional";

export type SlotInfo = {
  id: BenchSlotId;
  label: string;
  note: string;
};

export const materialRack = [
  { id: "mat-3t-clear", label: "투명 3T", note: "전면 아크릴 후보", shelf: "3T", stack: "18장" },
  { id: "mat-5t-clear", label: "투명 5T", note: "받침/보강 샘플", shelf: "5T", stack: "10장" },
  { id: "mat-white", label: "화이트 원장", note: "후면 백판 후보", shelf: "WHITE", stack: "8장" },
  { id: "mat-opp", label: "OPP 포장재", note: "출고 포장 준비", shelf: "OPP", stack: "1000매" },
];

export const partsDrawers = [
  { id: "drawer-a", title: "전면 파트 서랍", pieces: ["frontPlate", "ringHole"] as PieceId[] },
  { id: "drawer-b", title: "후면/연결 서랍", pieces: ["backPlate", "connector"] as PieceId[] },
];

export const piecePalette: Record<PieceId, { label: string; note: string; accent: string; mini: string }> = {
  frontPlate: { label: "전면 플레이트", note: "메인 아트 파트", accent: "#2d6cdf", mini: "아트" },
  backPlate: { label: "후면 플레이트", note: "지지 레이어", accent: "#0f9b6f", mini: "백판" },
  ringHole: { label: "링 홀 파트", note: "상단 결합 포인트", accent: "#c88a11", mini: "링" },
  connector: { label: "보조 연결 파트", note: "스냅 위치 테스트", accent: "#8a5cff", mini: "연결" },
};

export const benchSlots: SlotInfo[] = [
  { id: "slotA", label: "상단 링 포인트", note: "링 홀 파트 우선" },
  { id: "slotB", label: "중앙 전면", note: "전면 플레이트 우선" },
  { id: "slotC", label: "중앙 후면", note: "후면 플레이트 우선" },
  { id: "slotD", label: "하단 보조", note: "보조 연결 파트 우선" },
];

export const slotRules: Record<BenchSlotId, PieceId[]> = {
  slotA: ["ringHole", "connector"],
  slotB: ["frontPlate"],
  slotC: ["backPlate"],
  slotD: ["connector", "backPlate"],
};

export const preferredSlotForPiece: Record<PieceId, BenchSlotId> = {
  frontPlate: "slotB",
  backPlate: "slotC",
  ringHole: "slotA",
  connector: "slotD",
};

export const sceneAnchorPosition: Record<
  BenchSlotId,
  { top: string; left: string; label: string }
> = {
  slotA: { top: "12%", left: "50%", label: "A" },
  slotB: { top: "38%", left: "50%", label: "B" },
  slotC: { top: "58%", left: "50%", label: "C" },
  slotD: { top: "84%", left: "50%", label: "D" },
};