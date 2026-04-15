"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  buildBrushPath,
  buildCutlineFromStrokeCloud,
  formatFileSize,
  type BrushStroke,
  type UploadItem,
} from "../brush-assist";

type Props = {
  showAuxLinks?: boolean;
  title?: string;
  subtitle?: string;
};

const DEPLOY_MARKER = "DEPLOY_KEYRING_BRUSH_MAIN_20260415_01";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getSvgPoint(event: ReactPointerEvent<SVGSVGElement>) {
  const svg = event.currentTarget;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 50, y: 50 };

  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const result = point.matrixTransform(ctm.inverse());

  return {
    x: clamp(result.x, 0, 100),
    y: clamp(result.y, 0, 100),
  };
}

export default function BrushAssistWorkbench({
  showAuxLinks = true,
  title = "키링 칼선 작업대",
  subtitle = "이미지 올리고 캐릭터만 러프하게 칠한 뒤 바로 칼선을 확인하세요.",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [strokes, setStrokes] = useState<BrushStroke[]>([]);
  const [isBrushing, setIsBrushing] = useState(false);

  const activeUpload = useMemo(
    () => uploads.find((item) => item.id === activeId) ?? null,
    [uploads, activeId],
  );

  const cutline = useMemo(() => buildCutlineFromStrokeCloud(strokes), [strokes]);
  const canConfirm = Boolean(activeUpload) && strokes.length > 0;

  const currentStage = !activeUpload ? "1 파일 올리기" : strokes.length === 0 ? "2 캐릭터 칠하기" : "3 칼선 확인";
  const currentStatus = !activeUpload
    ? "준비됨"
    : isBrushing
      ? "칠하는 중"
      : canConfirm
        ? "칼선 확인 가능"
        : "붓칠 필요";
  const nextAction = !activeUpload ? "이미지 올리기" : canConfirm ? "칼선 확인 완료" : "캐릭터만 칠하기";
  const resultCopy = !activeUpload
    ? "파일을 올리면 여기서 바로 결과를 볼 수 있어요."
    : canConfirm
      ? "칼선 기준 준비 완료"
      : "캐릭터 부분을 러프하게 칠해 주세요.";

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setUploads((prev) => [...prev, ...next]);
    setActiveId((prev) => prev ?? next[0]?.id ?? null);
    setStrokes([]);
    event.target.value = "";
  };

  const clearBrush = () => setStrokes([]);

  const startBrush = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!activeUpload?.previewUrl) return;
    const point = getSvgPoint(event);
    setIsBrushing(true);
    setStrokes((prev) => [...prev, { points: [point] }]);
  };

  const moveBrush = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!isBrushing) return;
    const point = getSvgPoint(event);
    setStrokes((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      const latest = next[next.length - 1];
      next[next.length - 1] = { points: [...latest.points, point] };
      return next;
    });
  };

  const stopBrush = () => setIsBrushing(false);

  return (
    <main className="min-h-screen bg-[#f5f4f1] text-neutral-900">
      <div className="mx-auto w-full max-w-[1580px] px-4 py-4">
        <header className="sticky top-3 z-20 rounded-[28px] border border-black/10 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.24em] text-neutral-500">KEYRING WORKBENCH</p>
              <h1 className="mt-1 text-[30px] font-extrabold tracking-tight text-neutral-950">{title}</h1>
              <p className="mt-1 text-[15px] text-neutral-600">{subtitle}</p>
            </div>

            <div className="grid min-w-[420px] gap-2 sm:grid-cols-3">
              {[
                { label: "1 파일 올리기", active: currentStage === "1 파일 올리기" },
                { label: "2 캐릭터 칠하기", active: currentStage === "2 캐릭터 칠하기" },
                { label: "3 칼선 확인", active: currentStage === "3 칼선 확인" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={[
                    "rounded-2xl border px-4 py-3 text-center text-sm font-extrabold",
                    item.active
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-black/10 bg-[#f7f4ed] text-neutral-700",
                  ].join(" ")}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <div className="rounded-2xl border border-black/10 bg-[#f7f4ed] px-4 py-3">
              <div className="text-[11px] font-bold tracking-[0.18em] text-neutral-500">현재 단계</div>
              <div className="mt-1 text-base font-extrabold">{currentStage}</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#f7f4ed] px-4 py-3">
              <div className="text-[11px] font-bold tracking-[0.18em] text-neutral-500">현재 상태</div>
              <div className="mt-1 text-base font-extrabold">{currentStatus}</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#f7f4ed] px-4 py-3">
              <div className="text-[11px] font-bold tracking-[0.18em] text-neutral-500">다음 행동</div>
              <div className="mt-1 text-base font-extrabold">{nextAction}</div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
              {showAuxLinks ? (
                <>
                  <Link href="/workbench/keyring/brush-assist-lab" className="rounded-full border border-black/10 bg-[#f7f4ed] px-3 py-2 font-bold">
                    작업 실험실
                  </Link>
                  <Link href="/workbench/keyring/brush-assist-demo" className="rounded-full border border-black/10 bg-[#f7f4ed] px-3 py-2 font-bold">
                    간단 데모
                  </Link>
                </>
              ) : null}
              <span className="w-full text-right text-[10px] text-neutral-400">{DEPLOY_MARKER}</span>
            </div>
          </div>
        </header>

        <section className="mt-4 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm xl:sticky xl:top-[205px] xl:self-start">
            <div>
              <p className="text-sm font-extrabold text-neutral-950">왼쪽 · 파일 올리기</p>
              <p className="mt-1 text-xs text-neutral-500">여러 파일 중 지금 작업할 파일만 고르세요.</p>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex h-16 w-full items-center justify-center rounded-2xl bg-neutral-950 px-4 text-[18px] font-extrabold text-white shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
            >
              이미지 올리기
            </button>

            <div className="mt-4 max-h-[calc(100vh-420px)] space-y-2 overflow-y-auto pr-1">
              {uploads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/15 p-4 text-sm text-neutral-500">
                  아직 올린 파일이 없습니다
                </div>
              ) : (
                uploads.map((item) => {
                  const active = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveId(item.id);
                        setStrokes([]);
                      }}
                      className={[
                        "w-full rounded-2xl border px-3 py-3 text-left transition",
                        active
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-black/10 bg-[#faf9f6] text-neutral-900",
                      ].join(" ")}
                    >
                      <div className="truncate text-[15px] font-extrabold">{item.name}</div>
                      <div className={["mt-1 text-xs", active ? "text-white/80" : "text-neutral-500"].join(" ")}>{item.sizeLabel}</div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-neutral-950">가운데 · 캐릭터 칠하기</p>
                <p className="mt-1 text-xs text-neutral-500">캐릭터 부분만 러프하게 칠하면 됩니다. 정확히 따지지 않아도 괜찮아요.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">하늘색: 내가 칠한 영역</span>
                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">빨간선: 계산된 칼선</span>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[28px] border border-black/10 bg-[#0f172a]">
              <svg
                viewBox="0 0 100 100"
                className="h-[min(54vh,620px)] w-full touch-none"
                onPointerDown={startBrush}
                onPointerMove={moveBrush}
                onPointerUp={stopBrush}
                onPointerCancel={stopBrush}
                onPointerLeave={stopBrush}
              >
                <rect width="100" height="100" fill="#111827" />
                {activeUpload?.previewUrl ? (
                  <image href={activeUpload.previewUrl} x="0" y="0" width="100" height="100" preserveAspectRatio="none" opacity="0.96" />
                ) : null}
                {strokes.map((stroke, index) => (
                  <path
                    key={index}
                    d={buildBrushPath(stroke)}
                    fill="none"
                    stroke="#60a5fa"
                    strokeOpacity="0.82"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.6"
                  />
                ))}
                {cutline ? (
                  <path d={cutline.path} fill="rgba(244,63,94,0.08)" stroke="#e11d48" strokeWidth="0.9" strokeDasharray="1.3 1" />
                ) : null}
              </svg>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={clearBrush} className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-bold">
                칠한 표시 지우기
              </button>
              <div className="rounded-2xl border border-black/10 bg-[#f7f4ed] px-4 py-3 text-sm text-neutral-600">
                캐릭터 중심으로 러프하게 칠하고 바로 칼선 결과를 보세요.
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm xl:sticky xl:top-[205px] xl:self-start">
            <p className="text-sm font-extrabold text-neutral-950">오른쪽 · 칼선 결과</p>
            <p className="mt-1 text-xs text-neutral-500">실패해도 다시 칠하면 바로 갱신됩니다.</p>

            <div className="mt-4 rounded-2xl border border-black/10 bg-[#faf9f6] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-500">상태</span>
                <strong className="text-base">{canConfirm ? "칼선 확인 가능" : "분리 대기"}</strong>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-500">선택 파일</span>
                <strong className="max-w-[150px] truncate text-sm">{activeUpload?.name ?? "없음"}</strong>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-500">붓칠 횟수</span>
                <strong className="text-sm">{strokes.length}회</strong>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-black/10 bg-[#f7f4ed] p-4 text-sm font-bold text-neutral-700">
              {resultCopy}
            </div>

            <button
              type="button"
              className="mt-4 flex h-16 w-full items-center justify-center rounded-2xl bg-neutral-950 px-4 text-[18px] font-extrabold text-white shadow-[0_8px_20px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:bg-neutral-300"
              disabled={!canConfirm}
            >
              칼선 확인 완료
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
