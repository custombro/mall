"use client";

import Link from "next/link";
import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";

type HolePosition = {
  x: number;
  y: number;
};

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 640;
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

type ShapeMode = (typeof SHAPE_MODES)[number];
type Material = (typeof MATERIALS)[number];
type Thickness = (typeof THICKNESSES)[number];
type Ring = (typeof RINGS)[number];
type HoleSize = (typeof HOLE_SIZES)[number];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampHole(next: HolePosition): HolePosition {
  return {
    x: clamp(next.x, 186, 374),
    y: clamp(next.y, 92, 176),
  };
}

function getHoleVisualRadius(holeSize: HoleSize) {
  return holeSize === 3 ? 14 : 12;
}

function getShapeDescription(shapeMode: ShapeMode) {
  if (shapeMode === "원형") return "빠른 제작용 기본형 · 지름 기준";
  if (shapeMode === "사각형") return "빠른 제작용 기본형 · 가로/세로 기준";
  return "자유형 제작 · 외곽 인식 / 생산 검증 연결";
}

function getHoleLabel(holeSize: HoleSize) {
  return holeSize === 2.5 ? "2.5mm · 기본 O링용" : "3mm · O링 / 체인링 / 와이어링용";
}

function getHoleLimitLabel(holeSize: HoleSize) {
  return holeSize === 2.5 ? "최대 1.25mm 돌출 허용" : "최대 1.5mm 돌출 허용";
}

function renderBodyShape(shapeMode: ShapeMode, fillId: string) {
  if (shapeMode === "원형") {
    return (
      <ellipse
        cx="280"
        cy="344"
        rx="170"
        ry="220"
        fill={`url(#${fillId})`}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />
    );
  }

  if (shapeMode === "사각형") {
    return (
      <rect
        x="122"
        y="126"
        width="316"
        height="430"
        rx="64"
        fill={`url(#${fillId})`}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />
    );
  }

  return (
    <path
      d="M136 214C148 156 208 122 280 118C348 114 418 142 432 214C446 284 424 310 430 372C436 426 406 510 338 538C304 552 256 554 218 542C154 522 120 474 128 404C134 350 116 298 136 214Z"
      fill={`url(#${fillId})`}
      stroke="rgba(255,255,255,0.88)"
      strokeWidth="4"
      strokeLinejoin="round"
    />
  );
}

