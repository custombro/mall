"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useKeyringProductionDraft } from "../../../../hooks/use-workshop-stage";
import { processRemoveBackground } from "../../../../utils/imageProcessor";
import {
  KEYRING_UPLOAD_SLOTS,
  KeyringProductionDraft,
  KeyringProductionMeta,
  KeyringUploadEntry,
  KeyringUploadSlot,
  createDefaultKeyringProductionDraft,
  updateDraftMeta,
  upsertUploadEntry,
} from "./keyring-production-pipeline";

const SLOT_LABELS: Record<KeyringUploadSlot, string> = {
  original: "Original",
  mask: "Mask",
  cutline: "Cutline",
  white: "White",
  dombo: "Dombo",
  worksheet: "Worksheet",
};

function formatBytes(value?: number): string {
  if (!value || value <= 0) return "-";
  if (value < 1024) return String(value) + " B";
  if (value < 1024 * 1024) return (value / 1024).toFixed(1) + " KB";
  return (value / (1024 * 1024)).toFixed(1) + " MB";
}

function readImageSize(url: string): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = url;
  });
}

export function KeyringProductionPipelinePanel() {
  const draftSeedRef = useRef<KeyringProductionDraft | null>(null);
  if (!draftSeedRef.current) {
    draftSeedRef.current = createDefaultKeyringProductionDraft();
  }
  const draftSeed = draftSeedRef.current as KeyringProductionDraft;

  const { keyringProductionDraft, setKeyringProductionDraft } = useKeyringProductionDraft();
  const draft = keyringProductionDraft ?? draftSeed;

  const [selectedSlot, setSelectedSlot] = useState<KeyringUploadSlot>("original");
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);
  const originalFilesRef = useRef<Record<string, File>>({});

  useEffect(() => {
    if (!keyringProductionDraft) {
      setKeyringProductionDraft(draftSeed);
    }
  }, [draftSeed, keyringProductionDraft, setKeyringProductionDraft]);

  useEffect(() => {
    return () => {
      for (const url of objectUrlsRef.current) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
      objectUrlsRef.current = [];
    };
  }, []);

  function updateDraft(mutator: (prev: KeyringProductionDraft) => KeyringProductionDraft) {
    setKeyringProductionDraft((prev) => mutator(prev ?? draftSeed));
  }

  const selectedUpload = draft.uploads[selectedSlot];
  const jsonPreview = useMemo(() => JSON.stringify(draft, null, 2), [draft]);

  async function onFileChange(slot: KeyringUploadSlot, event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (slot === "original") {
      originalFilesRef.current[slot] = file;
    }

    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    if (previewUrl) objectUrlsRef.current.push(previewUrl);

    const baseEntry: KeyringUploadEntry = {
      slot,
      label: SLOT_LABELS[slot],
      status: "ready",
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      previewUrl,
      notes:
        slot === "white"
          ? ["spot_1 / spot_2 placeholder only", "real offset / AI export still TODO"]
          : slot === "cutline"
            ? ["character outline based", "real auto extraction still TODO"]
            : [],
    };

    updateDraft((prev) => upsertUploadEntry(prev, baseEntry));

    if (previewUrl) {
      const size = await readImageSize(previewUrl);
      updateDraft((prev) =>
        upsertUploadEntry(prev, {
          ...baseEntry,
          width: size.width,
          height: size.height,
        }),
      );
    }

    setSelectedSlot(slot);
    event.currentTarget.value = "";
  }

  async function handleAutoRemoveBackground() {
    const originalFile = originalFilesRef.current["original"];
    if (!originalFile || isRemovingBackground) return;

    setIsRemovingBackground(true);

    updateDraft((prev) =>
      upsertUploadEntry(prev, {
        ...prev.uploads.mask,
        status: "processing",
        label: "Mask (AI Processing...)",
      }),
    );

    try {
      const resultBlob = await processRemoveBackground(originalFile);
      const resultUrl = URL.createObjectURL(resultBlob);
      objectUrlsRef.current.push(resultUrl);

      const size = await readImageSize(resultUrl);
      const maskEntry: KeyringUploadEntry = {
        slot: "mask",
        label: SLOT_LABELS.mask,
        status: "ready",
        fileName: `mask_${originalFile.name}`,
        mimeType: "image/png",
        sizeBytes: resultBlob.size,
        previewUrl: resultUrl,
        width: size.width,
        height: size.height,
        notes: ["AI Auto-generated mask", "Background removed via browser-side WASM"],
      };

      updateDraft((prev) => upsertUploadEntry(prev, maskEntry));
      setSelectedSlot("mask");
    } catch (error) {
      alert("배경 제거 중 오류가 발생했습니다. 이미지 해상도가 너무 높거나 브라우저 사양을 확인해주세요.");
      updateDraft((prev) =>
        upsertUploadEntry(prev, {
          ...prev.uploads.mask,
          status: "error",
          label: "Mask (AI Failed)",
        }),
      );
    } finally {
      setIsRemovingBackground(false);
    }
  }

  function onMetaChange(field: keyof KeyringProductionMeta, value: string) {
    if (field === "quantity") {
      const nextQuantity = Math.max(1, Number(value || 1));
      updateDraft((prev) => updateDraftMeta(prev, field, nextQuantity));
      return;
    }
    updateDraft((prev) => updateDraftMeta(prev, field, value));
  }

  return (
    <section className="mt-8 rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Production Pipeline Step B</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Keyring upload / shared draft linkage</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Step B connects the Step A draft to the shared stage store. This is still not the finished production engine.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          display rule: contain / no distortion / no stretch
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900">Preview</h3>
              <div className="text-xs text-zinc-500">{SLOT_LABELS[selectedSlot]}</div>
            </div>

            <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white p-4">
              {selectedUpload?.previewUrl ? (
                <img
                  src={selectedUpload.previewUrl}
                  alt={selectedUpload.fileName || selectedUpload.label}
                  className="max-h-[320px] w-full object-contain"
                />
              ) : (
                <div className="text-center text-sm text-zinc-500">
                  <p>No file selected.</p>
                  <p className="mt-1">Contain only. Stretch is not allowed.</p>
                </div>
              )}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">File: {selectedUpload?.fileName || "-"}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">Size: {selectedUpload?.width && selectedUpload?.height ? String(selectedUpload.width) + " x " + String(selectedUpload.height) : "-"}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">Mime: {selectedUpload?.mimeType || "-"}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">Bytes: {formatBytes(selectedUpload?.sizeBytes)}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Upload slots</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {KEYRING_UPLOAD_SLOTS.map((slot) => {
                const entry = draft.uploads[slot];
                const canProcessAI = slot === "mask" && !!originalFilesRef.current["original"];

                return (
                  <div key={slot} className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-zinc-900">{SLOT_LABELS[slot]}</span>
                      <div className="flex gap-2">
                        {canProcessAI && (
                          <button
                            type="button"
                            disabled={isRemovingBackground}
                            onClick={handleAutoRemoveBackground}
                            className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                              isRemovingBackground
                                ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-wait"
                                : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                            }`}
                          >
                            {isRemovingBackground ? "AI..." : "AI 누끼"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="text-xs font-medium text-zinc-500"
                          onClick={(event) => {
                            event.preventDefault();
                            setSelectedSlot(slot);
                          }}
                        >
                          view
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">state: {entry.status}</div>
                    <div className="mt-1 truncate text-xs text-zinc-500">{entry.fileName || "empty"}</div>
                    <label className="mt-3 block cursor-pointer">
                      <span className="block w-full text-center py-2 px-3 border border-zinc-200 rounded-xl text-xs text-zinc-600 hover:bg-zinc-50">파일 선택</span>
                      <input
                        className="hidden"
                        type="file"
                        accept={slot === "worksheet" ? ".pdf,.txt,.md,.json,.csv" : "image/*,.svg"}
                        onChange={(event) => {
                          void onFileChange(slot, event);
                        }}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Production metadata</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-zinc-700">Quantity
                <input className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2" type="number" min={1} value={draft.meta.quantity} onChange={(event) => onMetaChange("quantity", event.currentTarget.value)} />
              </label>
              <label className="text-sm text-zinc-700">Material
                <input className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2" value={draft.meta.material} onChange={(event) => onMetaChange("material", event.currentTarget.value)} />
              </label>
              <label className="text-sm text-zinc-700">Thickness
                <input className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2" value={draft.meta.thickness} onChange={(event) => onMetaChange("thickness", event.currentTarget.value)} />
              </label>
              <label className="text-sm text-zinc-700">Ring position
                <input className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2" value={draft.meta.ringPosition} onChange={(event) => onMetaChange("ringPosition", event.currentTarget.value)} />
              </label>
              <label className="text-sm text-zinc-700">SKU
                <input className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2" value={draft.meta.sku} onChange={(event) => onMetaChange("sku", event.currentTarget.value)} />
              </label>
              <label className="text-sm text-zinc-700">Work order
                <input className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2" value={draft.meta.workOrder} onChange={(event) => onMetaChange("workOrder", event.currentTarget.value)} />
              </label>
              <label className="text-sm text-zinc-700">Imposition group
                <input className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2" value={draft.meta.impositionGroup} onChange={(event) => onMetaChange("impositionGroup", event.currentTarget.value)} />
              </label>
              <label className="text-sm text-zinc-700 md:col-span-2">Worksheet note
                <textarea className="mt-1 min-h-[96px] w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2" value={draft.meta.worksheetNote} onChange={(event) => onMetaChange("worksheetNote", event.currentTarget.value)} />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Layer / rule summary</h3>
            <div className="space-y-3">
              {draft.layers.map((layer) => (
                <div key={layer.kind} className="rounded-2xl border border-zinc-200 bg-white p-3">
                  <div className="text-sm font-semibold text-zinc-900">{layer.name}</div>
                  <div className="mt-1 text-xs text-zinc-600">separated: {layer.separated ? "yes" : "no"} / illustrator post-process: {layer.illustratorPostProcess ? "yes" : "no"}</div>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                    {layer.notes.map((note) => (<li key={note}>- {note}</li>))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="font-semibold">White placeholder</div>
              <div className="mt-2">spot_1 = C100 / spot_2 = Y100 / Offset Path -0.18mm / Overprint Fill</div>
              <div className="mt-1 text-xs">Real engine and AI export remain TODO.</div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Implemented / TODO</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                <div className="text-sm font-semibold text-emerald-800">Implemented</div>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600">
                  {draft.implemented.map((item) => (<li key={item}>- {item}</li>))}
                </ul>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-white p-4">
                <div className="text-sm font-semibold text-rose-800">TODO</div>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600">
                  {draft.todo.map((item) => (<li key={item}>- {item}</li>))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Production draft preview</h3>
            <textarea className="min-h-[420px] w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 font-mono text-xs text-zinc-700" readOnly value={jsonPreview} />
          </div>
        </div>
      </div>
    </section>
  );
}
