"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  clearanceShelves,
  clearanceStatusOptions,
  getRouteLabel,
  getStatusClass,
  type ClearanceStatus,
} from "./clearance-config";

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
    <div className="grid gap-6 xl:grid-cols-[1.02fr_1.1fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Clearance Shelves
          </p>
          <h2 className="text-2xl font-semibold text-white">재고 정리 허브</h2>
          <p className="text-sm leading-6 text-slate-300">
            남는 재고를 일반 제작 흐름과 분리해 즉시판매, 검수후판매, 묶음정리, 보류로 나눠 소진합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">정리 대상</p>
            <div className="mt-2 text-3xl font-semibold text-white">{totalItems}</div>
            <p className="mt-2 text-sm text-slate-300">전체 클리어런스 품목</p>
          </div>
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">즉시판매</p>
            <div className="mt-2 text-3xl font-semibold text-emerald-50">{fastSaleCount}</div>
            <p className="mt-2 text-sm text-emerald-100/80">바로 소진 가능한 재고</p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">핵심 개념</p>
            <div className="mt-2 text-xl font-semibold text-cyan-50">정규 흐름과 분리</div>
            <p className="mt-2 text-sm text-cyan-100/80">재고 소진 전용 공간</p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">클리어런스 선반 선택</p>
          <div className="grid gap-2">
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
                      ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{shelf.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{shelf.subtitle}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {shelf.items.length}개
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Clearance Queue
          </p>
          <h2 className="text-2xl font-semibold text-white">{selectedShelf?.title ?? "클리어런스 목록"}</h2>
          <p className="text-sm leading-6 text-slate-300">
            상태와 검색어 기준으로 지금 정리해야 할 재고를 빠르게 찾습니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">상태</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ClearanceStatus | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              {clearanceStatusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">검색</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="품목명, 패키지, 메모"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="grid gap-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
              현재 조건에 맞는 클리어런스 품목이 없습니다.
            </div>
          ) : (
            filteredItems.map((item) => {
              const active = selectedItem?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className={
                    active
                      ? "rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">{item.title}</div>
                      <div className="text-sm text-slate-300">{item.summary}</div>
                      <div className="text-sm text-cyan-100">{item.priceHint}</div>
                    </div>

                    <div className="text-sm text-slate-200">재고 {item.stockCount}개</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      <aside className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Detail / Route
          </p>
          <h2 className="text-2xl font-semibold text-white">선택 재고 상세</h2>
          <p className="text-sm leading-6 text-slate-300">
            현재 재고 상태와 원래 출처, 다음 연결 공간을 함께 본다.
          </p>
        </div>

        {selectedItem ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">{selectedItem.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedItem.note}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">카테고리</div>
                <div className="mt-1 text-slate-100">{selectedItem.category}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">수량</div>
                <div className="mt-1 text-slate-100">{selectedItem.stockCount}개</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">패키지</div>
                <div className="mt-1 text-slate-100">{selectedItem.packageType}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">원래 출처</div>
                <div className="mt-1 text-slate-100">{getRouteLabel(selectedItem.sourceRoute)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">추천 작업 공간</div>
                <div className="mt-1 text-cyan-100">{getRouteLabel(selectedItem.recommendedRoute)}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-semibold text-emerald-50">라우트 연동 요약</p>
              <div className="mt-3 grid gap-2">
                {Object.entries(routeCounts).map(([route, count]) => (
                  <div key={route} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-100">
                    {getRouteLabel(route)} · {count}개 재고 연결
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedItem.recommendedRoute}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                추천 작업 공간으로 이동
              </Link>
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
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
            품목을 선택하면 상세가 표시됩니다.
          </div>
        )}
      </aside>
    </div>
  );
}