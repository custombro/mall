"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type HolePosition = { x: number; y: number };
type Preset = { id: string; label: string; x: number; y: number };

const BOARD = { width: 208, height: 260 };
const HOLE_RADIUS = 9;
const CLEARANCE_MM = 2.5;
const MM_TO_PX = 6;
const CLEARANCE_RADIUS = HOLE_RADIUS + CLEARANCE_MM * MM_TO_PX;
const UNIT_PRICE_SINGLE = 2900;
const UNIT_PRICE_DOUBLE = 3400;
const FOCUS_LABEL = "현재 포커스: 고리 위치 조정";

const PRESETS: Preset[] = [
  { id: "top-center", label: "상단 중앙", x: BOARD.width / 2, y: 28 },
  { id: "top-left", label: "좌측 상단", x: 48, y: 34 },
  { id: "top-right", label: "우측 상단", x: BOARD.width - 48, y: 34 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampHole(position: HolePosition): HolePosition {
  return {
    x: clamp(position.x, CLEARANCE_RADIUS + 8, BOARD.width - CLEARANCE_RADIUS - 8),
    y: clamp(position.y, CLEARANCE_RADIUS + 8, BOARD.height - CLEARANCE_RADIUS - 8),
  };
}

function nearestPreset(position: HolePosition): Preset {
  return PRESETS.reduce((best, current) => {
    const bestDistance = Math.hypot(best.x - position.x, best.y - position.y);
    const currentDistance = Math.hypot(current.x - position.x, current.y - position.y);
    return currentDistance < bestDistance ? current : best;
  }, PRESETS[0]!);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export default function KeyringWorkbenchPage() {
  const previewRef = useRef<HTMLDivElement | null>(null);

  const [material] = useState("단일 기본 자재 / 투명 아크릴 3T");
  const [printSide, setPrintSide] = useState<"단면" | "양면">("양면");
  const [finish, setFinish] = useState<"유광" | "무광">("유광");
  const [quantity, setQuantity] = useState(10);
  const [dragging, setDragging] = useState(false);
  const [holePosition, setHolePosition] = useState<HolePosition>(
    clampHole({ x: BOARD.width / 2, y: 28 }),
  );

  const unitPrice = printSide === "양면" ? UNIT_PRICE_DOUBLE : UNIT_PRICE_SINGLE;
  const totalPrice = unitPrice * quantity;
  const presetLabel = useMemo(() => nearestPreset(holePosition).label, [holePosition]);
  const holeSummary =
    presetLabel === "상단 중앙"
      ? "고리 위치: 상단 중앙 / 드래그 미세 조정"
      : `고리 위치: ${presetLabel} / 드래그 미세 조정`;

  const moveHoleFromPoint = (clientX: number, clientY: number) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const next = clampHole({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    setHolePosition(next);
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: MouseEvent) => {
      moveHoleFromPoint(event.clientX, event.clientY);
    };

    const onUp = () => {
      setDragging(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  return (
    <main className="min-h-screen bg-[#05080f] px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4">
        <section className="rounded-[28px] border border-cyan-500/20 bg-[#0d1017] px-8 py-7 shadow-[0_0_0_1px_rgba(125,211,252,0.05)]">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-300">
            Keyring / Drag Hole / Hole Cutline
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[40px] font-semibold leading-none tracking-[-0.04em]">
                키링 제작
              </h1>
              <p className="mt-4 text-sm text-slate-300">
                구멍 위치는 프리뷰에서 바로 드래그로 미세 조정하고, 홀 내경 칼선과
                2.5mm 여백선을 함께 확인합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-right">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                상태창
              </div>
              <div className="mt-2 text-sm font-semibold text-white">현재 단계: 고리 위치 조정</div>
              <div className="mt-1 text-xs text-cyan-100/80">안내 방식: 요청 시 상세 안내</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
          <aside className="rounded-[28px] border border-white/10 bg-[#111318] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">좌측 / 설정</div>
            <h2 className="mt-3 text-2xl font-semibold">옵션</h2>

            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-300">자재</div>
                <button className="w-full rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-4 text-left">
                  <div className="text-xs text-emerald-200">단일 기본 자재</div>
                  <div className="mt-1 text-lg font-semibold text-white">투명 아크릴 3T</div>
                </button>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-slate-300">인쇄 면수</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["단면", "양면"] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setPrintSide(value)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                        printSide === value
                          ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                          : "border-white/10 bg-white/[0.03] text-slate-300"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-slate-300">표면 마감</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["유광", "무광"] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setFinish(value)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                        finish === value
                          ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                          : "border-white/10 bg-white/[0.03] text-slate-300"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-slate-300">고리 위치</div>
                <div className="space-y-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setHolePosition(clampHole({ x: preset.x, y: preset.y }))}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${
                        presetLabel === preset.label
                          ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                          : "border-white/10 bg-white/[0.03] text-slate-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-xs leading-6 text-amber-100">
                  드래그로 고리 위치 미세 조정
                  <br />
                  홀 칼선(내부) + 외곽 여백선(+2.5mm)
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-[#111318] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">중앙 / 작업</div>
                <h2 className="mt-3 text-2xl font-semibold">작업테이블</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                {FOCUS_LABEL}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_220px]">
              <div className="rounded-[24px] border border-cyan-400/30 bg-cyan-500/[0.06] p-5">
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-200">Front</div>
                <h3 className="mt-3 text-2xl font-semibold">앞면 핵심 배치</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  업로드 영역과 메인 이미지를 먼저 두고, 고리 위치는 중심이 아니라 실제
                  홀 여백 기준으로 확인합니다.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Back</div>
                <h3 className="mt-3 text-2xl font-semibold">뒷면 메모 영역</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  후면 인쇄 여부와 간단한 메모 방향을 바로 맞출 수 있게 유지합니다.
                </p>
              </div>

              <div className="rounded-[24px] border border-cyan-400/20 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Preview</div>
                <div
                  ref={previewRef}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setDragging(true);
                    moveHoleFromPoint(event.clientX, event.clientY);
                  }}
                  className="relative mx-auto mt-4 h-[260px] w-[208px] rounded-[34px] border border-cyan-400/25 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.12),transparent_55%),linear-gradient(180deg,#515963_0%,#2a2f36_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                >
                  <div className="absolute inset-[12px] rounded-[28px] border border-dashed border-cyan-300/15" />

                  <div
                    className="absolute rounded-full border border-dashed border-amber-300/85 bg-amber-300/10 cursor-grab active:cursor-grabbing"
                    style={{
                      width: CLEARANCE_RADIUS * 2,
                      height: CLEARANCE_RADIUS * 2,
                      left: holePosition.x - CLEARANCE_RADIUS,
                      top: holePosition.y - CLEARANCE_RADIUS,
                    }}
                    title="외곽 여백선(+2.5mm)"
                  />

                  <div
                    className="absolute rounded-full border-2 border-cyan-300 bg-[#0b1520]/55 cursor-grab active:cursor-grabbing"
                    style={{
                      width: HOLE_RADIUS * 2,
                      height: HOLE_RADIUS * 2,
                      left: holePosition.x - HOLE_RADIUS,
                      top: holePosition.y - HOLE_RADIUS,
                    }}
                    title="홀 칼선(내부)"
                  />

                  <div
                    className="absolute rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(125,211,252,0.55)]"
                    style={{
                      width: 6,
                      height: 6,
                      left: holePosition.x - 3,
                      top: holePosition.y - 3,
                    }}
                  />
                </div>

                <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-[#0b0d12] p-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>홀 칼선(내부)</span>
                    <span>{HOLE_RADIUS * 2}px 기준 프리뷰</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>외곽 여백선(+2.5mm)</span>
                    <span>{CLEARANCE_MM.toFixed(1)}mm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>현재 위치</span>
                    <span>
                      X {Math.round(holePosition.x)} / Y {Math.round(holePosition.y)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-[#111318] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">우측 / 요약</div>
            <h2 className="mt-3 text-2xl font-semibold">수량 · 가격 · 저장 · 주문</h2>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0b0d12] p-4">
              <div className="mb-3 text-sm font-semibold text-slate-300">수량</div>
              <div className="grid grid-cols-[44px_1fr_44px] items-center gap-3">
                <button
                  className="rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-lg"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  -
                </button>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-center text-2xl font-semibold">
                  {quantity}
                </div>
                <button
                  className="rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-lg"
                  onClick={() => setQuantity((value) => value + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-[#0b0d12] p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>단가</span>
                <span>{formatCurrency(unitPrice)}원</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-3xl font-semibold text-cyan-200">
                <span>합계</span>
                <span>{formatCurrency(totalPrice)}원</span>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-[#0b0d12] p-4 text-sm leading-7 text-slate-300">
              <div>자재: {material}</div>
              <div>면수: {printSide}</div>
              <div>마감: {finish}</div>
              <div>{holeSummary}</div>
              <div>홀 기준: 내경 칼선 + {CLEARANCE_MM.toFixed(1)}mm 여백선</div>
            </div>

            <div className="mt-4 grid gap-3">
              <button className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-black">
                보관함 저장
              </button>
              <button className="rounded-2xl border border-cyan-400 bg-cyan-500/15 px-4 py-4 text-sm font-semibold text-cyan-100">
                바로 주문 진행
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}