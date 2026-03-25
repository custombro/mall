"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getZoneLabel,
  popLayers,
  popMaterialCards,
  popPresets,
  popZones,
  type PopLayer,
} from "./pop-config";

type PlacementMap = Record<string, string | undefined>;

function getKindClass(kind: PopLayer["kind"]) {
  switch (kind) {
    case "base":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    case "panel":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "holder":
      return "border-violet-300/30 bg-violet-300/15 text-violet-100";
    default:
      return "border-amber-300/30 bg-amber-300/15 text-amber-100";
  }
}

export default function PopStudioClient() {
  const [presetId, setPresetId] = useState(popPresets[0]?.id ?? "");
  const [selectedLayerId, setSelectedLayerId] = useState(popLayers[0]?.id ?? "");
  const [previewZoneId, set미리보기ZoneId] = useState(
    popLayers[0]?.recommendedZoneId ?? "zone-middle-center",
  );
  const [placements, setPlacements] = useState<PlacementMap>({});
  const [memo, setMemo] = useState("");

  const preset = useMemo(
    () => popPresets.find((item) => item.id === presetId) ?? popPresets[0],
    [presetId],
  );

  const selectedLayer = useMemo(
    () => popLayers.find((item) => item.id === selectedLayerId) ?? popLayers[0],
    [selectedLayerId],
  );

  const previewZone = useMemo(
    () => popZones.find((zone) => zone.id === previewZoneId) ?? null,
    [previewZoneId],
  );

  const compatibleZoneIds = selectedLayer?.compatibleZoneIds ?? [];
  const snapReady = Boolean(selectedLayer && compatibleZoneIds.includes(previewZoneId));
  const placedCount = popLayers.filter((layer) => Boolean(placements[layer.id])).length;
  const progressPercent = Math.round((placedCount / Math.max(1, popLayers.length)) * 100);

  const occupancyByZone = useMemo(() => {
    return popZones.map((zone) => {
      const occupants = popLayers.filter((layer) => placements[layer.id] === zone.id);
      return {
        zoneId: zone.id,
        occupants,
      };
    });
  }, [placements]);

  const placedSummary = useMemo(() => {
    return popLayers.map((layer) => ({
      id: layer.id,
      label: layer.label,
      zoneLabel: placements[layer.id] ? getZoneLabel(placements[layer.id] as string) : "미배치",
    }));
  }, [placements]);

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1.55fr)_260px]">
      <section className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            POP Presets
          </p>
          <h2 className="text-2xl font-semibold text-white">POP 작업 시작점</h2>
          <p className="text-sm leading-6 text-slate-300">
            어떤 유형의 POP를 만드는지 먼저 고르고, 스냅 가이드가 붙은 작업면에서 부품을 배치합니다.
          </p>
        </div>

        <div className="grid gap-3">
          {popPresets.map((item) => {
            const active = item.id === presetId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPresetId(item.id)}
                className={
                  active
                    ? "rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                    : "rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                    {item.useCase}
                  </span>
                  <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                    {item.baseSize}
                  </span>
                </div>

                <div className="mt-3 text-lg font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-sm text-slate-300">{item.description}</div>
                <div className="mt-3 text-xs text-slate-400">단 구성: {item.tiers}</div>
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">재질/구조 힌트</p>
          <div className="mt-3 grid gap-3">
            {popMaterialCards.map((item) => (
              <div key={item.id} className={item.panelClass}>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-200">{item.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Snap Guide
          </p>
          <h2 className="text-2xl font-semibold text-white">스냅 가이드 작업면</h2>
          <p className="text-sm leading-6 text-slate-300">
            레고/테트리스처럼 현재 파트를 고르고, 붙일 수 있는 위치를 시각적으로 확인한 뒤 배치합니다.
          </p>
        </div>

        <div className="grid gap-3">
          {popLayers.map((layer) => {
            const active = layer.id === selectedLayerId;
            const placedZone = placements[layer.id];

            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => {
                  setSelectedLayerId(layer.id);
                  set미리보기ZoneId(layer.recommendedZoneId);
                }}
                className={
                  active
                    ? "rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                    : "rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs ${getKindClass(layer.kind)}`}>
                    {layer.kind}
                  </span>
                  <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                    {layer.adhesive ? "접착 파트" : "비접착 파트"}
                  </span>
                </div>

                <div className="mt-3 text-lg font-semibold text-white">{layer.label}</div>
                <div className="mt-1 text-sm text-slate-300">{layer.description}</div>
                <div className="mt-3 text-xs text-slate-400">
                  추천 위치: {getZoneLabel(layer.recommendedZoneId)} / 현재 배치: {placedZone ? getZoneLabel(placedZone) : "미배치"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">현재 선택 파트</p>
              <p className="mt-1 text-xs text-slate-400">
                호환 가능한 구역은 청록색, 현재 스냅 가능한 위치는 초록색 체크로 표시
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
              배치 진행률 {progressPercent}%
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {popZones.map((zone) => {
              const isCompatible = compatibleZoneIds.includes(zone.id);
              const is미리보기 = previewZoneId === zone.id;
              const occupants = occupancyByZone.find((item) => item.zoneId === zone.id)?.occupants ?? [];
              const snapClass = is미리보기 && snapReady
                ? "border-emerald-300/40 bg-emerald-300/15"
                : isCompatible
                  ? "border-cyan-300/30 bg-cyan-300/10"
                  : "border-white/10 bg-slate-950/60";

              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    set미리보기ZoneId(zone.id);
                    if (selectedLayer && selectedLayer.compatibleZoneIds.includes(zone.id)) {
                      setPlacements((prev) => ({
                        ...prev,
                        [selectedLayer.id]: zone.id,
                      }));
                    }
                  }}
                  className={`min-h-28 rounded-3xl border p-3 text-left transition hover:bg-white/10 ${snapClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{zone.label}</div>
                      <div className="mt-1 text-[11px] leading-5 text-slate-300">{zone.description}</div>
                    </div>
                    {is미리보기 && snapReady ? (
                      <span className="rounded-full border border-emerald-300/40 bg-emerald-300/15 px-2 py-1 text-[11px] text-emerald-100">
                        ✓ 스냅 가능
                      </span>
                    ) : isCompatible ? (
                      <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[11px] text-cyan-100">
                        가능
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-1">
                    {occupants.length === 0 ? (
                      <div className="text-[11px] text-slate-500">배치된 파트 없음</div>
                    ) : (
                      occupants.map((occupant) => (
                        <div
                          key={occupant.id}
                          className="rounded-2xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-100"
                        >
                          {occupant.label}
                        </div>
                      ))
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Studio Summary
          </p>
          <h2 className="text-2xl font-semibold text-white">현재 판단 / 다음 동선</h2>
          <p className="text-sm leading-6 text-slate-300">
            선택한 파트, 미리보기 위치, 실제 배치 결과를 읽고 다음 공간으로 이동합니다.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">{preset.title}</div>
          <div className="mt-1 text-sm text-slate-300">{preset.description}</div>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">현재 파트</span>
              <span className="text-slate-100">{selectedLayer?.label ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">미리보기 구역</span>
              <span className="text-slate-100">{previewZone?.label ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">스냅 상태</span>
              <span className={snapReady ? "text-emerald-100" : "text-amber-100"}>
                {snapReady ? "스냅 가능" : "비호환 위치"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">배치된 파트</span>
              <span className="text-slate-100">{placedCount} / {popLayers.length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-emerald-50">스냅 가이드 원칙</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-100/90">
            <li>• 호환 구역은 미리 강조해서 붙일 수 있는 위치를 빠르게 파악</li>
            <li>• 현재 선택 구역이 접착 가능 범위면 체크와 함께 스냅 가능 상태 표시</li>
            <li>• 후속 단계에서는 실제 드래그/스냅 인터랙션으로 확장 가능</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">배치 요약</p>
          <div className="mt-3 grid gap-2">
            {placedSummary.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
              >
                {item.label} → {item.zoneLabel}
              </div>
            ))}
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">작업 메모</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={5}
            placeholder="보강 필요 지점, 하중 체크, 화이트 테스트 메모"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <div className="grid gap-3">
          <Link
            href="/materials-room"
            className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            원자재 룸 보기
          </Link>
          <Link
            href="/storage"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            보관함 연결 확인
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            홈 허브로 이동
          </Link>
        </div>
      </aside>
    </div>
  );
}