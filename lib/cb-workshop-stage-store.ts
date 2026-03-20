import type { KeyringProductionDraft } from "../app/workbench/keyring/_components/keyring-production-pipeline";
export type PieceId = "frontPlate" | "backPlate" | "ringHole" | "connector";
export type BenchSlotId = "slotA" | "slotB" | "slotC" | "slotD";
export type DrawerBayId =
  | "bayA1"
  | "bayA2"
  | "bayA3"
  | "bayB1"
  | "bayB2"
  | "bayB3"
  | "bayC1"
  | "bayC2"
  | "bayC3";

export type PlacedPieces = Record<BenchSlotId, PieceId | null>;

export type WorkshopStageState = {
  placedPieces: PlacedPieces;
  incomingPieceIds: PieceId[];
  storageAssignments: Partial<Record<PieceId, DrawerBayId>>;
};

export const pieceOrder: PieceId[] = [
  "frontPlate",
  "backPlate",
  "ringHole",
  "connector",
];

export const initialPlacedPieces: PlacedPieces = {
  slotA: null,
  slotB: null,
  slotC: null,
  slotD: null,
};

export const recommendedBayMap: Record<PieceId, DrawerBayId> = {
  frontPlate: "bayB1",
  backPlate: "bayB2",
  ringHole: "bayA3",
  connector: "bayB3",
};

const STORAGE_KEY = "cb_stage14_bright_workshop_state_v1";

function isPieceId(value: unknown): value is PieceId {
  return typeof value === "string" && pieceOrder.includes(value as PieceId);
}

function isDrawerBayId(value: unknown): value is DrawerBayId {
  return typeof value === "string" && /^bay[A-C][1-3]$/.test(value);
}

function normalizePlacedPieces(raw: unknown): PlacedPieces {
  const input = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<BenchSlotId, unknown>>;
  return {
    slotA: isPieceId(input.slotA) ? input.slotA : null,
    slotB: isPieceId(input.slotB) ? input.slotB : null,
    slotC: isPieceId(input.slotC) ? input.slotC : null,
    slotD: isPieceId(input.slotD) ? input.slotD : null,
  };
}

function normalizeIncoming(raw: unknown): PieceId[] {
  if (!Array.isArray(raw)) return [];
  const unique = new Set<PieceId>();
  for (const item of raw) {
    if (isPieceId(item)) unique.add(item);
  }
  return pieceOrder.filter((id) => unique.has(id));
}

function normalizeAssignments(raw: unknown): Partial<Record<PieceId, DrawerBayId>> {
  const input = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<PieceId, unknown>>;
  const next: Partial<Record<PieceId, DrawerBayId>> = {};
  for (const pieceId of pieceOrder) {
    const value = input[pieceId];
    if (isDrawerBayId(value)) next[pieceId] = value;
  }
  return next;
}

export function normalizeWorkshopState(raw: Partial<WorkshopStageState> | null | undefined): WorkshopStageState {
  return {
    placedPieces: normalizePlacedPieces(raw?.placedPieces),
    incomingPieceIds: normalizeIncoming(raw?.incomingPieceIds),
    storageAssignments: normalizeAssignments(raw?.storageAssignments),
  };
}

export function readWorkshopState(): WorkshopStageState {
  if (typeof window === "undefined") {
    return normalizeWorkshopState(null);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeWorkshopState(null);
    return normalizeWorkshopState(JSON.parse(raw) as Partial<WorkshopStageState>);
  } catch {
    return normalizeWorkshopState(null);
  }
}

export function writeWorkshopState(state: WorkshopStageState): WorkshopStageState {
  const safe = normalizeWorkshopState(state);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent("cb-workshop-state-changed"));
  }

  return safe;
}

export function getPlacedPieceIds(placedPieces: PlacedPieces): PieceId[] {
  return pieceOrder.filter((pieceId) => Object.values(placedPieces).includes(pieceId));
}

export function mergeIncomingPieces(currentIncoming: PieceId[], additions: PieceId[]): PieceId[] {
  const unique = new Set<PieceId>();
  for (const pieceId of currentIncoming) {
    if (isPieceId(pieceId)) unique.add(pieceId);
  }
  for (const pieceId of additions) {
    if (isPieceId(pieceId)) unique.add(pieceId);
  }
  return pieceOrder.filter((pieceId) => unique.has(pieceId));
}

export function removeAssignedPiece(
  assignments: Partial<Record<PieceId, DrawerBayId>>,
  pieceId: PieceId,
): Partial<Record<PieceId, DrawerBayId>> {
  const next = { ...assignments };
  delete next[pieceId];
  return next;
}

export function getPieceLabel(pieceId: PieceId): string {
  switch (pieceId) {
    case "frontPlate":
      return "전면 플레이트";
    case "backPlate":
      return "후면 플레이트";
    case "ringHole":
      return "링 홀 파트";
    case "connector":
      return "보조 연결 파트";
    default:
      return pieceId;
  }
}

export function getPieceMini(pieceId: PieceId): string {
  switch (pieceId) {
    case "frontPlate":
      return "아트";
    case "backPlate":
      return "백판";
    case "ringHole":
      return "링";
    case "connector":
      return "연결";
    default:
      return pieceId;
  }
}

export function getRecommendedBay(pieceId: PieceId): DrawerBayId {
  return recommendedBayMap[pieceId];
}

export function getAssignedPiecesForBay(
  state: WorkshopStageState,
  bayId: DrawerBayId,
): PieceId[] {
  return pieceOrder.filter((pieceId) => state.storageAssignments[pieceId] === bayId);
}

/* STEPB_KEYRING_DRAFT_SHARED_SLICE_START */
type KeyringProductionDraftStateUpdater =
  | KeyringProductionDraft
  | null
  | ((prev: KeyringProductionDraft | null) => KeyringProductionDraft | null);

let keyringProductionDraftState: KeyringProductionDraft | null = null;
const keyringProductionDraftListeners = new Set<() => void>();

function emitKeyringProductionDraftState(): void {
  for (const listener of keyringProductionDraftListeners) {
    listener();
  }
}

export function getKeyringProductionDraftState(): KeyringProductionDraft | null {
  return keyringProductionDraftState;
}

export function setKeyringProductionDraftState(next: KeyringProductionDraftStateUpdater): KeyringProductionDraft | null {
  keyringProductionDraftState =
    typeof next === "function"
      ? (next as (prev: KeyringProductionDraft | null) => KeyringProductionDraft | null)(keyringProductionDraftState)
      : next;
  emitKeyringProductionDraftState();
  return keyringProductionDraftState;
}

export function subscribeKeyringProductionDraftState(listener: () => void): () => void {
  keyringProductionDraftListeners.add(listener);
  return () => {
    keyringProductionDraftListeners.delete(listener);
  };
}

export function resetKeyringProductionDraftState(): void {
  setKeyringProductionDraftState(null);
}
/* STEPB_KEYRING_DRAFT_SHARED_SLICE_END */
