"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { buildBrushPath, buildCutlineFromStrokeCloud, formatFileSize, type BrushStroke, type UploadItem } from "../brush-assist";

type Props = {
  showAuxLinks?: boolean;
  title?: string;
  subtitle?: string;
};

type UploadSession = UploadItem & {
  strokes: BrushStroke[];
  isConfirmed: boolean;
};

const DEPLOY_MARKER = "DEPLOY_KEYRING_BRUSH_MAIN_20260416_03";

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
  return { x: clamp(result.x, 0, 100), y: clamp(result.y, 0, 100) };
}

function getUploadStatus(upload: UploadSession) {
  if (upload.isConfirmed) return "확인 완료";
  if (upload.strokes.length > 0) return "작업 중";
  return "대기";
}

export default function BrushAssistWorkbench({
  showAuxLinks = true,
  title = "키링 칼선 작업대",
  subtitle = "이미지 올리고 캐릭터만 러프하게 칠한 뒤 바로 칼선을 확인하세요.",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploads, setUploads] = useState<UploadSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isBrushing, setIsBrushing] = useState(false);

  const activeUpload = useMemo(() => uploads.find((item) => item.id === activeId) ?? null, [uploads, activeId]);
  const strokes = activeUpload?.strokes ?? [];
  const isConfirmed = activeUpload?.isConfirmed ?? false;
  const cutline = useMemo(() => buildCutlineFromStrokeCloud(strokes), [strokes]);
  const canConfirm = Boolean(activeUpload) && strokes.length > 0;

  const currentStage = !activeUpload ? "1 파일 올리기" : strokes.length === 0 ? "2 캐릭터 칠하기" : "3 칼선 확인";
  const currentStatus = !activeUpload ? "준비됨" : isBrushing ? "칠하는 중" : isConfirmed ? "확인 완료" : canConfirm ? "칼선 확인 가능" : "붓칠 필요";
  const nextAction = !activeUpload ? "이미지 올리기" : isConfirmed ? "주문 단계로 이동" : canConfirm ? "칼선 확인 완료" : "캐릭터만 칠하기";

  const updateUpload = (id: string, updater: (current: UploadSession) => UploadSession) => {
    setUploads((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const timestamp = Date.now();
    const next = files.map((file, index) => ({
      id: `${file.name}-${file.size}-${timestamp}-${index}`,
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      strokes: [],
      isConfirmed: false,
    }));

    setUploads((prev) => [...prev, ...next]);
    setActiveId((prev) => prev ?? next[0]?.id ?? null);
    setIsBrushing(false);
    event.target.value = "";
  };

  const selectUpload = (id: string) => {
    setActiveId(id);
    setIsBrushing(false);
  };

  const clearBrush = () => {
    if (!activeId) return;
    updateUpload(activeId, (current) => ({ ...current, strokes: [], isConfirmed: false }));
    setIsBrushing(false);
  };

  const removeUpload = (id: string) => {
    const target = uploads.find((item) => item.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    const remaining = uploads.filter((item) => item.id !== id);
    setUploads(remaining);
    if (activeId === id) {
      setActiveId(remaining[0]?.id ?? null);
      setIsBrushing(false);
    }
  };

  const clearAllUploads = () => {
    for (const item of uploads) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    }
    setUploads([]);
    setActiveId(null);
    setIsBrushing(false);
  };

  const startBrush = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!activeId || !activeUpload?.previewUrl) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getSvgPoint(event);
    setIsBrushing(true);
    updateUpload(activeId, (current) => ({
      ...current,
      isConfirmed: false,
      strokes: [...current.strokes, { points: [point] }],
    }));
  };

  const moveBrush = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!isBrushing || !activeId) return;
    const point = getSvgPoint(event);
    updateUpload(activeId, (current) => {
      if (!current.strokes.length) return current;
      const nextStrokes = [...current.strokes];
      const latestStroke = nextStrokes[nextStrokes.length - 1];
      nextStrokes[nextStrokes.length - 1] = { points: [...latestStroke.points, point] };
      return { ...current, strokes: nextStrokes };
    });
  };

  const stopBrush = (event?: ReactPointerEvent<SVGSVGElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsBrushing(false);
  };

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
            <div className="grid w-full gap-2 sm:grid-cols-3 xl:min-w-[420px] xl:w-auto">
              {["1 파일 올리기", "2 캐릭터 칠하기", "3 칼선 확인"].map((label) => (
                <div
                  key={label}
                  className={[
                    "rounded-2xl border px-4 py-3 text-center text-sm font-extrabold",
                    currentStage === label ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/10 bg-[#f7f4ed] text-neutral-700",
                  ].join(" ")}
                >
                  {label}
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

        <section className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <aside className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm xl:sticky xl:top-[205px] xl:self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-neutral-950">왼쪽 · 파일 올리기</p>
                <p className="mt-1 text-xs text-neutral-500">여러 파일을 한 번에 올리고, 파일별 붓칠 상태를 따로 유지합니다.</p>
              </div>
              {uploads.length > 0 ? (
                <button type="button" onClick={clearAllUploads} className="rounded-full border border-black/10 bg-[#f7f4ed] px-3 py-2 text-[11px] font-bold text-neutral-700">
                  전체 비우기
                </button>
              ) : null}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 flex h-16 w-full items-center justify-center rounded-2xl bg-neutral-950 px-4 text-[18px] font-extrabold text-white shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
              이미지 올리기
            </button>
            <div className="mt-4 max-h-[calc(100vh-420px)] space-y-3 overflow-y-auto pr-1">
              {uploads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/15 p-4 text-sm text-neutral-500">아직 올린 파일이 없습니다</div>
              ) : (
                uploads.map((item) => {
                  const active = activeId === item.id;
                  const status = getUploadStatus(item);
                  return (
                    <div key={item.id} className={["rounded-2xl border p-3 transition", active ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/10 bg-[#faf9f6] text-neutral-900"].join(" ")}>
                      <button type="button" onClick={() => selectUpload(item.id)} className="flex w-full items-center gap-3 text-left">
                        {item.previewUrl ? (
                          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-black/10 bg-white/70">
                            <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white/70 text-[10px] font-bold">
                            미리보기
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-extrabold">{item.name}</div>
                          <div className={["mt-1 text-xs", active ? "text-white/80" : "text-neutral-500"].join(" ")}>{item.sizeLabel}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={["rounded-full px-2.5 py-1 text-[11px] font-bold", active ? "border border-white/20 bg-white/10 text-white" : "border border-black/10 bg-white text-neutral-700"].join(" ")}>
                              {status}
                            </span>
                            <span className={["text-[11px]", active ? "text-white/70" : "text-neutral-500"].join(" ")}>붓칠 {item.strokes.length}회</span>
                          </div>
                        </div>
                      </button>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => selectUpload(item.id)} className={["flex-1 rounded-2xl px-3 py-2 text-xs font-extrabold", active ? "bg-white/10 text-white" : "border border-black/10 bg-white text-neutral-900"].join(" ")}>
                          {active ? "현재 작업 중" : "이 파일 작업"}
                        </button>
                        <button type="button" onClick={() => removeUpload(item.id)} className={["rounded-2xl px-3 py-2 text-xs font-extrabold", active ? "border border-white/20 text-white/90" : "border border-black/10 bg-white text-neutral-700"].join(" ")}>
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <section className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-neutral-950">가운데 · 캐릭터 칠하기</p>
                <p className="mt-1 text-xs text-neutral-500">캐릭터 부분만 러프하게 칠하면 됩니다. 파일을 바꿔도 이전 붓칠은 그대로 남습니다.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">하늘색: 내가 칠한 영역</span>
                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">빨간선: 계산된 칼선</span>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-[28px] border border-black/10 bg-[#0f172a]">
              <svg viewBox="0 0 100 100" className="h-[min(54vh,620px)] w-full touch-none" onPointerDown={startBrush} onPointerMove={moveBrush} onPointerUp={stopBrush} onPointerCancel={stopBrush} onPointerLeave={stopBrush}>
                <rect width="100" height="100" fill="#111827" />
                {activeUpload?.previewUrl ? <image href={activeUpload.previewUrl} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" opacity="0.98" /> : null}
                {strokes.map((stroke, index) => <path key={index} d={buildBrushPath(stroke)} fill="none" stroke="#60a5fa" strokeOpacity="0.82" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />)}
                {cutline ? <path d={cutline.path} fill="rgba(244,63,94,0.08)" stroke="#e11d48" strokeWidth="0.9" strokeDasharray="1.3 1" /> : null}
              </svg>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={clearBrush} className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-bold">현재 파일 붓칠 지우기</button>
              <div className="rounded-2xl border border-black/10 bg-[#f7f4ed] px-4 py-3 text-sm text-neutral-600">{activeUpload ? "캐릭터 중심으로 러프하게 칠하면 스무딩된 윤곽선으로 바로 갱신됩니다." : "먼저 작업할 이미지를 선택해 주세요."}</div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm xl:sticky xl:top-[205px] xl:self-start">
            <p className="text-sm font-extrabold text-neutral-950">오른쪽 · 칼선 결과</p>
            <p className="mt-1 text-xs text-neutral-500">파일별 상태와 윤곽 결과를 따로 보고 확정할 수 있습니다.</p>
            <div className="mt-4 rounded-2xl border border-black/10 bg-[#faf9f6] p-4">
              <div className="flex items-center justify-between gap-3"><span className="text-sm text-neutral-500">상태</span><strong className="text-base">{isConfirmed ? "확인 완료" : canConfirm ? "칼선 확인 가능" : "분리 대기"}</strong></div>
              <div className="mt-3 flex items-center justify-between gap-3"><span className="text-sm text-neutral-500">선택 파일</span><strong className="max-w-[150px] truncate text-sm">{activeUpload?.name ?? "없음"}</strong></div>
              <div className="mt-3 flex items-center justify-between gap-3"><span className="text-sm text-neutral-500">붓칠 횟수</span><strong className="text-sm">{strokes.length}회</strong></div>
              <div className="mt-3 flex items-center justify-between gap-3"><span className="text-sm text-neutral-500">윤곽 방식</span><strong className="text-sm">{cutline ? (cutline.shape === "smoothed-hull" ? "스무딩 윤곽" : "라운드 박스") : "대기"}</strong></div>
              <div className="mt-3 flex items-center justify-between gap-3"><span className="text-sm text-neutral-500">예상 크기</span><strong className="text-sm">{cutline ? `${Math.max(1, Math.round(cutline.bounds.width))} × ${Math.max(1, Math.round(cutline.bounds.height))}` : "대기"}</strong></div>
              <div className="mt-3 flex items-center justify-between gap-3"><span className="text-sm text-neutral-500">윤곽 포인트</span><strong className="text-sm">{cutline?.pointCount ?? 0}개</strong></div>
            </div>
            <div className="mt-3 rounded-2xl border border-black/10 bg-[#f7f4ed] p-4 text-sm font-bold text-neutral-700">{!activeUpload ? "파일을 올리면 여기서 바로 결과를 볼 수 있어요." : isConfirmed ? "이 파일은 칼선 확인을 마쳤습니다. 다른 파일도 이어서 작업할 수 있어요." : canConfirm ? "현재 파일은 칼선 기준이 준비되었습니다." : "캐릭터 부분을 러프하게 칠해 주세요."}</div>
            <button type="button" onClick={() => { if (!canConfirm || !activeId) return; updateUpload(activeId, (current) => ({ ...current, isConfirmed: true })); }} className="mt-4 flex h-16 w-full items-center justify-center rounded-2xl bg-neutral-950 px-4 text-[18px] font-extrabold text-white shadow-[0_8px_20px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:bg-neutral-300" disabled={!canConfirm}>{isConfirmed ? "칼선 확인 완료됨" : "칼선 확인 완료"}</button>
          </aside>
        </section>
      </div>
    </main>
  );
}
