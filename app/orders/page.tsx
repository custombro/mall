"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type OrderTab = "ready" | "grouped" | "production" | "vip";
type OrderStatus = "견적확정" | "주문전" | "제작전달" | "진행중";

type OrderItem = {
  id: string;
  title: string;
  source: string;
  spec: string;
  qty: number;
  amount: number;
  status: OrderStatus;
  note: string;
};

const TABS: { key: OrderTab; title: string; description: string }[] = [
  { key: "ready", title: "주문 준비", description: "작업대와 서랍에서 넘어온 항목을 결제 전 정리" },
  { key: "grouped", title: "묶음 정리", description: "같은 프로젝트/행사 단위로 묶어서 주문" },
  { key: "production", title: "생산 전달", description: "제작 스펙을 생산 흐름으로 넘기기 전 확인" },
  { key: "vip", title: "VIP / 대량", description: "대량 주문과 빠른 견적을 우선 처리" },
];

const READY_ITEMS: OrderItem[] = [
  {
    id: "ready-1",
    title: "기본 키링 30개",
    source: "작업대",
    spec: "투명 · 3T · 자유형 · 단면 · D고리 실버 · OPP 8x10",
    qty: 30,
    amount: 118800,
    status: "견적확정",
    note: "지금 바로 주문으로 넘길 수 있는 상태",
  },
  {
    id: "ready-2",
    title: "지난번 동일 재주문",
    source: "서랍",
    spec: "투명 · 3T · 자유형 · 양면 · D고리 골드",
    qty: 50,
    amount: 247500,
    status: "주문전",
    note: "수량만 조정 후 바로 결제 가능",
  },
];

const GROUPED_ITEMS: OrderItem[] = [
  {
    id: "group-1",
    title: "봄 행사 묶음",
    source: "서랍 / 작업대 혼합",
    spec: "키링 100 + 아크릴 스탠드 20 + 포장 세트",
    qty: 120,
    amount: 892000,
    status: "견적확정",
    note: "행사 단위로 묶어 한 번에 주문",
  },
  {
    id: "group-2",
    title: "크루 굿즈 2차",
    source: "제작완료 서랍",
    spec: "키링 80 + POP 10",
    qty: 90,
    amount: 643000,
    status: "주문전",
    note: "이전 납품 기준 복제 후 일부 수정",
  },
];

const PRODUCTION_ITEMS: OrderItem[] = [
  {
    id: "prod-1",
    title: "생산 전달 대기 1",
    source: "주문 준비",
    spec: "투명 · 3T · 자유형 · 단면 · D고리 실버",
    qty: 30,
    amount: 118800,
    status: "제작전달",
    note: "파일/스펙/포장/수량 검토 후 생산 큐로 넘길 준비",
  },
  {
    id: "prod-2",
    title: "생산 전달 대기 2",
    source: "묶음 정리",
    spec: "오로라 · 5T · 자유형 · 양면 · 골드 고리",
    qty: 100,
    amount: 535000,
    status: "진행중",
    note: "제작 지시서와 함께 생산 상태로 연결 예정",
  },
];

const VIP_ITEMS: OrderItem[] = [
  {
    id: "vip-1",
    title: "VIP 프로젝트 A",
    source: "VIP 서랍",
    spec: "키링 300 + POP 30 + 패키지 세트",
    qty: 330,
    amount: 2490000,
    status: "견적확정",
    note: "프로젝트 단위로 빠른 견적 / 주문 / 납기 관리",
  },
  {
    id: "vip-2",
    title: "브랜드 런칭 세트",
    source: "VIP 서랍",
    spec: "키링 500 · 포장 변경 가능 · 납품 일정 우선",
    qty: 500,
    amount: 3760000,
    status: "주문전",
    note: "대량 주문 전용 빠른 경로",
  },
];

function formatMoney(value: number) {
  return value.toLocaleString("ko-KR") + "원";
}

function getItems(tab: OrderTab) {
  if (tab === "ready") return READY_ITEMS;
  if (tab === "grouped") return GROUPED_ITEMS;
  if (tab === "production") return PRODUCTION_ITEMS;
  return VIP_ITEMS;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const className =
    status === "견적확정"
      ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/20"
      : status === "주문전"
      ? "bg-white/10 text-white/70 border-white/10"
      : status === "제작전달"
      ? "bg-cyan-400/15 text-cyan-100 border-cyan-400/20"
      : "bg-amber-400/15 text-amber-200 border-amber-400/20";

  return (
    <span className={["rounded-full border px-2.5 py-1 text-xs font-semibold", className].join(" ")}>
      {status}
    </span>
  );
}

