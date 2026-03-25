"use client";

import Link from "next/link";
import { useState } from "react";

const deployMarker = "DEPLOY_POP_MATERIAL_MODE_20260326_005424";

const mixedMaterials = [
  { slot: "1번 소재", material: "투명판 5T" },
  { slot: "2번 소재", material: "백색판 5T" },
  { slot: "3번 소재", material: "유백판 5T" },
  { slot: "4번 소재", material: "투명판 3T" }
];

const optionRows = [
  { name: "받침 추가", value: "1ea" },
  { name: "세트 구성", value: "가능" },
  { name: "타공 없음", value: "기본" }
];

export default function PopStudioPage() {
  const [materialMode, setMaterialMode] = useState<"single" | "mixed">("single");

  const displayMaterials =
    materialMode === "single"
      ? [{ slot: "공통 소재", material: "투명판 5T" }]
      : mixedMaterials;

  const pieceLabels =
    materialMode === "single"
      ? ["공통", "공통", "공통", "공통"]
      : ["1번", "2번", "3번", "4번"];

  const summaryRows = [
    { label: "소재 모드", value: materialMode === "single" ? "단일 소재" : "여러 소재" },
    { label: "피스 수", value: "1~4번" },
    { label: "기준가", value: "₩7,900" }
  ];

  return (
    <main className="min-h-screen bg-[#ebe7e1] text-neutral-900">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-4 px-4 py-5 lg:px-6">
        <header className="rounded-[28px] border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                POP STUDIO
              </p>
              <h1 className="text-[30px] font-semibold tracking-tight">
                POP은 단일 소재 / 여러 소재를 바로 고르게
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm leading-6 text-neutral-600">
                  1~4번 소재가 같을지 다를지 먼저 고른 뒤, 중앙 큰 작업 테이블에서 전시 구조를 바로 확인하는 방식이다.
                </p>
                <p className="mt-1 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                  배포 확인 기준: {deployMarker}
                </p>
              </div>
              <Link
                href="/orders"
                className="shrink-0 rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                바로 주문
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)_260px]">
          <aside className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 소재 선택</p>

            <div className="mt-3 rounded-2xl bg-[#f7f3ed] p-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMaterialMode("single")}
                  className={[
                    "rounded-2xl px-3 py-3 text-sm font-semibold transition",
                    materialMode === "single"
                      ? "bg-neutral-900 text-white"
                      : "border border-black/10 bg-white text-neutral-900"
                  ].join(" ")}
                >
                  단일 소재
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialMode("mixed")}
                  className={[
                    "rounded-2xl px-3 py-3 text-sm font-semibold transition",
                    materialMode === "mixed"
                      ? "bg-neutral-900 text-white"
                      : "border border-black/10 bg-white text-neutral-900"
                  ].join(" ")}
                >
                  여러 소재
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {displayMaterials.map((item) => (
                <div key={item.slot} className="rounded-2xl border border-black/10 bg-[#f7f3ed] px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{item.slot}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">{item.material}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-[#f7f3ed] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">작업 기준</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">단일 소재면 공통 1종</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">여러 소재면 1~4번 개별 적용</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">중앙 작업대 즉시 확인</div>
              </div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">중앙 · 제작 테이블</p>
                <p className="mt-1 text-sm text-neutral-600">
                  POP은 받침과 본체 높이감이 중요하므로 중앙 작업 테이블을 크게 유지하고, 1~4번 소재 표기를 한눈에 보이게 했다.
                </p>
              </div>
              <span className="rounded-full border border-black/10 bg-[#f7f3ed] px-3 py-1 text-xs font-semibold text-neutral-700">
                {materialMode === "single" ? "단일 소재 모드" : "여러 소재 모드"}
              </span>
            </div>

            <div className="mt-4 rounded-[34px] border border-black/10 bg-[#ede7de] p-5">
              <div className="relative min-h-[760px] overflow-hidden rounded-[30px] border border-black/10 bg-[#f7f3ed]">
                <div className="absolute inset-x-[4%] top-[5%] h-10 rounded-full border border-dashed border-black/10 bg-white/70" />
                <div className="absolute inset-x-[2.5%] bottom-[4.8%] h-[50%] rounded-[46px] border border-black/10 bg-white shadow-[0_18px_30px_rgba(0,0,0,0.05)]" />

                <div className="absolute left-[5%] top-[10%] bottom-[14%] w-[18%] rounded-[28px] border border-dashed border-black/10 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">소재 존</p>
                  <div className="mt-6 flex h-[58%] items-center justify-center rounded-[22px] border border-dashed border-black/10 bg-[#faf8f4] text-center text-lg font-semibold text-neutral-700">
                    {materialMode === "single" ? "공통 소재" : "1~4번 개별 소재"}
                  </div>
                </div>

                <div className="absolute left-[26%] right-[20%] bottom-[18%] h-[52%] rounded-[34px] border border-black/10 bg-white shadow-sm">
                  <div className="absolute left-[12%] bottom-[14%] h-[18%] w-[56%] rounded-[18px] border border-black/10 bg-[#f2ede5]" />
                  <div className="absolute left-[52%] bottom-[14%] h-[10%] w-[10%] rounded-[14px] border border-black/10 bg-[#f2ede5]" />
                  <div className="absolute left-[25%] bottom-[32%] h-[44%] w-[42%] rounded-[14px] border border-black/10 bg-[#faf8f4]" />

                  <div className="absolute left-[28%] bottom-[30%] rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                    {pieceLabels[0]}
                  </div>
                  <div className="absolute left-[42%] bottom-[30%] rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                    {pieceLabels[1]}
                  </div>
                  <div className="absolute left-[56%] bottom-[30%] rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                    {pieceLabels[2]}
                  </div>
                  <div className="absolute left-[70%] bottom-[30%] rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                    {pieceLabels[3]}
                  </div>

                  <div className="absolute inset-x-0 bottom-[6%] text-center text-[36px] font-semibold tracking-tight text-neutral-800">
                    POP
                  </div>
                </div>

                <div className="absolute right-[5%] top-[14%] bottom-[24%] w-[15%] rounded-[28px] border border-dashed border-black/10 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">옵션 존</p>
                  <div className="mt-6 flex h-[42%] items-center justify-center rounded-[22px] border border-dashed border-black/10 bg-[#faf8f4] text-lg font-semibold text-neutral-700">
                    받침 / 1ea
                  </div>
                </div>

                <div className="absolute inset-x-[8%] bottom-[2.8%] flex flex-wrap items-center gap-2">
                  <Link href="/materials-room" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                    자재실 보기
                  </Link>
                  <Link href="/parts-room" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                    부자재실 보기
                  </Link>
                  <Link href="/storage" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                    서랍 열기
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 수량 / 가격 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  우측은 마지막 판단만 남겨 저장과 주문 흐름을 짧게 유지한다.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ed] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">현재 선택</div>
                <div className="mt-3 space-y-3">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-neutral-500">{row.label}</span>
                      <span className="text-right font-medium text-neutral-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">작업 가격</div>
                    <div className="mt-1 text-[34px] font-semibold tracking-tight">₩7,900</div>
                  </div>
                  <div className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                    기본
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link href="/orders" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    바로 주문
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 저장
                  </Link>
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f7f3ed] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    주문확인
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">옵션</p>
                <div className="mt-3 space-y-2">
                  {optionRows.map((item) => (
                    <div key={item.name} className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                      <span className="text-neutral-700">{item.name}</span>
                      <span className="font-medium text-neutral-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}