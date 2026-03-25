"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadDrawerEntries, loadOrderEntries, loadWorkbenchDraft } from "../../lib/cbmall-store";

type AccountMode = "일반" | "VIP";

const ACCOUNT_MODES = [
  {
    key: "일반",
    title: "일반 계정",
    description: "최근 작업, 재주문, 주문확인 중심",
  },
  {
    key: "VIP",
    title: "VIP / 프로젝트",
    description: "프로젝트 단위 재사용과 대량 주문 중심",
  },
] as const;

const QUICK_LINKS = [
  {
    title: "서랍 열기",
    description: "최근 저장 작업 다시 열기",
    href: "/storage",
  },
  {
    title: "주문확인 보기",
    description: "고객 진행 / 제작 진행 바로 확인",
    href: "/order-check",
  },
  {
    title: "주문 정리 보기",
    description: "작업대와 서랍에서 넘어온 주문 정리",
    href: "/orders",
  },
  {
    title: "작업대로 이동",
    description: "키링 작업부터 바로 시작",
    href: "/workbench/keyring",
  },
] as const;

const ACCOUNT_SECTIONS = [
  {
    title: "재주문",
    items: ["지난번과 동일 열기", "완료품 기준 복제", "수량만 바꿔 주문"],
  },
  {
    title: "주문 흐름",
    items: ["접수 / 제작대기 확인", "출력중 / 가공중 / 조립중 확인", "검수 / 출고완료 확인"],
  },
  {
    title: "VIP 관리",
    items: ["프로젝트 단위 저장", "대량 주문 빠른 견적", "담당자 요청과 납기 관리"],
  },
] as const;

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function MyPage() {
  const [mode, setMode] = useState<AccountMode>("일반");
  const [drawerCount, setDrawerCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [draftCode, setDraftCode] = useState("아직 없음");

  useEffect(() => {
    setDrawerCount(loadDrawerEntries().length);
    setOrderCount(loadOrderEntries().length);
    setDraftCode(loadWorkbenchDraft()?.productCode ?? "아직 없음");
  }, []);

  const summary = useMemo(() => {
    return mode === "일반"
      ? {
          title: "최근 작업과 재주문을 가장 빠르게 꺼내는 계정 허브",
          note: "설정보다 재사용 속도를 먼저 보여주는 구조입니다.",
        }
      : {
          title: "VIP 프로젝트와 대량 주문을 바로 처리하는 계정 허브",
          note: "VIP는 프로젝트 단위 저장과 반복 발주가 먼저 보여야 합니다.",
        };
  }, [mode]);

  const profileCards = useMemo(
    () => [
      { label: "실제 주문", value: `${orderCount}건` },
      { label: "실제 서랍", value: `${drawerCount}개` },
      { label: "최근 초안", value: draftCode },
      { label: "VIP 상태", value: mode === "VIP" ? "활성" : "대기" },
    ],
    [drawerCount, draftCode, mode, orderCount],
  );

  return (
    <main className="min-h-screen bg-[#0a0f18] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              MY / HUB
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              내정보
            </h1>
          </div>
          <p className="max-w-xl text-sm text-slate-300">
            설정 설명보다, 최근 작업과 재주문을 바로 꺼내는 계정 허브로 정리한 화면입니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">계정 모드</p>
              <div className="space-y-2">
                {ACCOUNT_MODES.map((item) => {
                  const active = item.key === mode;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setMode(item.key)}
                      className={
                        active
                          ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                          : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                      }
                    >
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">빠른 경로</p>
              <div className="grid gap-2">
                {QUICK_LINKS.map((item) => (
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
                    CENTER / 계정 허브
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{summary.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{summary.note}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 모드</p>
                  <p className="mt-1 font-semibold text-white">{mode}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {profileCards.map((card) => (
                  <SummaryChip key={card.label} label={card.label} value={card.value} />
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {ACCOUNT_SECTIONS.map((section) => (
                <div
                  key={section.title}
                  className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4"
                >
                  <p className="text-sm font-semibold text-white">{section.title}</p>
                  <div className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
                    <span className="font-semibold text-white">{draftCode}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">서랍 저장</span>
                    <span className="font-semibold text-white">{drawerCount}개</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">주문 진행</span>
                    <span className="font-semibold text-cyan-100">{orderCount}건</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-3">
              <Link
                href="/storage"
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                서랍 열기
              </Link>
              <Link
                href="/order-check"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                주문확인 보기
              </Link>
              <Link
                href="/workbench/keyring"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                작업대로 이동
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}