"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  loadDrawerEntries,
  saveOrderFromDraft,
  saveWorkbenchDraft,
  type DrawerEntry,
} from "../../lib/cbmall-store";

type DrawerTab = "recent" | "saved" | "completed" | "vip";

type DisplayItem = {
  id: string;
  title: string;
  product: string;
  spec: string;
  lastUsed: string;
  qty: number;
  tag: string;
  note: string;
  draft?: DrawerEntry["draft"];
};

const TABS: { key: DrawerTab; title: string; summary: string }[] = [
  { key: "recent", title: "최근 작업", summary: "방금 저장한 항목 다시 열기" },
  { key: "saved", title: "저장 스펙", summary: "반복 주문용 조합 관리" },
  { key: "completed", title: "제작완료", summary: "완료품 기준 재주문" },
  { key: "vip", title: "VIP / 대량", summary: "프로젝트 단위 빠른 호출" },
];

const COMPLETED_ITEMS: DisplayItem[] = [
  {
    id: "completed-1",
    title: "납품 완료 3월 캠페인",
    product: "아크릴 키링",
    spec: "투명 · 3T · 양면 · D고리 골드",
    lastUsed: "2026-03-20",
    qty: 300,
    tag: "완료품",
    note: "완료 기준으로 복제 후 재주문",
  },
];

const VIP_ITEMS: DisplayItem[] = [
  {
    id: "vip-1",
    title: "VIP 프로젝트 A",
    product: "프로젝트 묶음",
    spec: "키링 300 + POP 30 + 패키지 세트",
    lastUsed: "오늘 11:00",
    qty: 330,
    tag: "프로젝트 단위",
    note: "개별 상품이 아니라 프로젝트 단위로 다시 부르는 콘솔",
  },
];

function DrawerListCard({
  item,
  active,
  onClick,
}: {
  item: DisplayItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
          : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-1 text-xs text-slate-400">{item.product}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200">
          {item.tag}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-300">{item.spec}</p>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>{item.qty}개</span>
        <span>{item.lastUsed}</span>
      </div>
    </button>
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

export default function StoragePage() {
  const router = useRouter();

  const [tab, setTab] = useState<DrawerTab>("recent");
  const [entries, setEntries] = useState<DrawerEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const loaded = loadDrawerEntries();
    setEntries(loaded);
    if (loaded[0]) {
      setSelectedId(loaded[0].id);
    }
  }, []);

  const dynamicItems = useMemo<DisplayItem[]>(() => {
    return entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      product: entry.product,
      spec: entry.spec,
      lastUsed: new Date(entry.updatedAt).toLocaleString("ko-KR"),
      qty: entry.qty,
      tag: "실제 저장 항목",
      note: "작업대에서 저장된 실제 서랍 항목입니다.",
      draft: entry.draft,
    }));
  }, [entries]);

  const items = useMemo<DisplayItem[]>(() => {
    if (tab === "recent" || tab === "saved") {
      return dynamicItems;
    }
    if (tab === "completed") {
      return COMPLETED_ITEMS;
    }
    return VIP_ITEMS;
  }, [dynamicItems, tab]);

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

  const realSavedCount = entries.length.toString();
  const reorderReadyCount = useMemo(() => {
    return (entries.filter((entry) => entry.qty > 0).length || 0).toString();
  }, [entries]);

  const handleOpen = () => {
    if (selected?.draft) {
      saveWorkbenchDraft(selected.draft);
    }
    router.push("/workbench/keyring");
  };

  const handleReorder = () => {
    if (selected?.draft) {
      saveOrderFromDraft(selected.draft, "drawer");
    }
    router.push("/orders");
  };

  return (
    <main className="min-h-screen bg-[#0a0f18] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              STORAGE / DRAWER
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              서랍
            </h1>
          </div>
          <p className="max-w-xl text-sm text-slate-300">
            저장된 작업을 고르고, 상세를 확인한 뒤, 다시 작업대로 열거나 주문으로 넘기는 단순 화면입니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">서랍 구분</p>
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
                      <p className="mt-1 text-xs text-slate-400">{item.summary}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">항목 목록</p>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
                  아직 저장된 항목이 없다. 작업대에서 먼저 저장하면 여기에 바로 나타난다.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <DrawerListCard
                      key={item.id}
                      item={item}
                      active={item.id === selected?.id}
                      onClick={() => setSelectedId(item.id)}
                    />
                  ))}
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
                    {selected?.title ?? "선택된 항목 없음"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {selected?.note ?? "좌측에서 저장 항목을 선택하면 상세 정보가 표시됩니다."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 구분</p>
                  <p className="mt-1 font-semibold text-white">
                    {TABS.find((item) => item.key === tab)?.title ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryChip label="제품" value={selected?.product ?? "-"} />
                <SummaryChip label="사양" value={selected?.spec ?? "-"} />
                <SummaryChip label="수량" value={selected ? `${selected.qty}개` : "-"} />
                <SummaryChip label="최근 사용" value={selected?.lastUsed ?? "-"} />
                <SummaryChip label="태그" value={selected?.tag ?? "-"} />
                <SummaryChip
                  label="작업 연결"
                  value={selected?.draft ? "실제 draft 연결됨" : "샘플 / 참고 항목"}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">상세 메모</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {selected?.note ?? "선택된 항목이 없습니다."}
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
                  href="/orders"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  주문 허브
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
                  RIGHT / 상태 · 실행
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">실행 카드</h2>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-400">실제 저장 항목</span>
                      <span className="font-semibold text-white">{realSavedCount}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-400">재호출 가능</span>
                      <span className="font-semibold text-cyan-100">{reorderReadyCount}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">선택 요약</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                        {selected?.product ?? "-"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                        {selected?.qty ? `${selected.qty}개` : "-"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                        {selected?.tag ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    onClick={handleOpen}
                    className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selected}
                  >
                    작업대로 열기
                  </button>

                  <button
                    type="button"
                    onClick={handleReorder}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selected}
                  >
                    재주문
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm font-semibold text-emerald-50">현재 상태</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-100/90">
                <li>• 저장 항목을 선택하면 중앙 상세가 바로 바뀝니다.</li>
                <li>• draft가 있는 항목은 작업대/주문 흐름으로 그대로 이어집니다.</li>
                <li>• 샘플 항목도 동일 구조로 먼저 검토할 수 있습니다.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}