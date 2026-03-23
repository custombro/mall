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

const TABS: { key: DrawerTab; title: string; description: string }[] = [
  { key: "recent", title: "최근 작업", description: "방금 하던 작업을 즉시 이어서 여는 구간" },
  { key: "saved", title: "저장 스펙", description: "반복 주문용 조합을 바로 다시 여는 구간" },
  { key: "completed", title: "제작완료", description: "완료품 기준으로 재주문/복제하는 구간" },
  { key: "vip", title: "VIP / 대량", description: "프로젝트 단위 재주문과 빠른 견적 구간" },
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

function DrawerCard({
  item,
  active,
  onSelect,
}: {
  item: DisplayItem;
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
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-300/80">{item.tag}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-white/60">
          {item.qty}개
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-white/70">
        <p>{item.product}</p>
        <p>{item.spec}</p>
        <p className="text-xs text-white/45">마지막 사용: {item.lastUsed}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-6 text-white/60">
        {item.note}
      </div>
    </button>
  );
}

export default function StoragePage() {
  const router = useRouter();
  const [tab, setTab] = useState<DrawerTab>("recent");
  const [entries, setEntries] = useState<DrawerEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const loaded = loadDrawerEntries();
    setEntries(loaded);
    if (loaded[0]) setSelectedId(loaded[0].id);
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

  const items = useMemo(() => {
    if (tab === "recent") return dynamicItems;
    if (tab === "saved") return dynamicItems;
    if (tab === "completed") return COMPLETED_ITEMS;
    return VIP_ITEMS;
  }, [tab, dynamicItems]);

  useEffect(() => {
    if (!items.length) return;
    if (!items.find((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

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
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO DRAWER CONSOLE</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                서랍은 저장소가 아니라
                <br />
                다시 여는 실행 콘솔이다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                이제 작업대에서 저장한 실제 항목이 이 화면에 들어옵니다.
                서랍에서 작업대로 다시 열거나 주문으로 바로 넘기는 흐름이 동작합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/workbench/keyring" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  작업대로 이동
                </Link>
                <Link href="/orders" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  주문 허브 보기
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">서랍 요약</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">실제 저장 항목</p>
                  <p className="mt-2 text-2xl font-bold text-white">{entries.length}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">핵심</p>
                  <p className="mt-2 text-sm font-medium text-cyan-50">저장 후 다시 여는 속도를 높인다</p>
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
                아직 실제 저장된 서랍 항목이 없다. 키링 작업대에서 먼저 저장하면 여기에 바로 나타난다.
              </div>
            ) : (
              items.map((item) => (
                <DrawerCard
                  key={item.id}
                  item={item}
                  active={selected?.id === item.id}
                  onSelect={setSelectedId}
                />
              ))
            )}
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            {selected ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">선택된 항목</p>
                <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-lg font-bold text-white">{selected.title}</p>
                  <p className="mt-2 text-sm text-white/70">{selected.product}</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">{selected.spec}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/45">수량</p>
                      <p className="mt-2 font-semibold text-white">{selected.qty}개</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/45">최근 사용</p>
                      <p className="mt-2 font-semibold text-white">{selected.lastUsed}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    onClick={handleOpen}
                    className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    작업대로 열기
                  </button>
                  <button
                    type="button"
                    onClick={handleReorder}
                    className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                  >
                    재주문
                  </button>
                </div>
              </>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}