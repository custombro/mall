"use client";

import {
  BODY_OFFSET_MM,
  DEFAULT_HOLE_DIAMETER_MM,
  HOLE_DIAMETER_OPTIONS_MM,
  KEYRING_RULE_TEXT,
  MAX_KEYRING_HOLES,
} from "@/lib/keyring-production-rules";

export function KeyringProductionRulesCard() {
  return (
    <section className="mb-4 rounded-2xl border border-red-200 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
          생산 규칙 우선
        </span>
        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
          본체 오프셋 {BODY_OFFSET_MM}mm
        </span>
        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
          기본 구멍 {DEFAULT_HOLE_DIAMETER_MM}mm
        </span>
        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
          최대 {MAX_KEYRING_HOLES}개
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2">
        <div className="rounded-xl bg-neutral-50 p-3">{KEYRING_RULE_TEXT.cutline}</div>
        <div className="rounded-xl bg-neutral-50 p-3">{KEYRING_RULE_TEXT.parts}</div>
        <div className="rounded-xl bg-neutral-50 p-3">{KEYRING_RULE_TEXT.holes}</div>
        <div className="rounded-xl bg-neutral-50 p-3">{KEYRING_RULE_TEXT.contact}</div>
        <div className="rounded-xl bg-neutral-50 p-3">{KEYRING_RULE_TEXT.protrusion}</div>
        <div className="rounded-xl bg-neutral-50 p-3">{KEYRING_RULE_TEXT.background}</div>
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        허용 구멍 지름: {HOLE_DIAMETER_OPTIONS_MM.join(" / ")}mm · 선 기준: 빨강 100% 0.01mm / 검정 0.01mm
      </p>
    </section>
  );
}
