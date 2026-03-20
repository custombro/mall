import type { DrawerBayId } from "../../../lib/cb-workshop-stage-store";

export const drawerBays: {
  id: DrawerBayId;
  title: string;
  shelf: string;
  capacity: string;
  notes: string[];
}[] = [
  { id: "bayA1", title: "상단 좌측", shelf: "A-1", capacity: "완성 키링 16ea", notes: ["투명 박스", "즉시 출고 후보"] },
  { id: "bayA2", title: "상단 중앙", shelf: "A-2", capacity: "시험 샘플 10ea", notes: ["테스트 샘플", "색상 비교"] },
  { id: "bayA3", title: "상단 우측", shelf: "A-3", capacity: "링 파츠 24ea", notes: ["금속 파트", "보조 결합"] },
  { id: "bayB1", title: "중단 좌측", shelf: "B-1", capacity: "전면 플레이트 20ea", notes: ["주요 전면", "인쇄 대기"] },
  { id: "bayB2", title: "중앙 포커스", shelf: "B-2", capacity: "후면 플레이트 18ea", notes: ["메인 보관 존", "클릭 강조"] },
  { id: "bayB3", title: "중단 우측", shelf: "B-3", capacity: "연결 파트 26ea", notes: ["보조 고정부", "스냅 후보"] },
  { id: "bayC1", title: "하단 좌측", shelf: "C-1", capacity: "포장 대기 14ea", notes: ["출고 전", "묶음 보관"] },
  { id: "bayC2", title: "하단 중앙", shelf: "C-2", capacity: "불량/검수 8ea", notes: ["재검수", "QC 보관"] },
  { id: "bayC3", title: "하단 우측", shelf: "C-3", capacity: "예비 소재 12ea", notes: ["비상 재고", "교체 후보"] },
];