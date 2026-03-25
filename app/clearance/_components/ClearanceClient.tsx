"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearanceShelves,
  clearanceStatusOptions,
  getRouteLabel,
  getStatusClass,
  type ClearanceStatus,
} from "./clearance-config";

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function ClearanceClient() {
  const [selectedShelfId, setSelectedShelfId] = useState(clearanceShelves[0]?.id ?? "");
  const [statusFilter, setStatusFilter] = useState<ClearanceStatus | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(clearanceShelves[0]?.items[0]?.id ?? "");

  const selectedShelf = useMemo(
    () => clearanceShelves.find((shelf) => shelf.id === selectedShelfId) ?? clearanceShelves[0],
    [selectedShelfId],
  );

  const filteredItems = useMemo(() => {
    if (!selectedShelf) return [];

    const normalizedKeyword = keyword.trim().toLowerCase();

    return selectedShelf.items.filter((item) => {
      const statusMatch = statusFilter === "전체" || item.status === statusFilter;
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          item.title,
          item.category,
          item.packageType,
          item.summary,
          item.note,
          item.priceHint,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return statusMatch && keywordMatch;
    });
  }, [keyword, selectedShelf, statusFilter]);

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedItemId("");
      return;
    }

    if (!filteredItems.find((item) => item.id === selectedItemId)) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [filteredItems, selectedItemId]);

  const selectedItem = useMemo(
    () => filteredItems.find((item) => item.id === selectedItemId) ?? filteredItems[0] ?? null,
    [filteredItems, selectedItemId],
  );

  const totalItems = useMemo(
    () => clearanceShelves.reduce((sum, shelf) => sum + shelf.items.length, 0),
    [],
  );

  const fastSaleCount = useMemo(
    () =>
      clearanceShelves
        .flatMap((shelf) => shelf.items)
        .filter((item) => item.status === "즉시판매").length,
    [],
  );

  const routeCounts = useMemo(() => {
    return clearanceShelves
      .flatMap((shelf) => shelf.items)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.recommendedRoute] = (acc[item.recommendedRoute] ?? 0) + 1;
        return acc;
      }, {});
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">클리어런스 선반</p>
          <div className="space-y-2">
            {clearanceShelves.map((shelf) => {
              const active = shelf.id === selectedShelf?.id;

              return (
                <button
                  key={shelf.id}
                  type="button"
                  onClick={() => {
                    setSelectedShelfId(shelf.id);
                    setSelectedItemId(shelf.items[0]?.id ?? "");
                  }}
                  className={
                    active
                      ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <p className="text-sm font-semibold text-white">{shelf.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{shelf.subtitle}</p>
                  <p className="mt-3 text-xs text-slate-300">{shelf.items.length}개</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">필터</p>
          <div className="grid gap-3">
            <label className="space-y-2">
              <span className="text-xs text-slate-400">상태</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ClearanceStatus | "전체")}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                {clearanceStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs text-slate-400">검색</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="품목명, 패키지, 메모"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>
        </section>
      </aside>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                CENTER / 재고 선택
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedShelf?.title ?? "클리어런스 목록"}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 선반</p>
              <p className="mt-1 font-semibold text-white">{selectedShelf?.subtitle ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryChip label="정리 대상" value={`${totalItems}개`} />
            <SummaryChip label="즉시판매" value={`${fastSaleCount}개`} />
            <SummaryChip label="현재 결과" value={`${filteredItems.length}개`} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">재고 목록</p>

          {filteredItems.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              현재 조건에 맞는 클리어런스 품목이 없습니다.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {filteredItems.map((item) => {
                const active = selectedItem?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    className={
                      active
                        ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                        : "rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-[11px] text-slate-300">{item.category}</span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.summary}</p>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-300">
                      <span>{item.priceHint}</span>
                      <span>재고 {item.stockCount}개</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">선택 재고 상세</p>

          {selectedItem ? (
            <div className="mt-3 grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedItem.category}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedItem.packageType}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white">{selectedItem.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedItem.note}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryChip label="수량" value={`${selectedItem.stockCount}개`} />
                <SummaryChip label="패키지" value={selectedItem.packageType} />
                <SummaryChip label="원래 출처" value={getRouteLabel(selectedItem.sourceRoute)} />
                <SummaryChip label="추천 작업 공간" value={getRouteLabel(selectedItem.recommendedRoute)} />
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              품목을 선택하면 상세가 표시됩니다.
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
            RIGHT / 상태 · 이동
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">실행 카드</h2>
        </div>

        <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">라우트 연동 요약</p>
          <div className="mt-3 grid gap-2">
            {Object.entries(routeCounts).map(([route, count]) => (
              <div
                key={route}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-slate-300">{getRouteLabel(route)}</span>
                <span className="font-semibold text-white">{count}개</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-3">
          {selectedItem ? (
            <Link
              href={selectedItem.recommendedRoute}
              className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              추천 작업 공간으로 이동
            </Link>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 px-4 py-3 text-center text-sm text-slate-500">
              선택된 재고 없음
            </div>
          )}

          <Link
            href="/seller"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            판매자 센터 보기
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            홈 허브로 이동
          </Link>
        </div>
      </aside>
    </div>
  );
}