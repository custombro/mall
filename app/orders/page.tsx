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
  { key: "ready", title: "주문 준비", description: "작업대와 서랍에서 넘어온 실제 항목 정리" },
  { key: "grouped", title: "묶음 정리", description: "프로젝트/행사 단위로 묶어서 주문" },
  { key: "production", title: "생산 전달", description: "생산 큐로 넘기기 전 마지막 확인" },
  { key: "vip", title: "VIP / 대량", description: "대량 주문과 빠른 견적 우선 처리" },
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
      ? "border-emerald-400/20 bg-emerald-400/15 text-emerald-200"
      : status === "주문전"
        ? "border-white/10 bg-white/10 text-white/80"
        : status === "제작전달"
          ? "border-cyan-400/20 bg-cyan-400/15 text-cyan-100"
          : "border-amber-400/20 bg-amber-400/15 text-amber-200";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] ${className}`}>
      {status}
    </span>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();

  const [tab, setTab] = useState<OrderTab>("ready");
  const [entries, setEntries] = useState<OrderEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const loaded = loadOrderEntries();
    setEntries(loaded);
    if (loaded[0]) {
      setSelectedId(loaded[0].id);
    }
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

  const items = useMemo<DisplayOrder[]>(() => {
    if (tab === "ready") return dynamicReady;
    if (tab === "grouped") return STATIC_GROUPED;
    if (tab === "production") return STATIC_PRODUCTION;
    return STATIC_VIP;
  }, [dynamicReady, tab]);

  useEffect(() => {
    if (!items.length) {
      setSelectedId("");
      return;
    }

    if (!items.find((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const selected = useMemo(() => {
    return items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  }, [items, selectedId]);

  const summary = useMemo(() => {
    const total = items.reduce((acc, item) => acc + item.amount, 0);
    const qty = items.reduce((acc, item) => acc + item.qty, 0);
    return { total, qty };
  }, [items]);

  const readyCount = entries.length.toString();

  const handleEdit = () => {
    if (selected?.draft) {
      saveWorkbenchDraft(selected.draft);
    }
    router.push("/workbench/keyring");
  };

  const handleConfirm = () => {
    router.push("/order");
  };

  return (
    <main className="min-h-screen bg-[#0a0f18] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              ORDER / HUB
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              주문 허브
            </h1>
          </div>
          <p className="max-w-xl text-sm text-slate-300">
            작업대와 서랍에서 넘어온 주문을 선택하고, 상세를 확인한 뒤, 수정 또는 주문확인으로 넘기는 단순 화면입니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">주문 구분</p>
              <div className="space-y-2">
                {TABS.map((item) => {
                  const active = item.key === tab;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTab(item.key)}
                      className={
                        active
                          ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-left"
                          : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-left transition hover:bg-white/10"
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
              <p className="text-sm font-semibold text-white">주문 목록</p>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
                  아직 실제 주문 준비 항목이 없다. 작업대에서 주문으로 넘기거나, 서랍에서 재주문하면 여기에 바로 나타난다.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const active = item.id === selected?.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={
                          active
                            ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                            : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                        }
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <StatusBadge status={item.status} />
                        </div>

                        <p className="mt-1 text-xs text-slate-400">{item.source}</p>
                        <p className="mt-3 text-xs leading-5 text-slate-300">{item.spec}</p>

                        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                          <span>{item.qty.toLocaleString()}개</span>
                          <span>{formatMoney(item.amount)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>

          <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                    CENTER / 상세
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {selected?.title ?? "선택된 주문 없음"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {selected?.note ?? "좌측에서 주문 항목을 선택하면 상세가 표시됩니다."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 탭</p>
                  <p className="mt-1 font-semibold text-white">
                    {TABS.find((item) => item.key === tab)?.title ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryChip label="주문명" value={selected?.title ?? "-"} />
                <SummaryChip label="출처" value={selected?.source ?? "-"} />
                <SummaryChip label="사양" value={selected?.spec ?? "-"} />
                <SummaryChip label="수량" value={selected ? `${selected.qty.toLocaleString()}개` : "-"} />
                <SummaryChip label="금액" value={selected ? formatMoney(selected.amount) : "-"} />
                <SummaryChip label="상태" value={selected?.status ?? "-"} />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">선택 메모</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {selected?.note ?? "선택된 주문이 없습니다."}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">이동 흐름</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/workbench/keyring"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  키링 작업대
                </Link>
                <Link
                  href="/storage"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  서랍
                </Link>
                <Link
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  홈
                </Link>
              </div>
            </div>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                  RIGHT / 실행 카드
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">주문 실행</h2>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">현재 탭 수량 합계</span>
                      <span className="font-semibold text-white">{summary.qty.toLocaleString()}개</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">현재 탭 금액 합계</span>
                      <span className="font-semibold text-cyan-100">{formatMoney(summary.total)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">실제 주문 준비 항목</span>
                      <span className="font-semibold text-white">{readyCount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selected}
                  >
                    작업대로 돌아가 수정
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selected}
                  >
                    주문확인으로 넘기기
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm font-semibold text-emerald-50">현재 상태</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-100/90">
                <li>• 실제 주문 준비 항목은 작업대/서랍 흐름과 연결됩니다.</li>
                <li>• 선택한 주문의 사양과 금액을 중앙에서 바로 확인합니다.</li>
                <li>• 수정 또는 주문확인 CTA는 우측에만 모아 중복을 줄였습니다.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}