function KeyringCanvas({
  hole,
  mirrored,
  mini = false,
  shapeMode,
  holeSize,
}: {
  hole: HolePosition;
  mirrored: boolean;
  mini?: boolean;
  shapeMode: ShapeMode;
  holeSize: HoleSize;
}) {
  const displayX = mirrored ? VIEW_WIDTH - hole.x : hole.x;
  const title = mirrored ? "뒷면 반전 미리보기" : "정면 미리보기";
  const fillId = `${mini ? "cb_fill_mini" : "cb_fill_main"}_${shapeMode}`;
  const holeRadius = getHoleVisualRadius(holeSize);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd0ff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#1d2f47" stopOpacity="1" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} rx="28" fill="#041129" />
      {renderBodyShape(shapeMode, fillId)}

      <rect
        x="168"
        y="84"
        width="224"
        height="104"
        rx="30"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
      />

      <text
        x="280"
        y="126"
        textAnchor="middle"
        fill="rgba(255,255,255,0.86)"
        fontSize={mini ? "13" : "16"}
        fontWeight="700"
      >
        홀 이동 가능 범위
      </text>

      <circle cx={displayX} cy={hole.y} r={holeRadius + 8} fill="rgba(255,210,60,0.94)" />
      <circle cx={displayX} cy={hole.y} r={holeRadius} fill="#263247" />
      <circle cx={displayX} cy={hole.y} r="4" fill="#08111f" />

      {!mini ? (
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
            {mirrored ? "뒷면은 좌우 반전 기준으로 확인" : "구멍을 직접 드래그해서 조정"}
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
        </>
      ) : (
        <>
          <text
            x="280"
            y="54"
            textAnchor="middle"
            fill="rgba(255,255,255,0.95)"
            fontSize="21"
            fontWeight="800"
          >
            보조 미리보기
          </text>
          <text
            x="280"
            y="84"
            textAnchor="middle"
            fill="rgba(255,255,255,0.66)"
            fontSize="13"
            fontWeight="600"
          >
            {mirrored ? "뒷면 반전 보기" : "정면 동기화 보기"}
          </text>
        </>
      )}
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
  const [frontView, setFrontView] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [hole, setHole] = useState<HolePosition>({ x: 280, y: 124 });

  const unitPrice = useMemo(() => {
    let next = PRICE_BASE[shapeMode];
    if (material === "반투명 아크릴") next += 200;
    if (thickness === "5T") next += 300;
    if (ring !== "실버 링") next += 100;
    if (holeSize === 3) next += 100;
    return next;
  }, [holeSize, material, ring, shapeMode, thickness]);

  const totalPrice = unitPrice * quantity;

  const updateHole = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
    setHole(clampHole({ x, y }));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    updateHole(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateHole(event);
  };

  const stopDrag = () => {
    setDragging(false);
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
                키링 제작 / 형태·구멍 규격 1차 구조화
              </h1>
              <p className="mt-4 max-w-[980px] text-base leading-7 text-white/78">
                큰 미리보기는 우측 보조 카드로 축소하고, 좌측은 제작 세팅, 중앙은 작업판,
                우측은 주문 흐름으로 다시 고정했다. 이번 1차에서는 원형 / 사각형 / 자동칼선
                3모드와 구멍 2.5mm / 3mm 선택을 연결했다.
              </p>
            </div>

            <div className="grid w-full max-w-[340px] gap-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/76">
              <div>기본 인쇄: 업로드 1개 → 기본 양면 인쇄</div>
              <div>구멍 위치: 중앙 작업판에서 직접 드래그</div>
              <div>미리보기: 우측 상단 보조 카드에서 즉시 확인</div>
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

            {shapeMode === "자동칼선" ? (
              <div className="rounded-[20px] border border-[#7fbaff]/22 bg-[#08142d] p-4 text-sm leading-6 text-white/72">
                <div className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#8fc0ff]">자동칼선 3단 검증</div>
                <div>1. 업로드 원본 · 입력 준비</div>
                <div>2. 추출 실루엣 · 외곽 인식 확인</div>
                <div>3. 최종 생산 칼선 · 제작 가능 판정</div>
                <div className="mt-3 text-white/56">실제 자동 생성 엔진은 아직 TODO이며, 현재는 구조 연결 단계다.</div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/68">
                <div>미리보기는 보조 카드로 축소</div>
                <div>중앙 작업판이 실제 조정 본체</div>
                <div>뒷면 보기에서는 구멍 위치가 좌우 반전</div>
              </div>
            )}
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
            <div className="mb-2 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">CENTER / 중앙 작업판</div>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-[42px] font-extrabold leading-none tracking-tight text-white">
                  {shapeMode} 작업판
                </h2>
                <p className="mt-4 max-w-[780px] text-base leading-7 text-white/76">
                  점선 안내는 제거하고, 실제 조절이 필요한 중앙 작업판만 크게 남겼다.
                  형태 모드와 구멍 규격에 따라 제작 기준이 달라지며, 구멍은 상단 허용 범위 안에서 직접 움직인다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFrontView(true)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    frontView
                      ? "border-[#7fbaff] bg-[#95c9ff]/18 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.08]"
                  }`}
                >
                  정면 보기
                </button>
                <button
                  type="button"
                  onClick={() => setFrontView(false)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    !frontView
                      ? "border-[#7fbaff] bg-[#95c9ff]/18 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.08]"
                  }`}
                >
                  뒷면 보기
                </button>
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
                <div className="text-sm text-white/62">구멍을 잡고 드래그해서 위치를 조정</div>
              </div>

              <div className="h-[700px] w-full">
                <KeyringCanvas
                  hole={hole}
                  mirrored={!frontView}
                  shapeMode={shapeMode}
                  holeSize={holeSize}
                />
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="mb-4 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">RIGHT / 미리보기 · 주문</div>

            <div className="overflow-hidden rounded-[22px] border border-[#7fbaff]/30 bg-[#081630] shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <div className="text-[11px] font-bold tracking-[0.16em] text-[#8fc0ff]">보조 미리보기</div>
                  <div className="mt-1 text-sm font-semibold text-white">우측 상단 고정 확인 카드</div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white/74">
                  LIVE
                </div>
              </div>
              <div className="h-[148px] p-2">
                <KeyringCanvas
                  hole={hole}
                  mirrored={!frontView}
                  mini
                  shapeMode={shapeMode}
                  holeSize={holeSize}
                />
              </div>
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
              <div>형태: {shapeMode}</div>
              <div>자재: {material}</div>
              <div>두께: {thickness}</div>
              <div>링: {ring}</div>
              <div>인쇄: 기본 양면 인쇄</div>
              <div>구멍 규격: {getHoleLabel(holeSize)}</div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/68">
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
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-base font-extrabold text-white transition hover:bg-white/[0.08]"
              >
                주문으로
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}