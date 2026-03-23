"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadDrawerEntries, loadOrderEntries, loadWorkbenchDraft } from "../../lib/cbmall-store";

type StartMode = "입문형" | "빠른 작업";

const START_MODES = [
  {
    key: "입문형",
    title: "입문형 시작",
    description: "처음 오는 손님이 공방 흐름을 이해한 뒤 상품군을 고르는 방식",
  },
  {
    key: "빠른 작업",
    title: "빠른 작업 시작",
    description: "자주 오는 손님과 VIP가 바로 상품군과 작업대로 진입하는 방식",
  },
] as const;

const PRODUCT_FAMILIES = [
  {
    title: "키링",
    status: "지금 작업 가능",
    description: "작업대 중심 구조가 가장 먼저 반영된 대표 상품군",
    href: "/workbench/keyring",
    cta: "키링 작업대 열기",
  },
  {
    title: "POP",
    status: "다음 단계",
    description: "파츠 조합, 스냅 가이드, 레이어 결합 중심으로 확장될 상품군",
    href: "/workbench/keyring",
    cta: "구조 참고",
  },
  {
    title: "아크릴 스탠드",
    status: "확장 예정",
    description: "받침 결합과 두께/재단 중심으로 확장될 상품군",
    href: "/workbench/keyring",
    cta: "구조 참고",
  },
] as const;

const QUICK_ACTIONS = [
  { title: "최근 작업 이어하기", href: "/storage", description: "서랍에서 마지막 작업 바로 열기" },
  { title: "VIP 서랍 열기", href: "/storage", description: "프로젝트 단위 재주문 / 빠른 견적" },
  { title: "주문 정리 보기", href: "/orders", description: "작업대와 서랍에서 넘어온 주문 정리" },
  { title: "주문확인 보기", href: "/order-check", description: "고객 진행 / 제작 진행 상태 확인" },
] as const;

export default function WorkbenchHubPage() {
  const [startMode, setStartMode] = useState<(typeof START_MODES)[number]["key"]>("빠른 작업");
  const [drawerCount, setDrawerCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [draftCode, setDraftCode] = useState("아직 없음");

  useEffect(() => {
    setDrawerCount(loadDrawerEntries().length);
    setOrderCount(loadOrderEntries().length);
    setDraftCode(loadWorkbenchDraft()?.productCode ?? "아직 없음");
  }, []);

  const summary = useMemo(() => {
    return startMode === "입문형"
      ? {
          title: "공방 흐름을 이해한 뒤 상품군 선택",
          description: "자재칸 → 작업대 → 부자재칸 → 서랍으로 이어지는 구조를 먼저 읽는다.",
        }
      : {
          title: "상품군 선택 후 바로 작업대 진입",
          description: "컨셉 설명보다 작업 속도를 우선하고, 최근 작업/서랍/VIP 경로를 함께 연다.",
        };
  }, [startMode]);

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO WORKBENCH HUB</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                상품을 고르는 게 아니라
                <br />
                어떤 작업대로 들어갈지 고른다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                제작 허브는 일반 카테고리 페이지가 아닙니다.
                공방형 제작 시스템 안에서 어떤 작업 흐름으로 들어갈지 정하는 허브이며,
                실제 서랍/주문/초안 상태를 함께 보여줍니다.
              </p>
              <div className="flex flex-wrap gap-3">
                {START_MODES.map((mode) => {
                  const active = mode.key === startMode;
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setStartMode(mode.key)}
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
                <Link href="/storage" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  서랍 열기
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">실제 상태</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">최근 초안 코드</p>
                  <p className="mt-2 break-all text-base font-semibold text-white">{draftCode}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">서랍</p>
                    <p className="mt-2 font-semibold text-white">{drawerCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">주문</p>
                    <p className="mt-2 font-semibold text-white">{orderCount}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">현재 진입 방식</p>
                  <p className="mt-2 text-sm font-medium text-cyan-50">{summary.title}</p>
                  <p className="mt-2 text-sm leading-6 text-cyan-100/80">{summary.description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <section className="grid gap-4 md:grid-cols-3">
            {PRODUCT_FAMILIES.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{item.status}</p>
                <h2 className="mt-3 text-2xl font-bold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
                <div className="mt-5 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white">
                  {item.cta}
                </div>
              </Link>
            ))}
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">빠른 경로</p>
            <div className="mt-4 space-y-3">
              {QUICK_ACTIONS.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-xs leading-6 text-white/60">{item.description}</p>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}