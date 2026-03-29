"use client";

import Link from "next/link";
import { useState, type PointerEvent as ReactPointerEvent } from "react";

type HolePosition = {
  x: number;
  y: number;
};

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 640;
const BODY_CX = 280;
const BODY_CY = 340;
const BODY_RX = 165;
const BODY_RY = 225;
const HOLE_R = 12;
const PRICE_PER_UNIT = 3400;

const MATERIALS = ["투명 아크릴", "반투명 아크릴"] as const;
const THICKNESSES = ["3T", "5T"] as const;
const RINGS = ["실버 링", "골드 링", "볼체인"] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampHole(next: HolePosition): HolePosition {
  return {
    x: clamp(next.x, 190, 370),
    y: clamp(next.y, 96, 172),
  };
}

function KeyringCanvas({
  hole,
  mirrored,
  mini = false,
}: {
  hole: HolePosition;
  mirrored: boolean;
  mini?: boolean;
}) {
  const displayX = mirrored ? VIEW_WIDTH - hole.x : hole.x;
  const title = mirrored ? "뒷면 반전 미리보기" : "정면 미리보기";

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={mini ? "cb_fill_mini" : "cb_fill_main"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8eb7df" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#203149" stopOpacity="1" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} rx="28" fill="#041129" />

      <ellipse
        cx={BODY_CX}
        cy={BODY_CY}
        rx={BODY_RX}
        ry={BODY_RY}
        fill={`url(#${mini ? "cb_fill_mini" : "cb_fill_main"})`}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />

      <rect
        x="170"
        y="88"
        width="220"
        height="92"
        rx="26"
        fill="rgba(255,255,255,0.10)"
        stroke="rgba(255,255,255,0.30)"
        strokeDasharray="8 8"
      />

      <circle cx={displayX} cy={hole.y} r={HOLE_R + 8} fill="rgba(255,210,60,0.92)" />
      <circle cx={displayX} cy={hole.y} r={HOLE_R} fill="#263247" />
      <circle cx={displayX} cy={hole.y} r="4" fill="#0a0f1a" />

      {!mini ? (
        <>
          <text
            x="280"
            y="334"
            textAnchor="middle"
            fill="rgba(255,255,255,0.95)"
            fontSize="34"
            fontWeight="800"
            letterSpacing="1.1"
          >
            {mirrored ? "뒷면 반전 미리보기" : "중앙 작업대 메인 미리보기"}
          </text>
          <text
            x="280"
            y="386"
            textAnchor="middle"
            fill="rgba(255,255,255,0.78)"
            fontSize="20"
            fontWeight="500"
          >
            {mirrored ? "뒷면은 좌우 반전 기준으로 확인" : "구멍을 직접 드래그해서 조정"}
          </text>
          <text
            x="280"
            y="126"
            textAnchor="middle"
            fill="rgba(255,255,255,0.86)"
            fontSize="16"
            fontWeight="700"
          >
            홀 이동 가능 밴드
          </text>
        </>
      ) : (
        <>
          <text
            x="280"
            y="56"
            textAnchor="middle"
            fill="rgba(255,255,255,0.95)"
            fontSize="22"
            fontWeight="800"
          >
            보조 미리보기
          </text>
          <text
            x="280"
            y="86"
            textAnchor="middle"
            fill="rgba(255,255,255,0.68)"
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

export default function KeyringWorkbenchPage() {
  const [material, setMaterial] = useState<(typeof MATERIALS)[number]>("투명 아크릴");
  const [thickness, setThickness] = useState<(typeof THICKNESSES)[number]>("3T");
  const [ring, setRing] = useState<(typeof RINGS)[number]>("실버 링");
  const [quantity, setQuantity] = useState(10);
  const [frontView, setFrontView] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [hole, setHole] = useState<HolePosition>({ x: 280, y: 122 });

  const totalPrice = quantity * PRICE_PER_UNIT;

  const updateHole = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
    setHole(clampHole({ x, y }));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
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
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5">
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
              <h1 className="text-4xl font-extrabold tracking-tight text-white">키링 제작 / 중앙 작업대 재정리</h1>
              <p className="mt-4 max-w-[980px] text-base leading-7 text-white/78">
                설명 박스를 줄이고, 가운데 메인 작업대와 우상단 보조 미리보기를 한 화면에 같이 보이도록 재구성했다.
                좌측은 선택, 중앙은 작업, 우측은 수량·주문 흐름으로 고정한다.
              </p>
            </div>

            <div className="grid w-full max-w-[320px] gap-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/76">
              <div>업로드 1개 → 기본 양면 인쇄</div>
              <div>구멍 위치는 중앙 작업대에서 직접 드래그</div>
              <div>보조 미리보기는 우상단 카드에서 즉시 확인</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="mb-4 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">LEFT / 기본 설정</div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">자재</div>
              <div className="grid gap-2">
                {MATERIALS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMaterial(item)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      material === item
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
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRing(item)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      ring === item
                        ? "border-[#7fbaff] bg-[#95c9ff]/18 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/68">
              <div>자재는 투명 / 반투명만 사용</div>
              <div>구멍 위치는 상단 밴드 범위 안에서 이동</div>
              <div>뒷면 보기에서는 구멍 위치가 좌우 반전</div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">CENTER / 중앙 작업대</div>
                <h2 className="text-[44px] font-extrabold leading-none tracking-tight text-white">중앙 작업대 + 보조 미리보기</h2>
                <p className="mt-4 max-w-[760px] text-base leading-7 text-white/76">
                  메인 작업대는 크게 유지하고, 우상단 카드에서 보조 미리보기를 항상 보이게 했다.
                  구멍은 중앙 화면에서 직접 드래그해서 조정한다.
                </p>
              </div>

              <div className="w-full shrink-0 xl:w-[260px]">
                <div className="overflow-hidden rounded-[22px] border border-[#7fbaff]/30 bg-[#081630] shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <div className="text-[11px] font-bold tracking-[0.16em] text-[#8fc0ff]">보조 미리보기</div>
                      <div className="mt-1 text-sm font-semibold text-white">우상단 고정 확인 카드</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white/74">
                      LIVE
                    </div>
                  </div>
                  <div className="h-[176px] p-2">
                    <KeyringCanvas hole={hole} mirrored={!frontView} mini />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
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
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
                현재 구멍 좌표: X {Math.round(hole.x)} / Y {Math.round(hole.y)}
              </div>
            </div>

            <div
              className={`mt-4 overflow-hidden rounded-[28px] border ${
                dragging ? "border-[#7fbaff]/70" : "border-white/10"
              } bg-[#02091f] p-4 transition cursor-grab active:cursor-grabbing`}
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

              <div className="h-[680px] w-full">
                <KeyringCanvas hole={hole} mirrored={!frontView} />
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="mb-4 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">RIGHT / 수량 · 저장 · 주문</div>
            <h3 className="text-4xl font-extrabold tracking-tight text-white">주문 카드</h3>

            <div className="mt-6">
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
                  {PRICE_PER_UNIT.toLocaleString("ko-KR")}원
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
              <div>자재: {material}</div>
              <div>두께: {thickness}</div>
              <div>링: {ring}</div>
              <div>인쇄: 기본 양면 인쇄</div>
              <div>구멍 수: 1개</div>
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
