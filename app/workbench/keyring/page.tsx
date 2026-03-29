"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

type HolePosition = {
  x: number;
  y: number;
};

type UploadState = {
  name: string;
  typeLabel: string;
  sizeLabel: string;
  previewUrl: string | null;
};

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 640;

const ART_FRAME = {
  x: 96,
  y: 118,
  width: 368,
  height: 444,
} as const;

const ELLIPSE = {
  cx: 280,
  cy: 344,
  rx: 170,
  ry: 220,
} as const;

const ROUNDED_RECT = {
  x: 122,
  y: 126,
  width: 316,
  height: 430,
  radius: 64,
} as const;

const PRICE_BASE = {
  원형: 3200,
  사각형: 3400,
  자동칼선: 3900,
} as const;

const SHAPE_MODES = ["원형", "사각형", "자동칼선"] as const;
const MATERIALS = ["투명 아크릴", "반투명 아크릴"] as const;
const THICKNESSES = ["3T", "5T"] as const;
const RINGS = ["실버 링", "골드 링", "볼체인"] as const;
const HOLE_SIZES = [2.5, 3] as const;
const PREVIEWABLE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

type ShapeMode = (typeof SHAPE_MODES)[number];
type Material = (typeof MATERIALS)[number];
type Thickness = (typeof THICKNESSES)[number];
type Ring = (typeof RINGS)[number];
type HoleSize = (typeof HOLE_SIZES)[number];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

function getHoleVisualRadius(holeSize: HoleSize) {
  return holeSize === 3 ? 14 : 12;
}

function getHoleLabel(holeSize: HoleSize) {
  return holeSize === 2.5 ? "2.5mm · 기본 O링용" : "3mm · O링 / 체인링 / 와이어링용";
}

function getHoleLimitLabel(holeSize: HoleSize) {
  return holeSize === 2.5 ? "최대 1.25mm 돌출 허용" : "최대 1.5mm 돌출 허용";
}

function getShapeDescription(shapeMode: ShapeMode) {
  if (shapeMode === "원형") return "구멍은 생성된 외곽선에 붙어서 이동";
  if (shapeMode === "사각형") return "구멍은 생성된 외곽선에 붙어서 이동";
  return "자동칼선은 현재 미구현 · 업로드 원본 위치만 확인";
}

function renderBodyShape(shapeMode: ShapeMode, fillId: string, strokeOnly = false) {
  const fillValue = strokeOnly ? "transparent" : `url(#${fillId})`;

  if (shapeMode === "원형") {
    return (
      <ellipse
        cx={ELLIPSE.cx}
        cy={ELLIPSE.cy}
        rx={ELLIPSE.rx}
        ry={ELLIPSE.ry}
        fill={fillValue}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />
    );
  }

  if (shapeMode === "사각형") {
    return (
      <rect
        x={ROUNDED_RECT.x}
        y={ROUNDED_RECT.y}
        width={ROUNDED_RECT.width}
        height={ROUNDED_RECT.height}
        rx={ROUNDED_RECT.radius}
        fill={fillValue}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />
    );
  }

  return null;
}

function renderClipShape(shapeMode: ShapeMode) {
  if (shapeMode === "원형") {
    return <ellipse cx={ELLIPSE.cx} cy={ELLIPSE.cy} rx={ELLIPSE.rx} ry={ELLIPSE.ry} />;
  }

  if (shapeMode === "사각형") {
    return (
      <rect
        x={ROUNDED_RECT.x}
        y={ROUNDED_RECT.y}
        width={ROUNDED_RECT.width}
        height={ROUNDED_RECT.height}
        rx={ROUNDED_RECT.radius}
      />
    );
  }

  return <rect x={ART_FRAME.x} y={ART_FRAME.y} width={ART_FRAME.width} height={ART_FRAME.height} rx="28" />;
}

function normalize(x: number, y: number) {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function projectHoleToEllipse(pointer: HolePosition, holeSize: HoleSize): HolePosition {
  const holeOffset = getHoleVisualRadius(holeSize) * 0.6 + 2;
  let dx = pointer.x - ELLIPSE.cx;
  let dy = pointer.y - ELLIPSE.cy;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    dx = 0;
    dy = -1;
  }

  const scale = 1 / Math.sqrt((dx * dx) / (ELLIPSE.rx * ELLIPSE.rx) + (dy * dy) / (ELLIPSE.ry * ELLIPSE.ry));
  const bx = ELLIPSE.cx + dx * scale;
  const by = ELLIPSE.cy + dy * scale;

  const n = normalize(
    (bx - ELLIPSE.cx) / (ELLIPSE.rx * ELLIPSE.rx),
    (by - ELLIPSE.cy) / (ELLIPSE.ry * ELLIPSE.ry),
  );

  return {
    x: bx + n.x * holeOffset,
    y: by + n.y * holeOffset,
  };
}

