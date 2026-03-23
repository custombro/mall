"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AccountMode = "일반" | "VIP";

const ACCOUNT_MODES = [
  {
    key: "일반",
    title: "일반 계정 모드",
    description: "최근 작업, 재주문, 주문확인 중심의 빠른 접근",
  },
  {
    key: "VIP",
    title: "VIP / 프로젝트 모드",
    description: "프로젝트 단위 재주문, 빠른 견적, 대량 주문 우선",
  },
] as const;

const PROFILE_CARDS = [
  { label: "최근 주문", value: "14건", note: "이번 달 기준" },
  { label: "저장 스펙", value: "9개", note: "서랍 저장 기준" },
  { label: "진행중 주문", value: "3건", note: "출력/가공/조립 포함" },
  { label: "VIP 프로젝트", value: "2개", note: "프로젝트 단위 관리" },
] as const;

const QUICK_LINKS = [
  {
    title: "최근 작업 이어하기",
    description: "서랍에서 마지막 작업을 열고 수량만 바꿔 재주문",
    href: "/storage",
  },
  {
    title: "주문확인 보기",
    description: "고객 진행 / 제작 진행 상태를 이벤트 근거로 확인",
    href: "/order-check",
  },
  {
    title: "주문 정리 보기",
    description: "작업대와 서랍에서 넘어온 주문을 생산 전달 전 정리",
    href: "/orders",
  },
  {
    title: "작업대로 이동",
    description: "키링 작업대에서 자재/부자재 조합 다시 시작",
    href: "/workbench/keyring",
  },
] as const;

const ACCOUNT_SECTIONS = [
  {
    title: "재주문 빠른 경로",
    items: [
      "지난번과 동일 열기",
      "완료품 기준 복제 후 재주문",
      "수량만 바꿔 바로 주문",
    ],
  },
  {
    title: "주문 흐름 확인",
    items: [
      "접수 / 제작대기 확인",
      "출력중 / 가공중 / 조립중 / 검수 / 출고완료 읽기",
      "근거 이벤트와 송장번호 확인",
    ],
  },
  {
    title: "VIP 관리",
    items: [
      "프로젝트 단위 저장 스펙",
      "대량 주문 빠른 견적",
      "담당자 요청과 납기 관리 확장 준비",
    ],
  },
] as const;

export default function MyPage() {
  const [mode, setMode] = useState<(typeof ACCOUNT_MODES)[number]["key"]>("일반");

  const summary = useMemo(() => {
    return mode === "일반"
      ? {
          title: "최근 작업과 재주문을 가장 빠르게 꺼내는 계정 허브",
          note: "내정보는 설정 화면보다 작업 속도를 먼저 챙긴다.",
        }
      : {
          title: "VIP 프로젝트와 대량 주문을 바로 처리하는 계정 허브",
          note: "VIP는 일반 고객보다 빠른 재사용과 프로젝트 단위 관리가 중요하다.",
        };
  }, [mode]);

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO MY HUB</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                내정보는 설정창이 아니라
                <br />
                다시 작업하기 위한 계정 허브다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                내정보는 단순한 프로필 페이지가 아니라 최근 작업, 저장 스펙, 진행중 주문,
                VIP 프로젝트를 빠르게 여는 계정 허브입니다.
                자주 오는 손님과 VIP가 시간을 뺏기지 않도록 가장 많이 다시 찾는 동선을 먼저 배치합니다.
              </p>

              <div className="flex flex-wrap gap-3">
                {ACCOUNT_MODES.map((item) => {
                  const active = item.key === mode;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setMode(item.key)}
                      className={[
                        "rounded-full border px-5 py-3 text-sm font-semibold transition",
                        active
                          ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                          : "border-white/15 text-white/75 hover:border-white/30 hover:bg-white/[0.05] hover:text-white",
                      ].join(" ")}
                    >
                      {item.title}
                    </button>
                  );
                })}
                <Link href="/storage" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  서랍 열기
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">현재 모드</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">요약</p>
                  <p className="mt-2 text-lg font-bold text-white">{summary.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{summary.note}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">원칙</p>
                  <p className="mt-2 text-sm font-medium text-cyan-50">
                    설정은 나중이고, 지금 가장 자주 다시 쓰는 흐름을 먼저 보여준다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {PROFILE_CARDS.map((card) => (
            <div key={card.label} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{card.label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{card.value}</p>
              <p className="mt-2 text-sm text-white/55">{card.note}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
          <section className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">빠른 접근</p>
              <h2 className="mt-2 text-2xl font-bold text-white">다시 자주 들어가는 곳을 가장 먼저 배치</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {QUICK_LINKS.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-[24px] border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-xs leading-6 text-white/60">{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {ACCOUNT_SECTIONS.map((section) => (
                <div key={section.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm font-semibold text-white">{section.title}</p>
                  <div className="mt-4 space-y-3">
                    {section.items.map((item, index) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-6 text-white/70">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">즉시 이동</p>
            <div className="mt-4 grid gap-3">
              <Link href="/storage" className="rounded-2xl bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                최근 작업 / 서랍 열기
              </Link>
              <Link href="/orders" className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                주문 정리 보기
              </Link>
              <Link href="/order-check" className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                주문확인 보기
              </Link>
              <Link href="/workbench" className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                제작 허브로 이동
              </Link>
            </div>

            <div className="mt-5 rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">다음 확장</p>
              <div className="mt-3 space-y-2 text-sm text-cyan-50">
                <p>· 실제 계정 데이터 연결</p>
                <p>· 포인트 / 쿠폰 / 배송지 관리 연결</p>
                <p>· VIP 담당자 메모 / 프로젝트 히스토리 확장</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}