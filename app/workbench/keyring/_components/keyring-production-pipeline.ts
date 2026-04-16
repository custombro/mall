export type KeyringUploadSlot =
  | "original"
  | "mask"
  | "cutline"
  | "white"
  | "dombo"
  | "worksheet";

export type KeyringLayerKind =
  | "image"
  | "white"
  | "cutline"
  | "ring-cutline"
  | "dombo";

export type KeyringUploadStatus = "empty" | "ready" | "todo" | "processing" | "error";

export interface KeyringUploadEntry {
  slot: KeyringUploadSlot;
  label: string;
  status: KeyringUploadStatus;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  previewUrl?: string;
  notes?: string[];
}

export interface KeyringProductionMeta {
  quantity: number;
  material: string;
  thickness: string;
  ringPosition: string;
  sku: string;
  workOrder: string;
  impositionGroup: string;
  worksheetNote: string;
}

export interface KeyringWhiteRuleSpec {
  spot1Name: string;
  spot2Name: string;
  spot1Color: string;
  spot2Color: string;
  innerOffsetMm: number;
  overprintFill: boolean;
  illustratorPostProcess: boolean;
}

export interface KeyringCutlineRuleSpec {
  preserveOriginalAspectRatio: boolean;
  allowStretch: boolean;
  outlineSource: string;
  ringHoleSource: string;
  illustratorPostProcess: boolean;
}

export interface KeyringDisplayRuleSpec {
  fit: "contain";
  stretchAllowed: false;
}

export interface KeyringLayerSpec {
  kind: KeyringLayerKind;
  name: string;
  separated: boolean;
  illustratorPostProcess: boolean;
  notes: string[];
}

export interface KeyringProductionDraft {
  version: string;
  uploads: Record<KeyringUploadSlot, KeyringUploadEntry>;
  meta: KeyringProductionMeta;
  layers: KeyringLayerSpec[];
  rules: {
    white: KeyringWhiteRuleSpec;
    cutline: KeyringCutlineRuleSpec;
    display: KeyringDisplayRuleSpec;
  };
  implemented: string[];
  todo: string[];
}

export const KEYRING_UPLOAD_SLOTS: KeyringUploadSlot[] = [
  "original",
  "mask",
  "cutline",
  "white",
  "dombo",
  "worksheet",
];

export function createEmptyUploadEntry(slot: KeyringUploadSlot): KeyringUploadEntry {
  return {
    slot,
    label: slot,
    status: "empty",
    notes: [],
  };
}

export function createDefaultKeyringProductionDraft(): KeyringProductionDraft {
  return {
    version: "stage18-stepA",
    uploads: {
      original: createEmptyUploadEntry("original"),
      mask: createEmptyUploadEntry("mask"),
      cutline: createEmptyUploadEntry("cutline"),
      white: createEmptyUploadEntry("white"),
      dombo: createEmptyUploadEntry("dombo"),
      worksheet: createEmptyUploadEntry("worksheet"),
    },
    meta: {
      quantity: 1,
      material: "acrylic",
      thickness: "3T",
      ringPosition: "top-center",
      sku: "",
      workOrder: "",
      impositionGroup: "A",
      worksheetNote: "",
    },
    layers: [
      { kind: "image", name: "image", separated: true, illustratorPostProcess: true, notes: ["keep original aspect ratio", "display no-stretch"] },
      { kind: "white", name: "white", separated: true, illustratorPostProcess: true, notes: ["spot_1 / spot_2 placeholder", "Offset Path -0.18mm TODO", "Overprint Fill placeholder"] },
      { kind: "cutline", name: "cutline", separated: true, illustratorPostProcess: true, notes: ["character outline based", "auto extraction TODO"] },
      { kind: "ring-cutline", name: "ring-cutline", separated: true, illustratorPostProcess: true, notes: ["ring hole managed separately"] },
      { kind: "dombo", name: "dombo", separated: true, illustratorPostProcess: true, notes: ["dombo separated layer"] }
    ],
    rules: {
      white: {
        spot1Name: "spot_1",
        spot2Name: "spot_2",
        spot1Color: "C100",
        spot2Color: "Y100",
        innerOffsetMm: -0.18,
        overprintFill: true,
        illustratorPostProcess: true
      },
      cutline: {
        preserveOriginalAspectRatio: true,
        allowStretch: false,
        outlineSource: "character-outline",
        ringHoleSource: "manual-ring-anchor",
        illustratorPostProcess: true
      },
      display: {
        fit: "contain",
        stretchAllowed: false
      }
    },
    implemented: [
      "upload state and metadata skeleton",
      "original/mask/cutline/white/dombo/worksheet slots",
      "quantity/material/thickness/ringPosition/SKU/workOrder/impositionGroup fields",
      "no-stretch preview rule",
      "image/white/cutline/dombo layer separation schema",
      "JSON production draft preview"
    ],
    todo: [
      "real outline extraction engine",
      "real white generation engine",
      "real ring cutline generation",
      "background-white removal while preserving white objects",
      "real offset path -0.18mm generation",
      "spot_1 / spot_2 AI export",
      "auto imposition engine",
      "worksheet auto linkage",
      "shared store persistence"
    ]
  };
}

export function upsertUploadEntry(draft: KeyringProductionDraft, entry: KeyringUploadEntry): KeyringProductionDraft {
  return {
    ...draft,
    uploads: {
      ...draft.uploads,
      [entry.slot]: entry
    }
  };
}

export function updateDraftMeta<K extends keyof KeyringProductionMeta>(
  draft: KeyringProductionDraft,
  key: K,
  value: KeyringProductionMeta[K]
): KeyringProductionDraft {
  return {
    ...draft,
    meta: {
      ...draft.meta,
      [key]: value
    }
  };
}