"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type HoleSizeMm = 2 | 2.5 | 3;

type HoleDraft = {
  id: string;
  x: number;
  y: number;
  sizeMm: HoleSizeMm;
};

type HoleReport = {
  id: string;
  valid: boolean;
  distance: number;
  boundaryRadius: number;
  outerRadius: number;
  overflow: number;
  snapLabel: string;
};

const OUTER_OFFSET_MM = 2.5;
const MAX_HOLES = 5;
const BODY_RX = 43;
const BODY_RY = 56;
const SNAP_DISTANCE = 6;

const HOLE_SIZE_OPTIONS: readonly HoleSizeMm[] = [2, 2.5, 3];
const MATERIAL_OPTIONS = ["투명 아크릴", "유백 아크릴", "반투명 아크릴"] as const;
const THICKNESS_OPTIONS = ["3T", "5T"] as const;
const RING_OPTIONS = ["실버 링", "골드 링", "볼체인"] as const;

const SNAP_POINTS = [
  { x: 0, y: -(BODY_RY - 4), label: "상단 중앙" },
  { x: BODY_RX - 4, y: -6, label: "우측 상단" },
  { x: -(BODY_RX - 4), y: -6, label: "좌측 상단" },
  { x: 0, y: BODY_RY - 5, label: "하단 중앙" },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function getAngleAndDistance(x: number, y: number) {
  if (x === 0 && y === 0) {
    return { angle: -Math.PI / 2, distance: 0 };
  }
  return { angle: Math.atan2(y, x), distance: Math.hypot(x, y) };
}

function getBoundaryRadiusByAngle(angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const denominator = Math.sqrt(
    (cos * cos) / (BODY_RX * BODY_RX) + (sin * sin) / (BODY_RY * BODY_RY),
  );
  return denominator === 0 ? Math.min(BODY_RX, BODY_RY) : 1 / denominator;
}

function findNearestSnap(x: number, y: number) {
  let best:
    | {
        x: number;
        y: number;
        label: string;
        distance: number;
      }
    | null = null;

  for (const point of SNAP_POINTS) {
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance <= SNAP_DISTANCE && (!best || distance < best.distance)) {
      best = { ...point, distance };
    }
  }

  return best;
}

function clampHoleToValidBand(rawX: number, rawY: number, sizeMm: HoleSizeMm) {
  const snap = findNearestSnap(rawX, rawY);
  const x = snap?.x ?? rawX;
  const y = snap?.y ?? rawY;

  const { angle, distance } = getAngleAndDistance(x, y);
  const boundaryRadius = getBoundaryRadiusByAngle(angle);
  const outerRadius = sizeMm / 2 + OUTER_OFFSET_MM;
  const minDistance = Math.max(0, boundaryRadius - outerRadius);
  const maxDistance = boundaryRadius + sizeMm / 2;
  const clampedDistance = clamp(distance, minDistance, maxDistance);

  return {
    x: Math.cos(angle) * clampedDistance,
    y: Math.sin(angle) * clampedDistance,
    snapLabel: snap?.label ?? "자유 배치",
  };
}

function validateHole(hole: HoleDraft): HoleReport {
  const { angle, distance } = getAngleAndDistance(hole.x, hole.y);
  const boundaryRadius = getBoundaryRadiusByAngle(angle);
  const outerRadius = hole.sizeMm / 2 + OUTER_OFFSET_MM;
  const minDistance = Math.max(0, boundaryRadius - outerRadius);
  const maxDistance = boundaryRadius + hole.sizeMm / 2;
  const overflow = Math.max(0, distance + outerRadius - boundaryRadius);
  const valid =
    distance >= minDistance - 0.001 && distance <= maxDistance + 0.001;

  return {
    id: hole.id,
    valid,
    distance,
    boundaryRadius,
    outerRadius,
    overflow,
    snapLabel: findNearestSnap(hole.x, hole.y)?.label ?? "자유 배치",
  };
}

function estimateUnitPrice(args: {
  thickness: string;
  ring: string;
  holeCount: number;
}) {
  let total = 3400;
  if (args.thickness === "5T") total += 600;
  if (args.ring === "골드 링") total += 150;
  if (args.ring === "볼체인") total += 100;
  total += Math.max(0, args.holeCount - 1) * 120;
  return total;
}

