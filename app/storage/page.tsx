"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DrawerTab = "recent" | "saved" | "completed" | "vip";

type DrawerItem = {
  id: string;
  title: string;
  product: string;
  spec: string;
  lastUsed: string;
  qty: number;
  tag: string;
  note: string;
};

const TABS: { key: DrawerTab; title: string; description: string }[] = [
  { key: "recent", title: "최근 작업", description: "방금 하던 작업을 즉시 이어서 여는 구간" },
  { key: "saved", title: "저장 스펙", description: "반복 주문용 조합을 바로 다시 여는 구간" },
  { key: "completed", title: "제작완료", description: "완료품 기준으로 재주문/복제하는 구간" },
  { key: "vip", title: "VIP / 대량", description: "프로젝트 단위 재주문과 빠른 견적 구간" },
];

const RECENT_ITEMS: DrawerItem[] = [
  {
    id: "recent-1",
    title: "어제 작업 이어하기",
    product: "아크릴 키링",
    spec: "투명 · 3T · 자유형 · D고리 실버 · OPP 8x10",
    lastUsed: "오늘 13:40",
    qty: 30,
    tag: "바로 이어서",
    note: "마지막 편집값과 수량을 유지한 채 작업대로 복귀",
  },
  {
    id: "recent-2",
    title: "최근 양면 키링",
    product: "아크릴 키링",
    spec: "투명 · 3T · 자유형 · 양면 · D고리 골드",
    lastUsed: "오늘 09:20",
    qty: 50,
    tag: "지난 작업",
    note: "고리만 바꾸고 빠르게 재진입",
  },
  {
    id: "recent-3",
    title: "최근 POP 시안",
    product: "POP",
    spec: "5T · 백색 · 파츠 조립형",
    lastUsed: "어제 18:10",
    qty: 10,
    tag: "다음 확장",
    note: "향후 POP 작업대와 연결될 저장 단위",
  },
];

const SAVED_ITEMS: DrawerItem[] = [
  {
    id: "saved-1",
    title: "가장 많이 쓰는 기본조합",
    product: "아크릴 키링",
    spec: "투명 · 3T · 자유형 · 상단 중앙 홀 · D고리 실버",
    lastUsed: "3일 전",
    qty: 10,
    tag: "기본 프리셋",
    note: "초보 손님, 빠른 주문 시작점",
  },
  {
    id: "saved-2",
    title: "행사용 대량 세트",
    product: "아크릴 키링",
    spec: "백색 · 3T · 사각형 · O링 · OPP 8x10",
    lastUsed: "1주 전",
    qty: 100,
    tag: "대량",
    note: "수량만 바꿔 바로 주문 가능한 반복 스펙",
  },
  {
    id: "saved-3",
    title: "골드 고리 시그니처",
    product: "아크릴 키링",
    spec: "오로라 · 5T · 자유형 · D고리 골드 · 클립 패키지",
    lastUsed: "2주 전",
    qty: 30,
    tag: "시그니처",
    note: "브랜드 감도 높은 대표 조합",
  },
];

const COMPLETED_ITEMS: DrawerItem[] = [
  {
    id: "completed-1",
    title: "납품 완료 3월 캠페인",
    product: "아크릴 키링",
    spec: "투명 · 3T · 양면 · D고리 골드",
    lastUsed: "2026-03-20",
    qty: 300,
    tag: "완료품",
    note: "완료 기준으로 복제 후 일부 수정",
  },
  {
    id: "completed-2",
    title: "크루 굿즈 2차",
    product: "아크릴 스탠드",
    spec: "5T · 투명 · 받침 포함",
    lastUsed: "2026-03-18",
    qty: 120,
    tag: "재주문",
    note: "이전 납품 스펙 기준으로 다시 주문",
  },
];

const VIP_ITEMS: DrawerItem[] = [
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
  {
    id: "vip-2",
    title: "브랜드 런칭 세트",
    product: "대량 주문",
    spec: "키링 500 · 포장 변경 가능 · 납품 일정 우선",
    lastUsed: "어제 16:10",
    qty: 500,
    tag: "빠른 견적",
    note: "견적/메모/담당자 요청까지 빠르게 처리",
  },
];

function DrawerCard({
  item,
  onOpen,
  onReorder,
}: {
  item: DrawerItem;
  onOpen: (id: string) => void;
  onReorder: (id: string) => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
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

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onOpen(item.id)}
          className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
        >
          작업대로 열기
        </button>
        <button
          type="button"
          onClick={() => onReorder(item.id)}
          className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          재주문
        </button>
      </div>
    </div>
  );
}

