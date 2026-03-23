"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  loadOrderEntries,
  saveWorkbenchDraft,
  type OrderEntry,
} from "../../lib/cbmall-store";

type OrderTab = "ready" | "grouped" | "production" | "vip";
type OrderStatus = "견적확정" | "주문전" | "제작전달" | "진행중";

type DisplayOrder = {
  id: string;
  title: string;
  source: string;
  spec: string;
  qty: number;
  amount: number;
  status: OrderStatus;
  note: string;
  draft?: OrderEntry["draft"];
};

const TABS: { key: OrderTab; title: string; description: string }[] = [
  { key: "ready", title: "주문 준비", description: "작업대와 서랍에서 넘어온 실제 항목을 정리" },
  { key: "grouped", title: "묶음 정리", description: "같은 프로젝트/행사 단위로 묶어서 주문" },
  { key: "production", title: "생산 전달", description: "제작 스펙을 생산 흐름으로 넘기기 전 확인" },
  { key: "vip", title: "VIP / 대량", description: "대량 주문과 빠른 견적을 우선 처리" },
];

const STATIC_GROUPED: DisplayOrder[] = [
  {
    id: "group-1",
    title: "봄 행사 묶음",
    source: "프로젝트",
    spec: "키링 100 + 아크릴 스탠드 20 + 포장 세트",
    qty: 120,
    amount: 892000,
    status: "견적확정",
    note: "행사 단위로 묶어 한 번에 주문",
  },
];

const STATIC_PRODUCTION: DisplayOrder[] = [
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
];

const STATIC_VIP: DisplayOrder[] = [
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
];

function formatMoney(value: number) {
  return value.toLocaleString("ko-KR") + "원";
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

export default function OrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<OrderTab>("ready");
  const [entries, setEntries] = useState<OrderEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const loaded = loadOrderEntries();
    setEntries(loaded);
    if (loaded[0]) setSelectedId(loaded[0].id);
  }, []);

  const dynamicReady = useMemo<DisplayOrder[]>(() => {
    return entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      source: entry.source,
      spec: entry.spec,
      qty: entry.qty,
      amount: entry.amount,
      status: entry.status,
      note: "작업대 또는 서랍에서 실제로 넘어온 주문 준비 항목",
      draft: entry.draft,
    }));
  }, [entries]);

  const items = useMemo(() => {
    if (tab === "ready") return dynamicReady;
    if (tab === "grouped") return STATIC_GROUPED;
    if (tab === "production") return STATIC_PRODUCTION;
    return STATIC_VIP;
  }, [tab, dynamicReady]);

  useEffect(() => {
    if (!items.length) return;
    if (!items.find((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const summary = useMemo(() => {
    const total = items.reduce((acc, item) => acc + item.amount, 0);
    const qty = items.reduce((acc, item) => acc + item.qty, 0);
    return { total, qty };
  }, [items]);

  const handleEdit = () => {
    if (selected?.draft) {
      saveWorkbenchDraft(selected.draft);
    }
    router.push("/workbench/keyring");
  };

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO ORDER HUB</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                작업대와 서랍에서 넘어온 실제 주문을
                <br />
                생산 전달 전 한 번에 정리한다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                주문 허브는 더 이상 샘플 목록이 아니라 실제 주문 준비 큐를 읽습니다.
                작업대와 서랍에서 넘어온 항목을 불러와 수량, 스펙, 금액을 확인하고 필요하면 다시 작업대로 돌려보낼 수 있습니다.
              </p>
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
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="grid gap-3 lg:grid-cols-4">
            {TABS.map((item) => {
              const active = item.key === tab;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
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
            {items.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 text-sm text-white/65">
                아직 실제 주문 준비 항목이 없다. 작업대에서 주문으로 넘기거나, 서랍에서 재주문하면 여기에 바로 나타난다.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={[
                    "w-full rounded-[24px] border p-4 text-left transition",
                    selected?.id === item.id
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
              ))
            )}
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            {selected ? (
              <>
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
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    작업대로 돌아가 수정
                  </button>
                  <Link
                    href="/order-check"
                    className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                  >
                    주문확인으로 넘기기
                  </Link>
                </div>
              </>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}