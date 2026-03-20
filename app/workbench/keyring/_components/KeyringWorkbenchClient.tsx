"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  acrylicOptions,
  estimateUnitPrice,
  finishOptions,
  keyringAddons,
  keyringPresets,
  materialCards,
  printSideOptions,
  ringOptions,
  shapeOptions,
  type AcrylicThickness,
  type FinishOption,
  type KeyringShape,
  type PrintSide,
  type RingOption,
} from "./keyring-config";

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function getFinishClass(finish: FinishOption) {
  switch (finish) {
    case "에폭시":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "글리터":
      return "border-violet-300/30 bg-violet-300/15 text-violet-100";
    case "형광 포인트":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    default:
      return "border-white/10 bg-white/5 text-slate-100";
  }
}

export default function KeyringWorkbenchClient() {
  const [presetId, setPresetId] = useState(keyringPresets[0]?.id ?? "");
  const preset = useMemo(
    () => keyringPresets.find((item) => item.id === presetId) ?? keyringPresets[0],
    [presetId],
  );

  const [shape, setShape] = useState<KeyringShape>(preset.shape);
  const [thickness, setThickness] = useState<AcrylicThickness>(preset.thickness);
  const [printSide, setPrintSide] = useState<PrintSide>(preset.printSide);
  const [ring, setRing] = useState<RingOption>(preset.ring);
  const [finish, setFinish] = useState<FinishOption>(preset.finish);
  const [quantity, setQuantity] = useState<number>(preset.minQty);
  const [addons, setAddons] = useState<string[]>([]);
  const [memo, setMemo] = useState<string>("");

  const unitPrice = useMemo(() => {
    return estimateUnitPrice({
      thickness,
      printSide,
      finish,
      addonCount: addons.length,
    });
  }, [addons.length, finish, printSide, thickness]);

  const totalPrice = useMemo(() => unitPrice * quantity, [quantity, unitPrice]);

  const productionHints = useMemo(() => {
    const hints: string[] = [];

    if (thickness === "5T") {
      hints.push("두께감이 있어 판매용/고급형 연출에 적합");
    } else if (thickness === "2.7T") {
      hints.push("행사 배포/대량 수량 대응에 유리");
    } else {
      hints.push("가장 범용적인 두께로 반복 발주 대응이 쉬움");
    }

    if (printSide === "양면") {
      hints.push("양면 인쇄라면 화이트 밀도와 배면 정렬 확인 필요");
    } else {
      hints.push("단면 인쇄는 배포형/가벼운 구성에 적합");
    }

    if (finish === "에폭시") {
      hints.push("표면 마감으로 판매가 상승 여지 있음");
    }

    if (shape === "더블" || shape === "쉐이커") {
      hints.push("레이어 구조라 조립 순서와 파츠 맞춤 검토 필요");
    }

    if (addons.includes("addon-proof")) {
      hints.push("교정 샘플이 포함되어 색상 확인 흐름을 먼저 잡아야 함");
    }

    return hints;
  }, [addons, finish, printSide, shape, thickness]);

  const selectedAddonObjects = useMemo(
    () => keyringAddons.filter((item) => addons.includes(item.id)),
    [addons],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_1.1fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Preset / Mode
          </p>
          <h2 className="text-2xl font-semibold text-white">키링 작업 시작점</h2>
          <p className="text-sm leading-6 text-slate-300">
            자주 쓰는 프리셋을 먼저 고르고, 그다음 작업대에서 두께, 마감, 부속,
            수량을 조합합니다.
          </p>
        </div>

        <div className="grid gap-3">
          {keyringPresets.map((item) => {
            const active = item.id === presetId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPresetId(item.id);
                  setShape(item.shape);
                  setThickness(item.thickness);
                  setPrintSide(item.printSide);
                  setRing(item.ring);
                  setFinish(item.finish);
                  setQuantity(item.minQty);
                  setAddons([]);
                }}
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
                  <span className={`rounded-full border px-3 py-1 text-xs ${getFinishClass(item.finish)}`}>
                    {item.finish}
                  </span>
                </div>

                <div className="mt-3 text-lg font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-sm text-slate-300">{item.note}</div>

                <div className="mt-4 grid gap-2 text-xs text-slate-200 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    {item.shape} · {item.thickness}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    {item.printSide} · {item.ring}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">소재 힌트</p>
          <div className="mt-3 grid gap-3">
            {materialCards.map((item) => (
              <div key={item.id} className={item.panelClass}>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-200">{item.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Workbench Controls
          </p>
          <h2 className="text-2xl font-semibold text-white">작업대 조합 패널</h2>
          <p className="text-sm leading-6 text-slate-300">
            실제 작업에 필요한 핵심 선택지를 한 화면에서 조합하고 즉시 견적과 생산 힌트를 확인합니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">형태</span>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as KeyringShape)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              {shapeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">아크릴 두께</span>
            <select
              value={thickness}
              onChange={(e) => setThickness(e.target.value as AcrylicThickness)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              {acrylicOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">인쇄면</span>
            <select
              value={printSide}
              onChange={(e) => setPrintSide(e.target.value as PrintSide)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              {printSideOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">링/체결</span>
            <select
              value={ring}
              onChange={(e) => setRing(e.target.value as RingOption)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              {ringOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">마감</span>
            <select
              value={finish}
              onChange={(e) => setFinish(e.target.value as FinishOption)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              {finishOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">수량</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            />
          </label>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">추가 옵션</p>
          <div className="grid gap-3">
            {keyringAddons.map((item) => {
              const active = addons.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAddons((prev) => toggleValue(prev, item.id))}
                  className={
                    active
                      ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.label}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{item.description}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      +{item.priceDelta}원
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">작업 메모</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={5}
            placeholder="색상 테스트, 타공 위치, 포장 요청 등"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
      </section>

      <aside className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Production Summary
          </p>
          <h2 className="text-2xl font-semibold text-white">요약 / 다음 동선</h2>
          <p className="text-sm leading-6 text-slate-300">
            현재 조합을 바로 읽고, 보관함이나 홈 허브로 이어질 다음 흐름을 명확히 보여줍니다.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
              {shape}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
              {thickness}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs ${getFinishClass(finish)}`}>
              {finish}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">인쇄</span>
              <span className="text-slate-100">{printSide}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">체결</span>
              <span className="text-slate-100">{ring}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">수량</span>
              <span className="text-slate-100">{quantity}개</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">예상 단가</span>
              <span className="text-cyan-100">{unitPrice.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">예상 합계</span>
              <span className="text-cyan-100">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-emerald-50">생산 힌트</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-100/90">
            {productionHints.map((hint) => (
              <li key={hint}>• {hint}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">선택된 추가 옵션</p>
          {selectedAddonObjects.length === 0 ? (
            <p className="mt-2 text-sm text-slate-300">추가 옵션 없음</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedAddonObjects.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                >
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <Link
            href="/storage"
            className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            보관함과 연결 보기
          </Link>
          <Link
            href="/parts-room"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            부자재 룸 확인
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            홈 허브로 이동
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">작업 메모 미리보기</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {memo.trim().length === 0 ? "아직 작업 메모가 없습니다." : memo}
          </p>
        </div>
      </aside>
    </div>
  );
}