"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  type BrushPoint,
  buildStrokeSvgPath,
  clamp,
  collectStrokeSeedPixels,
  growMaskFromSeeds,
  mapStrokeToAnalysisSpace,
  simplifyBrushPoints,
} from "../brush-assist";

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 640;
const ANALYSIS_WIDTH = 184;
const ANALYSIS_HEIGHT = 222;

type UploadItem = {
  id: string;
  name: string;
  sizeLabel: string;
  typeLabel: string;
  previewUrl: string;
  width: number;
  height: number;
};

function distance(a: BrushPoint, b: BrushPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

function getPreviewFrame(width: number, height: number) {
  const frameWidth = 392;
  const frameHeight = 470;
  const scale = Math.min(frameWidth / width, frameHeight / height);
  const drawWidth = Math.max(1, width * scale);
  const drawHeight = Math.max(1, height * scale);
  return {
    x: (VIEW_WIDTH - drawWidth) / 2,
    y: (VIEW_HEIGHT - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };
}

function buildClosedLinePath(points: BrushPoint[]) {
  if (points.length === 0) return "";
  return `M ${points.map((point, index) => `${index === 0 ? "" : "L "}${point.x} ${point.y}`).join(" ")} Z`;
}

function getLargestIsland(mask: boolean[][]) {
  const height = mask.length;
  const width = mask[0]?.length ?? 0;
  const visited: boolean[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => false));
  const neighbors = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
  ] as const;

  let best: BrushPoint[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!mask[y][x] || visited[y][x]) continue;
      const queue: Array<{ x: number; y: number }> = [{ x, y }];
      const component: BrushPoint[] = [];
      let head = 0;
      visited[y][x] = true;

      while (head < queue.length) {
        const current = queue[head];
        head += 1;
        component.push({ x: current.x, y: current.y });

        for (const next of neighbors) {
          const nx = current.x + next.x;
          const ny = current.y + next.y;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (visited[ny][nx] || !mask[ny][nx]) continue;
          visited[ny][nx] = true;
          queue.push({ x: nx, y: ny });
        }
      }

      if (component.length > best.length) best = component;
    }
  }

  return best;
}

function buildContourFromMask(mask: boolean[][]) {
  const island = getLargestIsland(mask);
  if (island.length < 16) return [] as BrushPoint[];

  let sumX = 0;
  let sumY = 0;
  for (const point of island) {
    sumX += point.x;
    sumY += point.y;
  }
  const centroid = { x: sumX / island.length, y: sumY / island.length };
  const buckets = Array.from({ length: 120 }, () => null as { x: number; y: number; dist: number } | null);

  for (const point of island) {
    const x = point.x;
    const y = point.y;
    const isBoundary = !mask[y]?.[x - 1] || !mask[y]?.[x + 1] || !mask[y - 1]?.[x] || !mask[y + 1]?.[x];
    if (!isBoundary) continue;

    let angle = Math.atan2(y - centroid.y, x - centroid.x);
    if (angle < 0) angle += Math.PI * 2;
    const sector = Math.min(buckets.length - 1, Math.floor((angle / (Math.PI * 2)) * buckets.length));
    const dist = Math.hypot(x - centroid.x, y - centroid.y);
    const current = buckets[sector];
    if (!current || dist > current.dist) {
      buckets[sector] = { x, y, dist };
    }
  }

  return buckets.filter(Boolean).map((bucket) => ({ x: bucket!.x, y: bucket!.y }));
}

async function loadImageSize(url: string) {
  return await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    img.src = url;
  });
}

