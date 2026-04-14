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
  type SubjectAssistBox,
  buildStrokeSvgPath,
  buildSubjectAssistStrokeBounds,
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

function distance(a: BrushPoint, b: BrushPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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

      if (component.length > best.length) {
        best = component;
      }
    }
  }

  return best;
}

function buildContourFromMask(mask: boolean[][]) {
  const island = getLargestIsland(mask);
  if (island.length < 16) {
    return { points: [] as BrushPoint[], centroid: null as BrushPoint | null };
  }

  let sumX = 0;
  let sumY = 0;
  for (const point of island) {
    sumX += point.x;
    sumY += point.y;
  }
  const centroid = { x: sumX / island.length, y: sumY / island.length };

  const buckets = Array.from({ length: 120 }, () => null as { x: number; y: number; dist: number } | null);

  for (const point of island) {
    const y = point.y;
    const x = point.x;
    const isBoundary =
      !mask[y]?.[x - 1] ||
      !mask[y]?.[x + 1] ||
      !mask[y - 1]?.[x] ||
      !mask[y + 1]?.[x];

    if (!isBoundary) continue;

    const dx = x - centroid.x;
    const dy = y - centroid.y;
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    const sector = Math.min(buckets.length - 1, Math.floor((angle / (Math.PI * 2)) * buckets.length));
    const dist = Math.hypot(dx, dy);
    const current = buckets[sector];
    if (!current || dist > current.dist) {
      buckets[sector] = { x, y, dist };
    }
  }

  const points = buckets
    .filter((bucket): bucket is { x: number; y: number; dist: number } => Boolean(bucket))
    .map((bucket) => ({ x: bucket.x, y: bucket.y }));

  return {
    points,
    centroid,
  };
}

async function buildBrushAssistResult(
  sourceUrl: string,
  imageWidth: number,
  imageHeight: number,
  previewStroke: BrushPoint[],
) {
  const previewFrame = getPreviewFrame(imageWidth, imageHeight);

  return await new Promise<{
    maskedUrl: string | null;
    outlinePath: string;
    outlinePoints: BrushPoint[];
    bounds: SubjectAssistBox | null;
  }>((resolve) => {
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
          resolve({ maskedUrl: null, outlinePath: "", outlinePoints: [], bounds: null });
          return;
        }

        ctx.clearRect(0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        const imageData = ctx.getImageData(0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT);
        const data = imageData.data;

        let hasMeaningfulTransparency = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 0 && data[i] < 245) {
            hasMeaningfulTransparency = true;
            break;
          }
        }

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let borderCount = 0;
        const pushBorder = (x: number, y: number) => {
          const idx = (y * ANALYSIS_WIDTH + x) * 4;
          const a = data[idx + 3];
          if (a < 16) return;
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

        const candidateMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const idx = (y * ANALYSIS_WIDTH + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            if (a < 16) continue;

            if (hasMeaningfulTransparency) {
              candidateMask[y][x] = true;
              continue;
            }

            const brightness = (r + g + b) / 3;
            const chroma = Math.max(r, g, b) - Math.min(r, g, b);
            const distance = Math.hypot(r - meanR, g - meanG, b - meanB);

            candidateMask[y][x] = !(
              brightness >= Math.max(198, meanBrightness - 6) &&
              chroma <= 28 &&
              distance <= 54
            );
          }
        }

        const mappedStroke = mapStrokeToAnalysisSpace(
          previewStroke,
          previewFrame,
          { x: drawX, y: drawY, width: drawWidth, height: drawHeight },
        );
        const seedMask = collectStrokeSeedPixels(
          ANALYSIS_WIDTH,
          ANALYSIS_HEIGHT,
          mappedStroke,
          Math.max(4, Math.min(14, Math.min(drawWidth, drawHeight) * 0.05)),
        );
        const grownMask = growMaskFromSeeds(ANALYSIS_WIDTH, ANALYSIS_HEIGHT, candidateMask, seedMask);
        const mainIsland = getLargestIsland(grownMask);

        if (mainIsland.length < 24) {
          resolve({ maskedUrl: null, outlinePath: "", outlinePoints: [], bounds: null });
          return;
        }

        const keepMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        for (const point of mainIsland) {
          keepMask[point.y][point.x] = true;
        }

        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const idx = (y * ANALYSIS_WIDTH + x) * 4;
            if (!keepMask[y][x]) {
              data[idx + 3] = 0;
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const maskedUrl = canvas.toDataURL("image/png");
        const contour = buildContourFromMask(keepMask);
        const outlinePath = buildClosedLinePath(contour.points);
        const previewPoints = contour.points.map((point) => ({
          x: previewFrame.x + ((point.x - drawX) / Math.max(1, drawWidth)) * previewFrame.width,
          y: previewFrame.y + ((point.y - drawY) / Math.max(1, drawHeight)) * previewFrame.height,
        }));

        resolve({
          maskedUrl,
          outlinePath: buildClosedLinePath(previewPoints),
          outlinePoints: previewPoints,
          bounds: buildSubjectAssistStrokeBounds(previewStroke, 16),
        });
      } catch {
        resolve({ maskedUrl: null, outlinePath: "", outlinePoints: [], bounds: null });
      }
    };

    img.onerror = () => resolve({ maskedUrl: null, outlinePath: "", outlinePoints: [], bounds: null });
    img.src = sourceUrl;
  });
}

export default function KeyringBrushAssistDemoPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [brushMode, setBrushMode] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [draftStroke, setDraftStroke] = useState<BrushPoint[]>([]);
  const [appliedStroke, setAppliedStroke] = useState<BrushPoint[]>([]);
  const [maskedUrl, setMaskedUrl] = useState<string | null>(null);
  const [outlinePath, setOutlinePath] = useState("");
  const [status, setStatus] = useState("이미지를 올리고 캐릭터 위를 붓처럼 칠해라.");

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const previewFrame = useMemo(() => {
    if (!imageSize) return null;
    return getPreviewFrame(imageSize.width, imageSize.height);
  }, [imageSize]);

  const visibleStroke = draftStroke.length > 0 ? draftStroke : appliedStroke;

  const getPoint = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = surfaceRef.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * VIEW_WIDTH, 0, VIEW_WIDTH),
      y: clamp(((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT, 0, VIEW_HEIGHT),
    };
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setImageUrl(nextUrl);
    setImageName(file.name);
    setMaskedUrl(null);
    setOutlinePath("");
    setAppliedStroke([]);
    setDraftStroke([]);
    setStatus("업로드 완료 · 캐릭터 위를 대충 칠하듯 드래그해라.");

    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.src = nextUrl;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!brushMode || !imageUrl || !previewFrame) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    setDrawing(true);
    setDraftStroke([point]);
    setStatus("붓칠 중 · 캐릭터 위를 계속 이어서 드래그해라.");
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
    setStatus(nextStroke.length > 0 ? `붓칠 저장 · 점 ${nextStroke.length}개` : "붓칠이 너무 짧다.");
  };

  const runAssist = async () => {
    if (!imageUrl || !imageSize || appliedStroke.length === 0) {
      setStatus("업로드 후 붓칠을 먼저 해야 한다.");
      return;
    }

    setStatus("붓칠 기준으로 주제 분리 계산 중...");
    const result = await buildBrushAssistResult(imageUrl, imageSize.width, imageSize.height, appliedStroke);

    if (!result.maskedUrl || result.outlinePoints.length < 16) {
      setMaskedUrl(null);
      setOutlinePath("");
      setStatus("분리 실패 · 붓칠 범위를 더 넓게 다시 칠해라.");
      return;
    }

    setMaskedUrl(result.maskedUrl);
    setOutlinePath(result.outlinePath);
    setStatus(`분리 완료 · 외곽점 ${result.outlinePoints.length}개`);
  };

  return (
    <main className="min-h-screen bg-[#041129] px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-4">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4">
          <div className="text-[11px] font-semibold tracking-[0.28em] text-cyan-300">KEYRING / BRUSH ASSIST DEMO</div>
          <h1 className="mt-2 text-2xl font-bold">붓칠 기반 주제 분리 프로토타입</h1>
          <p className="mt-2 text-sm text-white/70">사각 박스 대신 캐릭터 위를 붓처럼 칠하면 그 시드를 기준으로 주제를 분리하고 외곽선을 잡는 실험 라우트</p>
        </section>

        <section className="grid gap-4 xl:grid-cols-[260px_minmax(760px,1fr)_360px]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold text-cyan-100">입력</div>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleUpload} />
            <div className="mt-4 grid gap-3">
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-2xl bg-[#a9d7ff] px-4 py-3 text-sm font-extrabold text-[#0a1730]">
                이미지 선택
              </button>
              <button type="button" onClick={() => setBrushMode((prev) => !prev)} className={`rounded-2xl border px-4 py-3 text-sm font-extrabold ${brushMode ? "border-cyan-300 bg-cyan-400/[0.15] text-cyan-100" : "border-white/10 bg-white/[0.03] text-white"}`}>
                {brushMode ? "붓칠 입력 켜짐" : "붓칠 입력 시작"}
              </button>
              <button type="button" onClick={runAssist} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-extrabold text-white">
                붓칠 기준 분리 적용
              </button>
              <button type="button" onClick={() => { setAppliedStroke([]); setDraftStroke([]); setMaskedUrl(null); setOutlinePath(""); setStatus("붓칠과 결과를 초기화했다."); }} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-extrabold text-white/80">
                초기화
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#000923] p-3 text-sm leading-6 text-white/72">
              <div>파일: {imageName || "없음"}</div>
              <div>붓칠 점: {appliedStroke.length}</div>
              <div>상태: {status}</div>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white/88">메인 작업면</div>
                <div className="mt-1 text-xs text-white/58">{brushMode ? "붓칠 입력 모드" : "보기 모드"}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70">560 x 640 기준</div>
            </div>

            <div
              ref={surfaceRef}
              className={`relative mx-auto aspect-[7/8] w-full max-w-[760px] overflow-hidden rounded-[28px] border bg-[#02091f] ${brushMode ? "cursor-crosshair border-cyan-300/40" : "border-white/10"}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerCancel={finishStroke}
              onPointerLeave={finishStroke}
            >
              <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="absolute inset-0 h-full w-full">
                <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} rx="28" fill="#041129" />
                <rect x="70" y="72" width="420" height="514" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />

                {imageUrl && previewFrame ? (
                  <image href={imageUrl} x={previewFrame.x} y={previewFrame.y} width={previewFrame.width} height={previewFrame.height} preserveAspectRatio="xMidYMid meet" />
                ) : null}

                {visibleStroke.length > 0 ? (
                  <>
                    <path d={buildStrokeSvgPath(visibleStroke)} fill="none" stroke="rgba(169,215,255,0.34)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={buildStrokeSvgPath(visibleStroke)} fill="none" stroke="#d7efff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ) : null}

                {outlinePath ? (
                  <path d={outlinePath} fill="none" stroke="#ff2b2b" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                ) : null}
              </svg>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold text-cyan-100">분리 결과</div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#000923] p-3">
              {maskedUrl ? (
                <img src={maskedUrl} alt="분리 결과" className="h-auto w-full rounded-xl border border-white/10 bg-[#02091f]" />
              ) : (
                <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/45">
                  결과 대기
                </div>
              )}
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-white/70">
              <div>사각 박스 대신 붓칠 입력 사용</div>
              <div>붓칠 시드 기준 연결 영역 확장</div>
              <div>가장 큰 덩어리만 남기고 외곽선 계산</div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