function OrderCard({
  item,
  active,
  onSelect,
}: {
  item: OrderItem;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={[
        "w-full rounded-[24px] border p-4 text-left transition",
        active
          ? "border-cyan-400/30 bg-cyan-400/10"
          : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-300/80">{item.source}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-white/70">
        <p>{item.spec}</p>
        <p>{item.qty.toLocaleString()}개</p>
        <p className="font-semibold text-white">{formatMoney(item.amount)}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-6 text-white/60">
        {item.note}
      </div>
    </button>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState<OrderTab>("ready");
  const [selectedId, setSelectedId] = useState<string>("ready-1");

  const items = useMemo(() => getItems(tab), [tab]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const summary = useMemo(() => {
    const total = items.reduce((acc, item) => acc + item.amount, 0);
    const qty = items.reduce((acc, item) => acc + item.qty, 0);

    return {
      total,
      qty,
      nextAction:
        tab === "ready"
          ? "결제 전 최종 옵션/수량/금액 확인"
          : tab === "grouped"
          ? "프로젝트 단위로 묶어서 한 번에 주문"
          : tab === "production"
          ? "생산 전달 전 스펙과 파일 상태 확인"
          : "VIP 대량 주문을 빠르게 확정",
    };
  }, [items, tab]);

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO ORDER HUB</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                작업대와 서랍에서 넘어온 주문을
                <br />
                생산으로 넘기기 전 한 번에 정리한다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                이 페이지는 일반 장바구니가 아니라 주문 정리 허브입니다.
                작업대에서 만든 항목, 서랍에서 불러온 항목, VIP 프로젝트 묶음을 한곳에서 정리하고 생산 흐름으로 넘길 준비를 합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/workbench/keyring" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  작업대로 이동
                </Link>
                <Link href="/storage" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  서랍 콘솔
                </Link>
                <Link href="/order-check" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  주문확인 보기
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">현재 탭 요약</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">수량 합계</p>
                  <p className="mt-2 text-2xl font-bold text-white">{summary.qty.toLocaleString()}개</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">금액 합계</p>
                  <p className="mt-2 text-xl font-bold text-white">{formatMoney(summary.total)}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">다음 액션</p>
                  <p className="mt-2 text-sm font-medium text-cyan-50">{summary.nextAction}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">주문 분기</p>
              <h2 className="mt-2 text-2xl font-bold text-white">같은 화면에서 다른 속도의 주문을 처리</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              탭별로 <span className="ml-2 font-semibold text-white">주문 목적이 달라진다</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {TABS.map((item) => {
              const active = item.key === tab;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setTab(item.key);
                    setSelectedId(getItems(item.key)[0].id);
                  }}
                  className={[
                    "rounded-[22px] border p-4 text-left transition",
                    active
                      ? "border-cyan-400/30 bg-cyan-400/12"
                      : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-xs leading-6 text-white/60">{item.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <section className="space-y-4">
            {items.map((item) => (
              <OrderCard
                key={item.id}
                item={item}
                active={selected.id === item.id}
                onSelect={setSelectedId}
              />
            ))}
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">선택된 주문</p>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-lg font-bold text-white">{selected.title}</p>
              <p className="mt-2 text-sm text-white/70">{selected.spec}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">수량</p>
                  <p className="mt-2 font-semibold text-white">{selected.qty.toLocaleString()}개</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">금액</p>
                  <p className="mt-2 font-semibold text-white">{formatMoney(selected.amount)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">지금 할 수 있는 일</p>
                <div className="mt-3 space-y-2 text-sm text-cyan-50">
                  <p>· 옵션과 수량 최종 확인</p>
                  <p>· 같은 프로젝트 항목과 묶기</p>
                  <p>· 생산 전달 전 파일/스펙 검토</p>
                  <p>· 주문확인 흐름으로 넘어갈 준비</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                주문 확정
              </button>
              <Link
                href="/order-check"
                className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
              >
                주문확인으로 넘기기
              </Link>
              <Link
                href="/storage"
                className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
              >
                서랍으로 돌아가기
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}