function projectHoleToRoundedRect(pointer: HolePosition, holeSize: HoleSize): HolePosition {
  const holeOffset = getHoleVisualRadius(holeSize) * 0.6 + 2;

  const halfW = ROUNDED_RECT.width / 2;
  const halfH = ROUNDED_RECT.height / 2;
  const innerW = halfW - ROUNDED_RECT.radius;
  const innerH = halfH - ROUNDED_RECT.radius;
  const cx = ROUNDED_RECT.x + halfW;
  const cy = ROUNDED_RECT.y + halfH;

  const px = pointer.x - cx;
  const py = pointer.y - cy;
  const ax = Math.abs(px);
  const ay = Math.abs(py);
  const sx = px >= 0 ? 1 : -1;
  const sy = py >= 0 ? 1 : -1;

  let anchorX = 0;
  let anchorY = 0;
  let normalX = 0;
  let normalY = 0;

  if (ax <= innerW && ay <= innerH) {
    const distX = halfW - ax;
    const distY = halfH - ay;
    if (distY <= distX) {
      anchorX = px;
      anchorY = sy * halfH;
      normalX = 0;
      normalY = sy;
    } else {
      anchorX = sx * halfW;
      anchorY = py;
      normalX = sx;
      normalY = 0;
    }
  } else if (ax <= innerW) {
    anchorX = px;
    anchorY = sy * halfH;
    normalX = 0;
    normalY = sy;
  } else if (ay <= innerH) {
    anchorX = sx * halfW;
    anchorY = py;
    normalX = sx;
    normalY = 0;
  } else {
    const ccx = sx * innerW;
    const ccy = sy * innerH;
    const dir = normalize(px - ccx, py - ccy);
    anchorX = ccx + dir.x * ROUNDED_RECT.radius;
    anchorY = ccy + dir.y * ROUNDED_RECT.radius;
    normalX = dir.x;
    normalY = dir.y;
  }

  return {
    x: cx + anchorX + normalX * holeOffset,
    y: cy + anchorY + normalY * holeOffset,
  };
}

function projectHole(pointer: HolePosition, holeSize: HoleSize, shapeMode: ShapeMode): HolePosition {
  if (shapeMode === "원형") {
    return projectHoleToEllipse(pointer, holeSize);
  }

  if (shapeMode === "사각형") {
    return projectHoleToRoundedRect(pointer, holeSize);
  }

  return {
    x: 280,
    y: 108,
  };
}

