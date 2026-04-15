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

export default function BrushAssistWorkbench({
  showAuxLinks = true,
  title = "키링 칼선 작업",
  subtitle = "파일 올리고, 캐릭터만 대충 칠하면 칼선을 바로 확인할 수 있어요.",
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

  const status = !activeUpload
    ? "파일을 먼저 올려주세요"
    : isBrushing
      ? "캐릭터만 칠하는 중"
      : strokes.length > 0
        ? "칠한 영역 기준 칼선 준비 완료"
        : "캐릭터 부분을 대충 칠해 주세요";

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
    event.target.value = "";
  };

  const clearBrush = () => setStrokes([]);

  const startBrush = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!activeUpload?.previewUrl) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setIsBrushing(true);
    setStrokes((prev) => [...prev, { points: [{ x, y }] }]);
  };

  const moveBrush = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!isBrushing) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setStrokes((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      const latest = next[next.length - 1];
      next[next.length - 1] = { points: [...latest.points, { x, y }] };
      return next;
    });
  };

  const stopBrush = () => setIsBrushing(false);

  return (
    <main className="min-h-screen bg-[#f5f4f1] text-neutral-900">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">KEYRING WORKBENCH</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-neutral-900 px-3 py-1 font-semibold text-white">1 파일 올리기</span>
              <span className="rounded-full border border-black/15 px-3 py-1">2 캐릭터만 칠하기</span>
              <span className="rounded-full border border-black/15 px-3 py-1">3 칼선 확인</span>
            </div>
          </div>
          {showAuxLinks ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
              <span>보조 화면</span>
              <Link className="rounded-full border border-black/10 bg-[#f8f4ec] px-3 py-1" href="/workbench/keyring/brush-assist-lab">작업 실험실</Link>
              <Link className="rounded-full border border-black/10 bg-[#f8f4ec] px-3 py-1" href="/workbench/keyring/brush-assist-demo">간단 데모</Link>
              <span className="ml-auto text-[11px] text-neutral-400">{DEPLOY_MARKER}</span>
            </div>
          ) : null}
        </header>

        <section className="mt-4 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold">왼쪽 · 파일 올리기</p>
            <p className="mt-1 text-xs text-neutral-500">여러 파일을 올린 뒤, 지금 작업할 파일을 선택하세요.</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
            >
              이미지 올리기
            </button>
            <div className="mt-3 space-y-2">
              {uploads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/15 p-3 text-xs text-neutral-500">아직 올린 파일이 없습니다</div>
              ) : (
                uploads.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveId(item.id);
                      setStrokes([]);
                    }}
                    className={`w-full rounded-2xl border px-3 py-2 text-left text-sm ${
                      activeId === item.id ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-[#faf9f6]"
                    }`}
                  >
                    <div className="truncate font-medium">{item.name}</div>
                    <div className={`text-xs ${activeId === item.id ? "text-white/75" : "text-neutral-500"}`}>{item.sizeLabel}</div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">가운데 · 캐릭터 칠하기</p>
              <span className="rounded-full bg-[#f7f3e9] px-3 py-1 text-xs">{isBrushing ? "붓칠 중" : "붓칠 대기"}</span>
            </div>
            <p className="mb-3 text-xs text-neutral-500">캐릭터 영역만 러프하게 칠하면 됩니다. 정확히 따지지 않아도 괜찮아요.</p>
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-[#0f172a]">
              <svg
                viewBox="0 0 100 100"
                className="aspect-square w-full touch-none"
                onPointerDown={startBrush}
                onPointerMove={moveBrush}
                onPointerUp={stopBrush}
                onPointerLeave={stopBrush}
              >
                <rect width="100" height="100" fill="#111827" />
                {activeUpload?.previewUrl ? (
                  <image href={activeUpload.previewUrl} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" opacity="0.92" />
                ) : null}
                {strokes.map((stroke, index) => (
                  <path
                    key={index}
                    d={buildBrushPath(stroke)}
                    fill="none"
                    stroke="#38bdf8"
                    strokeOpacity="0.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.4"
                  />
                ))}
                {cutline ? (
                  <path d={cutline.path} fill="rgba(244,63,94,0.08)" stroke="#f43f5e" strokeWidth="0.9" strokeDasharray="1.3 1" />
                ) : null}
              </svg>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={clearBrush} className="rounded-xl border border-black/10 px-3 py-2 text-sm">칠한 표시 지우기</button>
              <div className="rounded-xl border border-black/10 bg-[#f8f4ec] px-3 py-2 text-xs text-neutral-600">하늘색: 내가 칠한 영역 · 빨간선: 계산된 칼선</div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold">오른쪽 · 칼선 결과</p>
            <p className="mt-1 text-xs text-neutral-500">실패해도 다시 칠하면 바로 갱신됩니다.</p>
            <div className="mt-3 rounded-2xl border border-black/10 bg-[#faf9f6] p-3 text-sm">
              <div className="flex items-center justify-between"><span>상태</span><strong>{cutline ? "칼선 확인 가능" : "분리 대기"}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span>선택 파일</span><strong className="max-w-[140px] truncate">{activeUpload?.name ?? "없음"}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span>붓칠 횟수</span><strong>{strokes.length}회</strong></div>
            </div>
            <div className="mt-3 rounded-2xl border border-black/10 p-3 text-xs text-neutral-600">{status}</div>
            <button
              type="button"
              className="mt-3 w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
              disabled={!cutline}
            >
              칼선 확인 완료
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
