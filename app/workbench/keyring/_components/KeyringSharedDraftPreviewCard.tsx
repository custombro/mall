"use client";

import { useMemo } from "react";
import { useKeyringProductionDraft } from "../../../../hooks/use-workshop-stage";
import type { KeyringUploadSlot } from "./keyring-production-pipeline";

const ORDERED_SLOTS: KeyringUploadSlot[] = [
  "original",
  "mask",
  "cutline",
  "white",
  "dombo",
  "worksheet",
];

export function KeyringSharedDraft미리보기Card() {
  const { keyringProductionDraft } = useKeyringProductionDraft();

  const readySlots = useMemo(() => {
    if (!keyringProductionDraft) return [];
    return ORDERED_SLOTS.filter((slot) => keyringProductionDraft.uploads[slot]?.status === "ready");
  }, [keyringProductionDraft]);

  if (!keyringProductionDraft) {
    return (
      <section className="mt-8 rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Production Link Step C</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Workbench linked draft preview</h2>
            <p className="mt-2 text-sm text-zinc-600">No shared production draft is currently available.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            shared draft empty
          </div>
        </div>
      </section>
    );
  }

  const original = keyringProductionDraft.uploads.original;

  return (
    <section className="mt-8 rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Production Link Step C</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Workbench linked draft preview</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Step C shows the shared production draft directly inside the workbench screen.
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          linked to shared draft
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-900">Original preview</h3>
            <div className="text-xs text-zinc-500">contain / no stretch</div>
          </div>

          <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white p-4">
            {original?.previewUrl ? (
              <img
                src={original.previewUrl}
                alt={original.fileName || "original preview"}
                className="max-h-[280px] w-full object-contain"
              />
            ) : (
              <div className="text-center text-sm text-zinc-500">
                <p>No original image uploaded yet.</p>
                <p className="mt-1">Shared draft is connected, but the original slot is still empty.</p>
              </div>
            )}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">file: {original?.fileName || "-"}</div>
            <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">size: {original?.width && original?.height ? String(original.width) + " x " + String(original.height) : "-"}</div>
            <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">mime: {original?.mimeType || "-"}</div>
            <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">status: {original?.status || "-"}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Production meta</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">quantity: {keyringProductionDraft.meta.quantity}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">material: {keyringProductionDraft.meta.material}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">thickness: {keyringProductionDraft.meta.thickness}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">ring: {keyringProductionDraft.meta.ringPosition}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">sku: {keyringProductionDraft.meta.sku || "-"}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700">work order: {keyringProductionDraft.meta.workOrder || "-"}</div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700 sm:col-span-2">imposition group: {keyringProductionDraft.meta.impositionGroup}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Ready slots</h3>
            <div className="flex flex-wrap gap-2">
              {readySlots.length > 0 ? (
                readySlots.map((slot) => (
                  <span key={slot} className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-800">
                    {slot}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500">
                  no ready slot
                </span>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-semibold">White placeholder linked</div>
            <div className="mt-2">spot_1 = C100 / spot_2 = Y100 / Offset Path -0.18mm / Overprint Fill</div>
            <div className="mt-1 text-xs">This step links the shared draft to the workbench screen. Real generation/export remains TODO.</div>
          </div>
        </div>
      </div>
    </section>
  );
}