async function runBrushAssist(sourceUrl: string, width: number, height: number, previewStroke: BrushPoint[]) {
  const previewFrame = getPreviewFrame(width, height);

  return await new Promise<{ maskedUrl: string | null; outlinePath: string }>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const analysisScale = Math.min(ANALYSIS_WIDTH / img.width, ANALYSIS_HEIGHT / img.height);
        const drawWidth = Math.max(1, img.width * analysisScale);
        const drawHeight = Math.max(1, img.height * analysisScale);
        const drawX = (ANALYSIS_WIDTH - drawWidth) / 2;
        const drawY = (ANALYSIS_HEIGHT - drawHeight) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = ANALYSIS_WIDTH;
        canvas.height = ANALYSIS_HEIGHT;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve({ maskedUrl: null, outlinePath: "" });
          return;
        }

        ctx.clearRect(0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        const imageData = ctx.getImageData(0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT);
        const data = imageData.data;

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let borderCount = 0;
        const pushBorder = (x: number, y: number) => {
          const idx = (y * ANALYSIS_WIDTH + x) * 4;
          if (data[idx + 3] < 16) return;
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
          borderCount += 1;
        };

        for (let x = 0; x < ANALYSIS_WIDTH; x += 2) {
          pushBorder(x, 0);
          pushBorder(x, ANALYSIS_HEIGHT - 1);
        }
        for (let y = 1; y < ANALYSIS_HEIGHT - 1; y += 2) {
          pushBorder(0, y);
          pushBorder(ANALYSIS_WIDTH - 1, y);
        }

        const meanR = borderCount > 0 ? sumR / borderCount : 245;
        const meanG = borderCount > 0 ? sumG / borderCount : 245;
        const meanB = borderCount > 0 ? sumB / borderCount : 245;
        const meanBrightness = (meanR + meanG + meanB) / 3;

        const candidateMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () => Array.from({ length: ANALYSIS_WIDTH }, () => false));
        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const idx = (y * ANALYSIS_WIDTH + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            if (a < 16) continue;
            const brightness = (r + g + b) / 3;
            const chroma = Math.max(r, g, b) - Math.min(r, g, b);
            const dist = Math.hypot(r - meanR, g - meanG, b - meanB);
            candidateMask[y][x] = !(brightness >= Math.max(198, meanBrightness - 6) && chroma <= 28 && dist <= 54);
          }
        }

        const mappedStroke = mapStrokeToAnalysisSpace(previewStroke, previewFrame, { x: drawX, y: drawY, width: drawWidth, height: drawHeight });
        const seedMask = collectStrokeSeedPixels(
          ANALYSIS_WIDTH,
          ANALYSIS_HEIGHT,
          mappedStroke,
          Math.max(4, Math.min(14, Math.min(drawWidth, drawHeight) * 0.05)),
        );
        const grownMask = growMaskFromSeeds(ANALYSIS_WIDTH, ANALYSIS_HEIGHT, candidateMask, seedMask);
        const island = getLargestIsland(grownMask);

        if (island.length < 24) {
          resolve({ maskedUrl: null, outlinePath: "" });
          return;
        }

        const keepMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () => Array.from({ length: ANALYSIS_WIDTH }, () => false));
        for (const point of island) keepMask[point.y][point.x] = true;

        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const idx = (y * ANALYSIS_WIDTH + x) * 4;
            if (!keepMask[y][x]) data[idx + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const contour = buildContourFromMask(keepMask);
        const previewPoints = contour.map((point) => ({
          x: previewFrame.x + ((point.x - drawX) / Math.max(1, drawWidth)) * previewFrame.width,
          y: previewFrame.y + ((point.y - drawY) / Math.max(1, drawHeight)) * previewFrame.height,
        }));

        resolve({
          maskedUrl: canvas.toDataURL("image/png"),
          outlinePath: buildClosedLinePath(previewPoints),
        });
      } catch {
        resolve({ maskedUrl: null, outlinePath: "" });
      }
    };

    img.onerror = () => resolve({ maskedUrl: null, outlinePath: "" });
    img.src = sourceUrl;
  });
}

export default function KeyringBrushAssistLabPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [brushMode, setBrushMode] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [draftStroke, setDraftStroke] = useState<BrushPoint[]>([]);
  const [appliedStroke, setAppliedStroke] = useState<BrushPoint[]>([]);
  const [maskedUrl, setMaskedUrl] = useState<string | null>(null);
  const [outlinePath, setOutlinePath] = useState("");
  const [status, setStatus] = useState("여러 파일 업로드 가능");

  const activeItem = useMemo(() => items.find((item) => item.id === activeId) ?? items[0] ?? null, [items, activeId]);
  const visibleStroke = draftStroke.length > 0 ? draftStroke : appliedStroke;
  const previewFrame = useMemo(() => activeItem ? getPreviewFrame(activeItem.width, activeItem.height) : null, [activeItem]);

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [items]);

  const getPoint = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = surfaceRef.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * VIEW_WIDTH, 0, VIEW_WIDTH),
      y: clamp(((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT, 0, VIEW_HEIGHT),
    };
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextItems: UploadItem[] = [];
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      try {
        const size = await loadImageSize(previewUrl);
        nextItems.push({
          id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${file.name}-${file.size}-${file.lastModified}`,
          name: file.name,
          sizeLabel: formatFileSize(file.size),
          typeLabel: file.type || "image/*",
          previewUrl,
          width: size.width,
          height: size.height,
        });
      } catch {
        URL.revokeObjectURL(previewUrl);
      }
    }

    if (nextItems.length === 0) return;
    setItems((prev) => [...prev, ...nextItems]);
    setActiveId(nextItems[0].id);
    setAppliedStroke([]);
    setDraftStroke([]);
    setMaskedUrl(null);
    setOutlinePath("");
    setStatus(`업로드 ${nextItems.length}개 완료`);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!brushMode || !activeItem || !previewFrame) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    setDrawing(true);
    setDraftStroke([point]);
    setStatus("붓칠 중");
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawing) return;
    const point = getPoint(event);
    setDraftStroke((prev) => {
      const last = prev[prev.length - 1];
      if (last && distance(last, point) < 3.5) return prev;
      return [...prev, point];
    });
  };

  const finishStroke = () => {
    if (!drawing) return;
    setDrawing(false);
    const nextStroke = simplifyBrushPoints(draftStroke, 4.5);
    setAppliedStroke(nextStroke);
    setDraftStroke([]);
    setStatus(nextStroke.length > 0 ? `붓칠 저장 ${nextStroke.length}점` : "붓칠 짧음");
  };

  const runAssistForActive = async () => {
    if (!activeItem || appliedStroke.length === 0) {
      setStatus("파일/붓칠 필요");
      return;
    }
    setStatus("계산 중");
    const result = await runBrushAssist(activeItem.previewUrl, activeItem.width, activeItem.height, appliedStroke);
    setMaskedUrl(result.maskedUrl);
    setOutlinePath(result.outlinePath);
    setStatus(result.maskedUrl ? "분리 완료" : "분리 실패");
  };

  const selectItem = (id: string) => {
    setActiveId(id);
    setAppliedStroke([]);
    setDraftStroke([]);
    setMaskedUrl(null);
    setOutlinePath("");
    setStatus("작업 파일 선택됨");
  };

  return (
    <main className="min-h-screen bg-[#041129] px-4 py-6 text-white">
      <div className="mx-auto grid w-full max-w-[1640px] gap-4 xl:grid-cols-[320px_minmax(760px,1fr)_360px]">
        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-sm font-semibold text-cyan-100">업로드</div>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleUpload} />
          <div className="mt-4 grid gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-2xl bg-[#a9d7ff] px-4 py-3 text-sm font-extrabold text-[#0a1730]">여러 파일 선택</button>
            <button type="button" onClick={() => setBrushMode((prev) => !prev)} className={`rounded-2xl border px-4 py-3 text-sm font-extrabold ${brushMode ? "border-cyan-300 bg-cyan-400/[0.15] text-cyan-100" : "border-white/10 bg-white/[0.03] text-white"}`}>{brushMode ? "붓칠 켜짐" : "붓칠 시작"}</button>
            <button type="button" onClick={runAssistForActive} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-extrabold text-white">선택 파일 분리</button>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#000923] p-3 text-sm leading-6 text-white/72">
            <div>상태: {status}</div>
            <div>선택 파일: {activeItem?.name ?? "없음"}</div>
            <div>붓칠 점: {appliedStroke.length}</div>
          </div>
          <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
            {items.map((item, index) => {
              const active = item.id === activeItem?.id;
              return (
                <button key={item.id} type="button" onClick={() => selectItem(item.id)} className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${active ? "border-[#7fbaff] bg-[#95c9ff]/18 text-white" : "border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08]"}`}>
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#000923]">
                    <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{item.name}</div>
                    <div className="mt-1 text-xs text-white/55">{item.typeLabel} · {item.sizeLabel}</div>
                  </div>
                  <div className={`rounded-full px-2 py-1 text-[10px] font-semibold ${active ? "bg-[#a9d7ff] text-[#0a1730]" : "bg-white/10 text-white/55"}`}>{active ? "작업중" : `#${index + 1}`}</div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white/88">브러시 작업면</div>
              <div className="mt-1 text-xs text-white/58">{brushMode ? "붓칠 입력 모드" : "보기 모드"}</div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70">560 x 640</div>
          </div>
          <div ref={surfaceRef} className={`relative mx-auto aspect-[7/8] w-full max-w-[760px] overflow-hidden rounded-[28px] border bg-[#02091f] ${brushMode ? "cursor-crosshair border-cyan-300/40" : "border-white/10"}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finishStroke} onPointerCancel={finishStroke} onPointerLeave={finishStroke}>
            <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="absolute inset-0 h-full w-full">
              <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} rx="28" fill="#041129" />
              <rect x="70" y="72" width="420" height="514" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
              {activeItem && previewFrame ? <image href={activeItem.previewUrl} x={previewFrame.x} y={previewFrame.y} width={previewFrame.width} height={previewFrame.height} preserveAspectRatio="xMidYMid meet" /> : null}
              {visibleStroke.length > 0 ? <><path d={buildStrokeSvgPath(visibleStroke)} fill="none" stroke="rgba(169,215,255,0.34)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" /><path d={buildStrokeSvgPath(visibleStroke)} fill="none" stroke="#d7efff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></> : null}
              {outlinePath ? <path d={outlinePath} fill="none" stroke="#ff2b2b" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /> : null}
            </svg>
          </div>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-sm font-semibold text-cyan-100">분리 결과</div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#000923] p-3">
            {maskedUrl ? <img src={maskedUrl} alt="분리 결과" className="h-auto w-full rounded-xl border border-white/10 bg-[#02091f]" /> : <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/45">결과 대기</div>}
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-white/70">
            <div>다중 업로드</div>
            <div>선택 파일 작업</div>
            <div>붓칠 기반 분리</div>
          </div>
        </aside>
      </div>
    </main>
  );
}