function ProductPreviewSvg(props: {
  holes: HoleDraft[];
  sideLabel: string;
  tint: "front" | "back";
  className?: string;
}) {
  const { holes, sideLabel, tint, className } = props;

  return (
    <svg viewBox="-78 -88 156 176" className={className ?? "h-[300px] w-full"}>
      <defs>
        <linearGradient id={`bodyFill-${tint}`} x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor={
              tint === "front"
                ? "rgba(125,211,252,0.45)"
                : "rgba(203,213,225,0.28)"
            }
          />
          <stop offset="100%" stopColor="rgba(15,23,42,0.95)" />
        </linearGradient>
      </defs>

      <ellipse
        cx="0"
        cy="0"
        rx={BODY_RX + OUTER_OFFSET_MM}
        ry={BODY_RY + OUTER_OFFSET_MM}
        fill="none"
        stroke="rgba(248,113,113,0.95)"
        strokeWidth="0.9"
        strokeDasharray="1.8 1.8"
      />
      <ellipse
        cx="0"
        cy="0"
        rx={BODY_RX}
        ry={BODY_RY}
        fill={`url(#bodyFill-${tint})`}
        stroke="rgba(255,255,255,0.78)"
        strokeWidth="0.8"
      />

      <ellipse
        cx="0"
        cy="0"
        rx={BODY_RX - 8}
        ry={BODY_RY - 10}
        fill={
          tint === "front"
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.04)"
        }
        stroke={
          tint === "front"
            ? "rgba(255,255,255,0.16)"
            : "rgba(148,163,184,0.18)"
        }
        strokeWidth="0.5"
      />

      <text
        x="0"
        y="-4"
        textAnchor="middle"
        className="fill-white"
        fontSize="8"
        fontWeight="700"
        letterSpacing="1.6"
      >
        {sideLabel}
      </text>
      <text
        x="0"
        y="12"
        textAnchor="middle"
        className="fill-slate-300"
        fontSize="5.8"
        letterSpacing="0.8"
      >
        업로드 1개 기준 기본 양면 인쇄
      </text>

      {holes.map((hole) => {
        const report = validateHole(hole);
        return (
          <g key={`${sideLabel}-${hole.id}`}>
            <circle
              cx={hole.x}
              cy={hole.y}
              r={report.outerRadius}
              fill="none"
              stroke={
                report.valid
                  ? "rgba(250,204,21,0.95)"
                  : "rgba(251,113,133,0.95)"
              }
              strokeWidth="0.9"
            />
            <circle
              cx={hole.x}
              cy={hole.y}
              r={hole.sizeMm / 2}
              fill="rgba(2,6,23,0.96)"
              stroke="rgba(15,23,42,1)"
              strokeWidth="1.1"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function Page() {
  const holeSeq = useRef(1);
  const stageRef = useRef<SVGSVGElement | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const restoreUserSelectRef = useRef("");

  const makeHole = (
    sizeMm: HoleSizeMm = 2.5,
    x = 0,
    y = -(BODY_RY - 2),
  ): HoleDraft => {
    const clamped = clampHoleToValidBand(x, y, sizeMm);
    return {
      id: `hole-${holeSeq.current++}`,
      x: clamped.x,
      y: clamped.y,
      sizeMm,
    };
  };

  const [material, setMaterial] =
    useState<(typeof MATERIAL_OPTIONS)[number]>("투명 아크릴");
  const [thickness, setThickness] =
    useState<(typeof THICKNESS_OPTIONS)[number]>("3T");
  const [ring, setRing] =
    useState<(typeof RING_OPTIONS)[number]>("실버 링");
  const [quantity, setQuantity] = useState(10);
  const [holes, setHoles] = useState<HoleDraft[]>(() => [makeHole()]);
  const [selectedHoleId, setSelectedHoleId] = useState<string | null>(null);
  const [snapMessage, setSnapMessage] = useState("구멍은 키링 안쪽으로 들어갈 수 없음");
  const [notice, setNotice] = useState("");

  const selectedHole =
    holes.find((hole) => hole.id === selectedHoleId) ?? holes[0] ?? null;

  const holeReports = useMemo(() => holes.map(validateHole), [holes]);
  const selectedHoleReport =
    holeReports.find((report) => report.id === selectedHole?.id) ?? null;

  const unitPrice = useMemo(
    () =>
      estimateUnitPrice({
        thickness,
        ring,
        holeCount: holes.length,
      }),
    [holes.length, ring, thickness],
  );

  const totalPrice = useMemo(() => unitPrice * quantity, [quantity, unitPrice]);

  useEffect(() => {
    if (!selectedHoleId && holes.length > 0) {
      setSelectedHoleId(holes[0].id);
    }
  }, [holes, selectedHoleId]);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.userSelect = restoreUserSelectRef.current;
      }
    };
  }, []);

  function updateHole(holeId: string, updater: (hole: HoleDraft) => HoleDraft) {
    setHoles((prev) =>
      prev.map((hole) => (hole.id === holeId ? updater(hole) : hole)),
    );
  }

  function addHole() {
    if (holes.length >= MAX_HOLES) {
      setNotice("구멍은 최대 5개까지만 추가할 수 있습니다.");
      return;
    }

    const baseSize = (selectedHole?.sizeMm ?? 2.5) as HoleSizeMm;
    const nextIndex = holes.length;
    const rawX = nextIndex % 2 === 0 ? 12 + nextIndex * 3 : -(12 + nextIndex * 3);
    const next = makeHole(baseSize, rawX, -20);

    setHoles((prev) => [...prev, next]);
    setSelectedHoleId(next.id);
    setSnapMessage("새 구멍 추가 후 바로 드래그 가능");
    setNotice("");
  }

  function removeSelectedHole() {
    if (!selectedHole || holes.length <= 1) {
      return;
    }

    setHoles((prev) => prev.filter((hole) => hole.id !== selectedHole.id));
    setSelectedHoleId(null);
    setSnapMessage("구멍 제거 완료");
    setNotice("");
  }

  function resetSelectedHole() {
    if (!selectedHole) {
      return;
    }

    const next = clampHoleToValidBand(0, -(BODY_RY - 2), selectedHole.sizeMm);
    updateHole(selectedHole.id, (hole) => ({
      ...hole,
      x: next.x,
      y: next.y,
    }));
    setSnapMessage("위치 재설정");
    setNotice("");
  }

  function updateSelectedHoleSize(sizeMm: HoleSizeMm) {
    if (!selectedHole) {
      return;
    }

    updateHole(selectedHole.id, (hole) => {
      const next = clampHoleToValidBand(hole.x, hole.y, sizeMm);
      return {
        ...hole,
        sizeMm,
        x: next.x,
        y: next.y,
      };
    });
    setNotice("");
  }

  function getStagePoint(clientX: number, clientY: number) {
    const svg = stageRef.current;
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const viewBox = svg.viewBox.baseVal;
    const x = ((clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
    const y = ((clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;

    return { x, y };
  }

  function handleHolePointerDown(
    event: ReactPointerEvent<SVGCircleElement>,
    holeId: string,
  ) {
    event.preventDefault();
    if (typeof document !== "undefined") {
      if (restoreUserSelectRef.current === "") {
        restoreUserSelectRef.current = document.body.style.userSelect;
      }
      document.body.style.userSelect = "none";
    }
    draggingIdRef.current = holeId;
    setSelectedHoleId(holeId);
  }

  function handleStagePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!draggingIdRef.current) {
      return;
    }

    event.preventDefault();

    const point = getStagePoint(event.clientX, event.clientY);
    if (!point) {
      return;
    }

    const movingHole =
      holes.find((hole) => hole.id === draggingIdRef.current) ?? null;
    if (!movingHole) {
      return;
    }

    const next = clampHoleToValidBand(point.x, point.y, movingHole.sizeMm);
    updateHole(draggingIdRef.current, (hole) => ({
      ...hole,
      x: next.x,
      y: next.y,
    }));

    setSnapMessage(
      next.snapLabel === "자유 배치"
        ? "구멍은 키링 안쪽으로 들어갈 수 없음"
        : `스냅 가이드: ${next.snapLabel}`,
    );
    setNotice("");
  }

  function handleStagePointerUp() {
    draggingIdRef.current = null;
    if (typeof document !== "undefined") {
      document.body.style.userSelect = restoreUserSelectRef.current;
    }
  }

  return (
    <div className="min-h-screen select-none bg-[#07111f] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
          <header className="rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
                  상태창
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  키링 제작 / 기본 양면 인쇄
                </h1>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
                  업로드 데이터 1개를 기준으로 기본 양면 인쇄만 사용합니다.
                  인쇄면수, 표면마감, 불필요한 버튼은 제거했고,
                  지금 화면은 완성품 정면·배면 확인과 구멍 드래그 조정에만 집중합니다.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-xs leading-5 text-cyan-50">
                <div>업로드 1개 → 기본 양면 인쇄</div>
                <div>구멍은 키링 안쪽으로 들어갈 수 없음</div>
                <div>구멍은 직접 드래그로만 조정</div>
              </div>
            </div>
          </header>

          <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
            <aside className="space-y-4">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                  LEFT / 기본 설정
                </p>

                <div className="mt-3 space-y-4">
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      자재
                    </div>
                    <div className="grid gap-2">
                      {MATERIAL_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setMaterial(option)}
                          className={
                            option === material
                              ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-left text-sm font-semibold text-cyan-100"
                              : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
                          }
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      두께
                    </div>
                    <div className="flex gap-2">
                      {THICKNESS_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setThickness(option)}
                          className={
                            option === thickness
                              ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100"
                              : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                          }
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      링 / 체결
                    </div>
                    <div className="grid gap-2">
                      {RING_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setRing(option)}
                          className={
                            option === ring
                              ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-left text-sm font-semibold text-cyan-100"
                              : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
                          }
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-300">
                    <div>인쇄: 기본 양면 인쇄 고정</div>
                    <div>구멍 조정: 직접 드래그</div>
                    <div>구멍 규칙: 외곽선 접촉 유지 / 안쪽 진입 불가</div>
                  </div>
                </div>
              </section>
            </aside>

            <main className="space-y-4">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                    CENTER / 완성품 미리보기
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    정면 · 배면 동시 확인
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    완성품 기준으로 정면에서 보이는 모습과 배면에서 보이는 모습을 동시에 확인합니다.
                    완성품 기준이 아닌 중간 설명 패널은 제거했습니다.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
                    <ProductPreviewSvg
                      holes={holes}
                      sideLabel="정면 완성 미리보기"
                      tint="front"
                      className="h-[320px] w-full"
                    />
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
                    <ProductPreviewSvg
                      holes={holes}
                      sideLabel="배면 완성 미리보기"
                      tint="back"
                      className="h-[320px] w-full"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-300">
                  <div>정면/배면 모두 업로드 1개 기준 기본 양면 인쇄</div>
                  <div>최종 테두리 칼선: 빨강 100% / 0.01mm / 채우기 없음</div>
                  <div>구멍 선: 검정 / 0.01mm / 채우기 없음</div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                      CENTER / 홀 드래그 조정
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      구멍은 외곽 밴드 안에서만 이동
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      구멍은 직접 드래그해서 조정합니다.
                      드래그 중 텍스트 선택이 생기지 않도록 잠금 처리했고,
                      안쪽으로 완전히 들어가는 위치는 자동으로 막습니다.
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    현재 안내: {snapMessage}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
                    <svg
                      ref={stageRef}
                      viewBox="-78 -88 156 176"
                      className="h-[380px] w-full touch-none"
                      onPointerMove={handleStagePointerMove}
                      onPointerUp={handleStagePointerUp}
                      onPointerLeave={handleStagePointerUp}
                      onPointerCancel={handleStagePointerUp}
                    >
                      <ellipse
                        cx="0"
                        cy="0"
                        rx={BODY_RX + OUTER_OFFSET_MM}
                        ry={BODY_RY + OUTER_OFFSET_MM}
                        fill="none"
                        stroke="rgba(248,113,113,0.95)"
                        strokeWidth="0.9"
                        strokeDasharray="1.8 1.8"
                      />
                      <ellipse
                        cx="0"
                        cy="0"
                        rx={BODY_RX}
                        ry={BODY_RY}
                        fill="rgba(56,189,248,0.18)"
                        stroke="rgba(255,255,255,0.72)"
                        strokeWidth="0.8"
                      />

                      {SNAP_POINTS.map((point) => (
                        <g key={point.label}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="1.6"
                            fill="rgba(125,211,252,0.8)"
                          />
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="4.6"
                            fill="none"
                            stroke="rgba(125,211,252,0.18)"
                            strokeWidth="0.6"
                            strokeDasharray="1.4 1.4"
                          />
                        </g>
                      ))}

                      {holes.map((hole) => {
                        const report =
                          holeReports.find((item) => item.id === hole.id) ??
                          validateHole(hole);
                        const selected = selectedHole?.id === hole.id;

                        return (
                          <g key={hole.id}>
                            <circle
                              cx={hole.x}
                              cy={hole.y}
                              r={report.outerRadius}
                              fill="none"
                              stroke={
                                report.valid
                                  ? "rgba(250,204,21,0.95)"
                                  : "rgba(251,113,133,0.95)"
                              }
                              strokeWidth={selected ? "1.2" : "0.9"}
                            />
                            <circle
                              cx={hole.x}
                              cy={hole.y}
                              r={hole.sizeMm / 2}
                              fill="rgba(2,6,23,0.96)"
                              stroke="rgba(15,23,42,1)"
                              strokeWidth="1.1"
                            />
                            <circle
                              cx={hole.x}
                              cy={hole.y}
                              r="7"
                              fill="transparent"
                              className="cursor-grab active:cursor-grabbing"
                              onPointerDown={(event) =>
                                handleHolePointerDown(event, hole.id)
                              }
                            />
                          </g>
                        );
                      })}
                    </svg>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          홀 칼선
                        </div>
                        <div className="mt-2 text-sm text-white">
                          검정 / 0.01mm / 채우기 없음
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          외곽 오프셋
                        </div>
                        <div className="mt-2 text-sm text-white">
                          +2.5mm / 본체 외곽 접촉 유지
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          현재 안내
                        </div>
                        <div className="mt-2 text-sm text-white">
                          {snapMessage}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                        구멍 제어
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {holes.map((hole) => (
                          <button
                            key={hole.id}
                            type="button"
                            onClick={() => setSelectedHoleId(hole.id)}
                            className={
                              selectedHole?.id === hole.id
                                ? "rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                                : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10"
                            }
                          >
                            {hole.id.replace("hole-", "#")} · {hole.sizeMm}mm
                          </button>
                        ))}
                      </div>

                      <div className="mt-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          내경 선택
                        </div>
                        <div className="mt-2 flex gap-2">
                          {HOLE_SIZE_OPTIONS.map((sizeMm) => (
                            <button
                              key={sizeMm}
                              type="button"
                              onClick={() => updateSelectedHoleSize(sizeMm)}
                              className={
                                selectedHole?.sizeMm === sizeMm
                                  ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                                  : "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                              }
                            >
                              {sizeMm}mm
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2">
                        <button
                          type="button"
                          onClick={addHole}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          구멍 추가 ({holes.length}/{MAX_HOLES})
                        </button>
                        <button
                          type="button"
                          onClick={resetSelectedHole}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          위치 재설정
                        </button>
                        <button
                          type="button"
                          onClick={removeSelectedHole}
                          disabled={holes.length <= 1}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          선택 구멍 제거
                        </button>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-6 text-slate-300">
                        <div>구멍은 키링 안쪽으로 들어갈 수 없음</div>
                        <div>구멍은 직접 드래그로만 조정</div>
                        <div>기본 내경: 2.5mm</div>
                        <div>최대 5개</div>
                      </div>

                      {selectedHoleReport ? (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-6 text-slate-300">
                          <div>현재 선택: {selectedHole?.id.replace("hole-", "#")}</div>
                          <div>경계 반경: {round1(selectedHoleReport.boundaryRadius)}mm</div>
                          <div>중심 거리: {round1(selectedHoleReport.distance)}mm</div>
                          <div>돌출량: {round1(selectedHoleReport.overflow)}mm</div>
                        </div>
                      ) : null}
                    </section>

                    <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-sm font-semibold text-emerald-50">
                        자동 접수 판정
                      </p>
                      <div className="mt-3 text-sm leading-6 text-emerald-100">
                        현재 홀은 모두 외곽 밴드 안에서 유지되며, 단일 업로드 기준 기본 양면 인쇄 흐름으로 정리되었습니다.
                      </div>
                    </section>
                  </div>
                </div>
              </section>
            </main>

            <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                    RIGHT / 수량 · 가격 · 저장 · 주문
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    주문 카드
                  </h2>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-300">수량</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                      >
                        -
                      </button>
                      <input
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(Math.max(1, Number(event.target.value) || 1))
                        }
                        className="h-9 w-20 rounded-xl border border-white/10 bg-slate-900 px-3 text-center text-sm text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">예상 단가</span>
                      <span className="font-semibold text-cyan-100">
                        {unitPrice.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">예상 합계</span>
                      <span className="text-lg font-semibold text-white">
                        {totalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-300">
                    <div>자재: {material} / {thickness}</div>
                    <div>링: {ring}</div>
                    <div>인쇄: 기본 양면 인쇄(업로드 1개)</div>
                    <div>구멍 수: {holes.length}개</div>
                  </div>

                  {notice ? (
                    <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
                      {notice}
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3">
                    <Link
                      href="/storage"
                      className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                    >
                      서랍 저장
                    </Link>
                    <Link
                      href="/orders"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      주문으로
                    </Link>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}