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
} from "../lib/cbmall-store";

type EntryMode = "둘러보기" | "공방 허브";

const ENTRY_MODES = [
  {
    key: "둘러보기",
    title: "둘러보기로 시작",
    description: "처음 오는 손님이 공방 흐름을 이해한 뒤 작업대로 들어가는 입문형 진입",
  },
  {
    key: "공방 허브",
    title: "공방 허브",
    description: "자주 오는 손님과 VIP가 바로 제작에 들어가는 빠른 진입",
  },
] as const;

const QUICK_PATHS = [
  {
    title: "처음 방문",
    description: "기본조합으로 시작해 공방 흐름을 짧게 익히는 경로",
    action: "기본조합으로 시작",
    href: "/workbench/keyring",
  },
  {
    title: "자주 오는 손님",
    description: "최근 작업을 열고 수량만 바꿔 빠르게 재주문하는 경로",
    action: "최근 작업 열기",
    href: "/storage",
  },
  {
    title: "하이 레벨",
    description: "자재/두께/홀 위치/인쇄를 세부 제어하는 경로",
    action: "작업대 세부 설정",
    href: "/workbench/keyring",
  },
  {
    title: "VIP / 대량",
    description: "프로젝트 단위 서랍과 빠른 주문 흐름으로 진입하는 경로",
    action: "VIP 서랍 열기",
    href: "/storage",
  },
] as const;

const HUB_CARDS = [
  {
    title: "제작",
    eyebrow: "WORKBENCH",
    description: "자재칸 → 작업대 → 부자재칸 흐름으로 실제 제품을 조합하는 중심 화면",
    href: "/workbench",
    cta: "공방 허브로 이동",
  },
  {
    title: "서랍",
    eyebrow: "DRAWER",
    description: "최근 작업, 저장 스펙, 제작완료품, VIP 프로젝트를 빠르게 다시 여는 재주문 콘솔",
    href: "/storage",
    cta: "서랍 열기",
  },
  {
    title: "주문확인",
    eyebrow: "ORDER CHECK",
    description: "고객 진행과 제작자 진행을 분리해 현재 단계와 근거 이벤트를 읽는 화면",
    href: "/order-check",
    cta: "주문확인 보기",
  },
  {
    title: "주문",
    eyebrow: "ORDERS",
    description: "작업대와 서랍에서 넘어온 주문을 정리하고 생산 흐름과 연결하는 구간",
    href: "/orders",
    cta: "주문 목록 보기",
  },
] as const;

const SYSTEM_PRINCIPLES = [
  "작업대가 중심이고 상품 상세는 그 뒤에 온다",
  "서랍은 저장소가 아니라 시간 절약 장치다",
  "주문확인은 상태명보다 근거 이벤트를 먼저 보여준다",
  "시선전환은 선택형이고 기본은 빠른 작업 흐름이다",
] as const;

function formatDate(value?: string) {
  if (!value) return "아직 없음";
  try {
    return new Date(value).toLocaleString("ko-KR");
  } catch {
    return value;
  }
}

function LiveCard({
  title,
  description,
  primary,
  secondary,
  href,
  cta,
}: {
  title: string;
  description: string;
  primary: string;
  secondary: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[24px] border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/60">{description}</p>
      <p className="mt-4 break-all text-base font-bold text-white">{primary}</p>
      <p className="mt-2 text-xs leading-5 text-white/45">{secondary}</p>
      <div className="mt-4 inline-flex rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white/80">
        {cta}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [entryMode, setEntryMode] = useState<EntryMode>("공방 허브");
  const [drawerEntries, setDrawerEntries] = useState<DrawerEntry[]>([]);
  const [orderEntries, setOrderEntries] = useState<OrderEntry[]>([]);
  const [draft, setDraft] = useState<WorkbenchDraft | null>(null);

  useEffect(() => {
    setDrawerEntries(loadDrawerEntries());
    setOrderEntries(loadOrderEntries());
    setDraft(loadWorkbenchDraft());
  }, []);

  const modeInfo = ENTRY_MODES.find((item) => item.key === entryMode) ?? ENTRY_MODES[1];
  const latestDrawer = drawerEntries[0] ?? null;
  const latestOrder = orderEntries[0] ?? null;

  const summary = useMemo(() => {
    return {
      title:
        entryMode === "둘러보기"
          ? "처음 오는 손님도 공방 흐름을 짧게 이해"
          : "자주 오는 손님과 VIP가 시간을 뺏기지 않음",
      description:
        entryMode === "둘러보기"
          ? "둘러보기는 입문용이다. 구조를 이해한 뒤 작업대로 전환한다."
          : "기본은 작업대와 서랍 중심의 빠른 경로다. 느린 연출을 강요하지 않는다.",
    };
  }, [entryMode]);

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO MALL HUB</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                공방을 이해할 수도 있고
                <br />
                바로 작업대에 들어갈 수도 있다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                좌측 자재 랙, 중앙 작업대, 우측 부자재, 뒤쪽 서랍으로 이어지는 공방 허브만 남긴다.
              </p>
              <div className="flex flex-wrap gap-3">
                {ENTRY_MODES.map((mode) => {
                  const active = mode.key === entryMode;
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setEntryMode(mode.key)}
                      className={[
                        "rounded-full border px-5 py-3 text-sm font-semibold transition",
                        active
                          ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                          : "border-white/15 text-white/75 hover:border-white/30 hover:bg-white/[0.05] hover:text-white",
                      ].join(" ")}
                    >
                      {mode.key}
                    </button>
                  );
                })}
                <Link href="/workbench/keyring" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  제작 시작
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">현재 진입 모드</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">모드</p>
                  <p className="mt-2 text-lg font-bold text-white">{modeInfo.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{modeInfo.description}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">판정</p>
                  <p className="mt-2 text-sm font-medium text-cyan-50">{summary.title}</p>
                  <p className="mt-2 text-sm leading-6 text-cyan-100/80">{summary.description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">실제 서랍 항목</p>
            <p className="mt-3 text-3xl font-bold text-white">{drawerEntries.length}</p>
            <p className="mt-2 text-sm text-white/55">작업대에서 저장된 실제 항목 수</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">실제 주문 큐</p>
            <p className="mt-3 text-3xl font-bold text-white">{orderEntries.length}</p>
            <p className="mt-2 text-sm text-white/55">작업대/서랍에서 넘어온 실제 주문 수</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">최근 초안 코드</p>
            <p className="mt-3 break-all text-lg font-bold text-white">{draft?.productCode ?? "아직 없음"}</p>
            <p className="mt-2 text-sm text-white/55">최근 작업대 자동 저장 상태</p>
          </div>
        </section>

        

        

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <section className="grid gap-4 md:grid-cols-2">
            {HUB_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{card.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-bold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{card.description}</p>
                <div className="mt-5 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white">
                  {card.cta}
                </div>
              </Link>
            ))}
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">시스템 원칙</p>
            <div className="mt-4 space-y-3">
              {SYSTEM_PRINCIPLES.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-white/70">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}