export default function StoragePage() {
  const [tab, setTab] = useState<DrawerTab>("recent");
  const [selectedId, setSelectedId] = useState<string>("recent-1");

  const tabItems = useMemo(() => {
    if (tab === "recent") return RECENT_ITEMS;
    if (tab === "saved") return SAVED_ITEMS;
    if (tab === "completed") return COMPLETED_ITEMS;
    return VIP_ITEMS;
  }, [tab]);

  const selectedItem = tabItems.find((item) => item.id === selectedId) ?? tabItems[0];

  const summary = useMemo(() => {
    const totalSaved =
      RECENT_ITEMS.length + SAVED_ITEMS.length + COMPLETED_ITEMS.length + VIP_ITEMS.length;

    return {
      totalSaved,
      fastAction:
        tab === "recent"
          ? "최근 작업을 바로 열어 이어서 진행"
          : tab === "saved"
          ? "저장 스펙을 즉시 재사용"
          : tab === "completed"
          ? "완료품 기준 복제 후 재주문"
          : "VIP 프로젝트 단위 빠른 견적 / 재주문",
    };
  }, [tab]);

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
                시간을 줄이는 재주문 콘솔이다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                최근 작업, 저장 스펙, 제작완료품, VIP 프로젝트를 한 화면에서 빠르게 다시 여는 구조로 바꿉니다.
                자주 오는 손님과 VIP가 시간을 뺏긴다고 느끼지 않도록 서랍은 보관보다 즉시 재사용이 먼저여야 합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/workbench/keyring" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  작업대로 이동
                </Link>
                <Link href="/order-check" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  주문확인 보기
                </Link>
                <Link href="/orders" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  주문 목록
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">서랍 요약</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">저장된 단위</p>
                  <p className="mt-2 text-2xl font-bold text-white">{summary.totalSaved}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">현재 빠른 동선</p>
                  <p className="mt-2 text-sm font-medium text-cyan-50">{summary.fastAction}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/65">
                  최근/저장/완료/VIP를 한 화면에서 분리해, 누구에게나 같은 느린 흐름을 강요하지 않습니다.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">빠른 분기</p>
              <h2 className="mt-2 text-2xl font-bold text-white">손님 유형별 시간을 아끼는 서랍 구조</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              선택된 탭 <span className="ml-2 font-semibold text-white">{TABS.find((item) => item.key === tab)?.title}</span>
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
                    const firstId =
                      item.key === "recent"
                        ? RECENT_ITEMS[0].id
                        : item.key === "saved"
                        ? SAVED_ITEMS[0].id
                        : item.key === "completed"
                        ? COMPLETED_ITEMS[0].id
                        : VIP_ITEMS[0].id;
                    setSelectedId(firstId);
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
            {tabItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={[
                  "w-full rounded-[26px] border text-left transition",
                  selectedItem.id === item.id
                    ? "border-cyan-400/30 bg-cyan-400/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                ].join(" ")}
              >
                <div className="p-1">
                  <DrawerCard
                    item={item}
                    onOpen={setSelectedId}
                    onReorder={setSelectedId}
                  />
                </div>
              </button>
            ))}
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">선택된 서랍 항목</p>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-lg font-bold text-white">{selectedItem.title}</p>
              <p className="mt-2 text-sm text-white/70">{selectedItem.product}</p>
              <p className="mt-3 text-sm leading-7 text-white/65">{selectedItem.spec}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">최근 사용</p>
                  <p className="mt-2 font-semibold text-white">{selectedItem.lastUsed}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">기본 수량</p>
                  <p className="mt-2 font-semibold text-white">{selectedItem.qty}개</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">즉시 할 수 있는 일</p>
                <div className="mt-3 space-y-2 text-sm text-cyan-50">
                  <p>· 작업대로 열어 마지막 상태 이어가기</p>
                  <p>· 수량만 바꿔 재주문하기</p>
                  <p>· 동일 스펙 복제 후 일부만 수정하기</p>
                  <p>· VIP 프로젝트는 묶음 단위로 빠른 견적 만들기</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <Link
                href="/workbench/keyring"
                className="rounded-2xl bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                작업대로 바로 열기
              </Link>
              <Link
                href="/orders"
                className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
              >
                수량만 바꿔 재주문
              </Link>
              <button
                type="button"
                className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
              >
                복제 후 일부 수정
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}