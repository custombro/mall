"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  loadDrawerEntries,
  loadOrderEntries,
  loadWorkbenchDraft,
  type DrawerEntry,
  type OrderEntry,
  type WorkbenchDraft,
} from "../../lib/cbmall-store";

type StartMode = "입문형" | "빠른 작업";

const START_MODES = [
  {
    key: "입문형",
    title: "입문형 시작",
    description: "흐름을 읽고 상품군을 고른다",
  },
  {
    key: "빠른 작업",
    title: "빠른 작업 시작",
    description: "설명보다 바로 작업대로 들어간다",
  },
] as const;

const PRODUCT_FAMILIES = [
  {
    title: "키링",
    status: "지금 작업 가능",
    description: "현재 가장 먼저 정리된 제작 화면",
    href: "/workbench/keyring",
    cta: "키링 작업대 열기",
  },
  {
    title: "POP",
    status: "다음 우선순위",
    description: "레이어/조립 흐름을 더 단순화할 대상",
    href: "/pop-studio",
    cta: "POP 작업 보기",
  },
  {
    title: "아크릴 스탠드",
    status: "확장 예정",
    description: "받침 결합 중심으로 이어질 상품군",
    href: "/materials-room",
    cta: "원자재부터 보기",
  },
] as const;

const QUICK_ACTIONS = [
  {
    title: "서랍 열기",
    href: "/storage",
    description: "최근 저장 작업 다시 열기",
  },
  {
    title: "주문 허브",
    href: "/orders",
    description: "작업대에서 넘어온 주문 정리",
  },
  {
    title: "주문확인",
    href: "/order-check",
    description: "고객 진행 / 제작 진행 확인",
  },
  {
    title: "홈 허브",
    href: "/",
    description: "전체 동선으로 돌아가기",
  },
] as const;

function formatDate(value?: string) {
  if (!value) return "아직 없음";
  try {
    return new Date(value).toLocaleString("ko-KR");
  } catch {
    return value;
  }
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function WorkbenchHubPage() {
  const [startMode, setStartMode] = useState<StartMode>("빠른 작업");
  const [drawerEntries, setDrawerEntries] = useState<DrawerEntry[]>([]);
  const [orderEntries, setOrderEntries] = useState<OrderEntry[]>([]);
  const [draft, setDraft] = useState<WorkbenchDraft | null>(null);

  useEffect(() => {
    setDrawerEntries(loadDrawerEntries());
    setOrderEntries(loadOrderEntries());
    setDraft(loadWorkbenchDraft());
  }, []);

  const latestDrawer = drawerEntries[0] ?? null;
  const latestOrder = orderEntries[0] ?? null;

  const summary = useMemo(() => {
    return startMode === "입문형"
      ? {
          title: "흐름을 보고 상품군 선택",
          description: "자재 → 작업대 → 부자재 → 서랍 순으로 읽는 방식",
        }
      : {
          title: "상품군 선택 후 바로 진입",
          description: "최근 초안, 서랍, 주문을 바로 붙여 쓰는 방식",
        };
  }, [startMode]);

  return (
    <main className="min-h-screen bg-[#0a0f18] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              WORKBENCH / HUB
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              제작 허브
            </h1>
          </div>
          <p className="max-w-xl text-sm text-slate-300">
            상품 설명보다, 지금 어떤 작업대로 들어갈지 먼저 고르는 화면입니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">진입 방식</p>
              <div className="space-y-2">
                {START_MODES.map((mode) => {
                  const active = mode.key === startMode;

                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setStartMode(mode.key)}
                      className={
                        active
                          ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                          : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                      }
                    >
                      <p className="text-sm font-semibold text-white">{mode.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{mode.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">빠른 경로</p>
              <div className="grid gap-2">
                {QUICK_ACTIONS.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 transition hover:bg-white/10"
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          </aside>

          <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                    CENTER / 작업대 선택
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{summary.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{summary.description}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 모드</p>
                  <p className="mt-1 font-semibold text-white">{startMode}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryChip label="최근 초안" value={draft?.productCode ?? "아직 없음"} />
                <SummaryChip label="서랍" value={`${drawerEntries.length}개`} />
                <SummaryChip label="주문" value={`${orderEntries.length}개`} />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">상품군</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {PRODUCT_FAMILIES.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">{item.title}</span>
                      <span className="text-[11px] text-cyan-100">{item.status}</span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-300">{item.description}</p>
                    <p className="mt-4 text-sm font-semibold text-white">{item.cta}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-white">최근 초안</p>
                <div className="mt-3 grid gap-3">
                  <SummaryChip label="코드" value={draft?.productCode ?? "아직 없음"} />
                  <SummaryChip
                    label="사양"
                    value={draft ? `${draft.specText} · ${draft.quantity}개` : "아직 자동 저장 없음"}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-white">최근 흐름</p>
                <div className="mt-3 grid gap-3">
                  <SummaryChip
                    label="최근 서랍"
                    value={
                      latestDrawer
                        ? `${latestDrawer.title} · ${formatDate(latestDrawer.updatedAt)}`
                        : "아직 없음"
                    }
                  />
                  <SummaryChip
                    label="최근 주문"
                    value={
                      latestOrder
                        ? `${latestOrder.title} · ${formatDate(latestOrder.updatedAt)}`
                        : "아직 없음"
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                RIGHT / 상태 요약
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">실행 카드</h2>
            </div>

            <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">현재 상태</p>
              <div className="mt-3 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">최근 초안</span>
                    <span className="font-semibold text-white">{draft ? "있음" : "없음"}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">서랍 저장</span>
                    <span className="font-semibold text-white">{drawerEntries.length}개</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">주문 준비</span>
                    <span className="font-semibold text-cyan-100">{orderEntries.length}개</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-3">
              <Link
                href="/workbench/keyring"
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                키링 작업대 열기
              </Link>
              <Link
                href="/storage"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                서랍 보기
              </Link>
              <Link
                href="/orders"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                주문 허브 보기
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}