function KeyringCanvas({
  hole,
  shapeMode,
  holeSize,
  imageUrl,
}: {
  hole: HolePosition;
  shapeMode: ShapeMode;
  holeSize: HoleSize;
  imageUrl: string | null;
}) {
  const fillId = `cb_fill_${shapeMode}`;
  const clipId = `cb_clip_${shapeMode}`;
  const holeRadius = getHoleVisualRadius(holeSize);
  const hasUpload = Boolean(imageUrl);
  const autoCutlinePending = shapeMode === "자동칼선";

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="정면 작업판"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd0ff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#1d2f47" stopOpacity="1" />
        </linearGradient>
        <clipPath id={clipId}>{renderClipShape(shapeMode)}</clipPath>
      </defs>

      <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} rx="28" fill="#041129" />
      <rect x="70" y="72" width="420" height="514" rx="28" fill="rgba(0,0,0,0.16)" />

      {!autoCutlinePending ? (
        <>
          {renderBodyShape(shapeMode, fillId)}
          {hasUpload ? (
            <>
              <image
                href={imageUrl!}
                x={ART_FRAME.x}
                y={ART_FRAME.y}
                width={ART_FRAME.width}
                height={ART_FRAME.height}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${clipId})`}
              />
              {renderBodyShape(shapeMode, fillId, true)}
            </>
          ) : (
            <>
              <text
                x="280"
                y="334"
                textAnchor="middle"
                fill="rgba(255,255,255,0.96)"
                fontSize="34"
                fontWeight="800"
                letterSpacing="1.1"
              >
                {shapeMode} 작업판
              </text>
              <text
                x="280"
                y="384"
                textAnchor="middle"
                fill="rgba(255,255,255,0.78)"
                fontSize="20"
                fontWeight="500"
              >
                구멍은 외곽선에 붙어서 이동
              </text>
              <text
                x="280"
                y="420"
                textAnchor="middle"
                fill="rgba(255,255,255,0.64)"
                fontSize="16"
                fontWeight="600"
              >
                {getHoleLabel(holeSize)}
              </text>
              <text
                x="280"
                y="470"
                textAnchor="middle"
                fill="rgba(255,255,255,0.42)"
                fontSize="16"
                fontWeight="600"
              >
                이미지 업로드 대기
              </text>
            </>
          )}
        </>
      ) : (
        <>
          <rect
            x={ART_FRAME.x}
            y={ART_FRAME.y}
            width={ART_FRAME.width}
            height={ART_FRAME.height}
            rx="28"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2"
          />
          {hasUpload ? (
            <image
              href={imageUrl!}
              x={ART_FRAME.x}
              y={ART_FRAME.y}
              width={ART_FRAME.width}
              height={ART_FRAME.height}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <>
              <text
                x="280"
                y="334"
                textAnchor="middle"
                fill="rgba(255,255,255,0.96)"
                fontSize="34"
                fontWeight="800"
                letterSpacing="1.1"
              >
                자동칼선 작업판
              </text>
              <text
                x="280"
                y="384"
                textAnchor="middle"
                fill="rgba(255,255,255,0.78)"
                fontSize="20"
                fontWeight="500"
              >
                자동칼선은 현재 미구현
              </text>
              <text
                x="280"
                y="420"
                textAnchor="middle"
                fill="rgba(255,255,255,0.64)"
                fontSize="16"
                fontWeight="600"
              >
                업로드 원본 위치만 확인
              </text>
            </>
          )}
        </>
      )}

      <circle cx={hole.x} cy={hole.y} r={holeRadius + 8} fill="rgba(255,210,60,0.94)" />
      <circle cx={hole.x} cy={hole.y} r={holeRadius} fill="#263247" />
      <circle cx={hole.x} cy={hole.y} r="4" fill="#08111f" />
    </svg>
  );
}

function OptionButton({
  active,
  label,
  description,
  onClick,
  compact = false,
}: {
  active: boolean;
  label: string;
  description?: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border text-left transition",
        compact ? "px-4 py-3" : "px-4 py-4",
        active
          ? "border-[#7fbaff] bg-[#95c9ff]/18 text-white"
          : "border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08]",
      ].join(" ")}
    >
      <div className="text-sm font-semibold">{label}</div>
      {description ? <div className="mt-1 text-xs leading-5 text-white/58">{description}</div> : null}
    </button>
  );
}

export default function KeyringWorkbenchPage() {
  const [shapeMode, setShapeMode] = useState<ShapeMode>("원형");
  const [material, setMaterial] = useState<Material>("투명 아크릴");
  const [thickness, setThickness] = useState<Thickness>("3T");
  const [ring, setRing] = useState<Ring>("실버 링");
  const [holeSize, setHoleSize] = useState<HoleSize>(2.5);
  const [quantity, setQuantity] = useState(10);
  const [dragging, setDragging] = useState(false);
  const [hole, setHole] = useState<HolePosition>({ x: 280, y: 108 });
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [uploadGuide, setUploadGuide] = useState("실시간 미리보기 가능 형식: PNG / JPG / WEBP");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHole((prev) => projectHole(prev, holeSize, shapeMode));
  }, [holeSize, shapeMode]);

  useEffect(() => {
    return () => {
      if (uploadState?.previewUrl) {
        URL.revokeObjectURL(uploadState.previewUrl);
      }
    };
  }, [uploadState]);

  const unitPrice = useMemo(() => {
    let next = PRICE_BASE[shapeMode];
    if (material === "반투명 아크릴") next += 200;
    if (thickness === "5T") next += 300;
    if (ring !== "실버 링") next += 100;
    if (holeSize === 3) next += 100;
    return next;
  }, [holeSize, material, ring, shapeMode, thickness]);

  const totalPrice = unitPrice * quantity;
  const autoCutlinePending = shapeMode === "자동칼선";

  const updateHole = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (autoCutlinePending) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
    setHole(projectHole({ x, y }, holeSize, shapeMode));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (autoCutlinePending) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    updateHole(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || autoCutlinePending) return;
    updateHole(event);
  };

  const stopDrag = () => {
    setDragging(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setUploadState((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return null;
    });
    setUploadGuide("실시간 미리보기 가능 형식: PNG / JPG / WEBP");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewable = PREVIEWABLE_TYPES.includes(file.type as (typeof PREVIEWABLE_TYPES)[number]);
    const nextPreviewUrl = previewable ? URL.createObjectURL(file) : null;

    setUploadState((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return {
        name: file.name,
        typeLabel: file.type || "알 수 없는 형식",
        sizeLabel: formatFileSize(file.size),
        previewUrl: nextPreviewUrl,
      };
    });

    setUploadGuide(
      previewable
        ? "업로드 상태: 작업판에 즉시 반영됨"
        : "PDF / AI / PSD는 업로드 기록만 유지하고 실시간 미리보기는 생략"
    );
  };

  return (
    <main className="min-h-screen bg-[#041129] text-white">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white/90 transition hover:bg-white/10"
          >
            CUSTOMBRO HOME
          </Link>
        </div>

        <section className="mb-4 rounded-[28px] border border-white/10 bg-[#030b24] px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-[980px]">
              <div className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-[#8fb7ff]">상태창</div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                키링 제작 / 외곽선 추종 구멍 배치
              </h1>
              <p className="mt-4 max-w-[980px] text-base leading-7 text-white/78">
                업로드 후 작업판 글씨는 제거하고, 원형/사각형은 구멍이 외곽선에 붙어서 이동하도록 바꾼다.
                자동칼선은 현재 미구현이며 업로드 원본 위치만 확인한다.
              </p>
            </div>

            <div className="grid w-full max-w-[340px] gap-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/76">
              <div>업로드 후 작업판 글씨 제거</div>
              <div>원형/사각형은 구멍이 외곽선에 붙어 이동</div>
              <div>자동칼선은 현재 미구현</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="mb-4 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">LEFT / 제작 세팅</div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">형태 모드</div>
              <div className="grid gap-2">
                {SHAPE_MODES.map((item) => (
                  <OptionButton
                    key={item}
                    active={shapeMode === item}
                    label={item}
                    description={getShapeDescription(item)}
                    onClick={() => setShapeMode(item)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">자재</div>
              <div className="grid gap-2">
                {MATERIALS.map((item) => (
                  <OptionButton
                    key={item}
                    active={material === item}
                    label={item}
                    onClick={() => setMaterial(item)}
                    compact
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">두께</div>
              <div className="flex gap-2">
                {THICKNESSES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setThickness(item)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      thickness === item
                        ? "border-[#7fbaff] bg-[#95c9ff]/18 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">링 / 체결</div>
              <div className="grid gap-2">
                {RINGS.map((item) => (
                  <OptionButton
                    key={item}
                    active={ring === item}
                    label={item}
                    onClick={() => setRing(item)}
                    compact
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">구멍 규격</div>
              <div className="grid gap-2">
                {HOLE_SIZES.map((item) => (
                  <OptionButton
                    key={String(item)}
                    active={holeSize === item}
                    label={getHoleLabel(item)}
                    description={getHoleLimitLabel(item)}
                    onClick={() => setHoleSize(item)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/68">
              <div>업로드 후 작업판 글씨 제거</div>
              <div>원형/사각형은 구멍이 외곽선에 붙어 이동</div>
              <div>자동칼선은 현재 미구현</div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
            <div className="mb-2 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">CENTER / 중앙 작업판</div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-[42px] font-extrabold leading-none tracking-tight text-white">
                  {shapeMode} 작업판
                </h2>
                <p className="mt-4 max-w-[780px] text-base leading-7 text-white/76">
                  원형/사각형은 생성된 외곽선 기준으로 구멍이 따라 움직인다.
                  자동칼선은 현재 미구현이라 주문을 막고 업로드 원본 위치만 확인한다.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/72">
                {uploadState ? `업로드 파일: ${uploadState.name}` : "업로드 파일 대기"}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
                현재 구멍 좌표: X {Math.round(hole.x)} / Y {Math.round(hole.y)}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
                현재 규격: {getHoleLabel(holeSize)}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
                현재 형태: {shapeMode}
              </div>
            </div>

            <div
              className={`mt-4 overflow-hidden rounded-[28px] border ${
                dragging ? "border-[#7fbaff]/70" : "border-white/10"
              } bg-[#02091f] p-4 transition cursor-grab active:cursor-grabbing select-none`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onPointerLeave={stopDrag}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white/82">메인 작업대</div>
                <div className="text-sm text-white/62">
                  {autoCutlinePending ? "자동칼선은 현재 미구현" : "구멍은 외곽선에 붙어서 이동"}
                </div>
              </div>

              <div className="h-[700px] w-full">
                <KeyringCanvas
                  hole={hole}
                  shapeMode={shapeMode}
                  holeSize={holeSize}
                  imageUrl={uploadState?.previewUrl ?? null}
                />
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="mb-4 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">RIGHT / 업로드 · 제작 정보 · 주문</div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 text-sm font-semibold text-white/88">업로드 상태</div>
              <div className="mb-3 text-sm leading-6 text-white/70">{uploadGuide}</div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.ai,.psd"
                className="hidden"
                onChange={handleUploadChange}
              />

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="rounded-2xl bg-[#a9d7ff] px-4 py-4 text-base font-extrabold text-[#0a1730] transition hover:brightness-105"
                >
                  파일 선택
                </button>

                <button
                  type="button"
                  onClick={clearUpload}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-base font-extrabold text-white transition hover:bg-white/[0.08]"
                >
                  업로드 비우기
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#000923] p-4 text-sm leading-7 text-white/72">
                <div>실시간 미리보기 가능 형식: PNG / JPG / WEBP</div>
                <div>PDF / AI / PSD는 업로드 기록만 유지</div>
                <div>가능하면 투명 배경, 300dpi 기준</div>
              </div>

              {uploadState ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/72">
                  <div>파일명: {uploadState.name}</div>
                  <div>형식: {uploadState.typeLabel}</div>
                  <div>크기: {uploadState.sizeLabel}</div>
                  <div>작업판 반영: {uploadState.previewUrl ? "즉시 반영" : "기록만 유지"}</div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 text-sm font-semibold text-white/86">수량</div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.03] text-lg font-bold text-white/86 transition hover:bg-white/[0.08]"
                >
                  -
                </button>
                <div className="flex-1 rounded-2xl border border-white/10 bg-[#000923] px-4 py-3 text-center text-xl font-bold text-white">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.03] text-lg font-bold text-white/86 transition hover:bg-white/[0.08]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-white/68">
                <span>예상 단가</span>
                <strong className="text-3xl font-extrabold tracking-tight text-white">
                  {unitPrice.toLocaleString("ko-KR")}원
                </strong>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-white/68">
                <span>예상 합계</span>
                <strong className="text-4xl font-extrabold tracking-tight text-white">
                  {totalPrice.toLocaleString("ko-KR")}원
                </strong>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/72">
              <div className="mb-2 text-sm font-semibold text-white/88">제작 기준</div>
              <div>업로드 후 작업판 글씨 제거</div>
              <div>원형/사각형은 구멍이 외곽선에 붙어 이동</div>
              <div>자동칼선은 현재 미구현</div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/72">
              <div className="mb-2 text-sm font-semibold text-white/88">제작 정보</div>
              <div>형태: {shapeMode}</div>
              <div>자재: {material}</div>
              <div>두께: {thickness}</div>
              <div>링: {ring}</div>
              <div>인쇄: 기본 양면 인쇄</div>
              <div>구멍 규격: {getHoleLabel(holeSize)}</div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/68">
              <div className="mb-2 text-sm font-semibold text-white/88">업로드 기준</div>
              <div>PNG / PSD / PDF / AI 권장</div>
              <div>가능하면 투명 배경, 300dpi 기준</div>
              <div>자동칼선 계산은 이후 단계에서 별도 연결 예정</div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/68">
              <div className="mb-2 text-sm font-semibold text-white/88">운영 규칙</div>
              <div>기본 포장 포함</div>
              <div>수량 / 규격에 따라 자동 반영</div>
              <div>운영 규칙 적용</div>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                className="rounded-2xl bg-[#a9d7ff] px-4 py-4 text-base font-extrabold text-[#0a1730] transition hover:brightness-105"
              >
                서랍 저장
              </button>
              <button
                type="button"
                disabled={autoCutlinePending}
                className={`rounded-2xl px-4 py-4 text-base font-extrabold transition ${
                  autoCutlinePending
                    ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/40"
                    : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                }`}
              >
                {autoCutlinePending ? "칼선 생성 후 주문" : "주문으로"}
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}