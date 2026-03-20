"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getRouteLabel,
  getStatusClass,
  partCategoryOptions,
  partWalls,
  type PartCategory,
} from "./parts-config";

export default function PartsRoomClient() {
  const [selectedWallId, setSelectedWallId] = useState(partWalls[0]?.id ?? "");
  const [categoryFilter, setCategoryFilter] = useState<PartCategory | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedPartId, setSelectedPartId] = useState(partWalls[0]?.parts[0]?.id ?? "");

  const selectedWall = useMemo(
    () => partWalls.find((wall) => wall.id === selectedWallId) ?? partWalls[0],
    [selectedWallId],
  );

  const filteredParts = useMemo(() => {
    if (!selectedWall) return [];

    const normalizedKeyword = keyword.trim().toLowerCase();

    return selectedWall.parts.filter((part) => {
      const categoryMatch = categoryFilter === "전체" || part.category === categoryFilter;
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          part.title,
          part.binCode,
          part.finish,
          part.note,
          part.compatibleProducts.join(" "),
          part.category,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return categoryMatch && keywordMatch;
    });
  }, [categoryFilter, keyword, selectedWall]);

  const selectedPart = useMemo(
    () => filteredParts.find((part) => part.id === selectedPartId) ?? filteredParts[0] ?? null,
    [filteredParts, selectedPartId],
  );

  const totalParts = useMemo(
    () => partWalls.reduce((sum, wall) => sum + wall.parts.length, 0),
    [],
  );

  const lowStockCount = useMemo(
    () =>
      partWalls
        .flatMap((wall) => wall.parts)
        .filter((part) => part.status === "주의" || part.status === "부족").length,
    [],
  );

  const routeCounts = useMemo(() => {
    return partWalls
      .flatMap((wall) => wall.parts)
      .reduce<Record<string, number>>((acc, part) => {
        acc[part.recommendedRoute] = (acc[part.recommendedRoute] ?? 0) + 1;
        return acc;
      }, {});
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_1.1fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Parts Wall
          </p>
          <h2 className="text-2xl font-semibold text-white">부자재 벽면 존</h2>
          <p className="text-sm leading-6 text-slate-300">
            링, 체인, 스탠드, 자석, 보조파츠를 벽면/트레이 개념으로 분리해 다음 작업 흐름을 빠르게 결정합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">등록 파츠</p>
            <div className="mt-2 text-3xl font-semibold text-white">{totalParts}</div>
            <p className="mt-2 text-sm text-slate-300">전체 부자재 기준</p>
          </div>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-100/80">주의/부족</p>
            <div className="mt-2 text-3xl font-semibold text-amber-50">{lowStockCount}</div>
            <p className="mt-2 text-sm text-amber-100/80">보충 필요 파츠</p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">핵심 개념</p>
            <div className="mt-2 text-xl font-semibold text-cyan-50">벽면 파츠 존</div>
            <p className="mt-2 text-sm text-cyan-100/80">작업 전 조합 확인</p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">부자재 월 선택</p>
          <div className="grid gap-2">
            {partWalls.map((wall) => {
              const active = wall.id === selectedWall?.id;

              return (
                <button
                  key={wall.id}
                  type="button"
                  onClick={() => {
                    setSelectedWallId(wall.id);
                    setSelectedPartId(wall.parts[0]?.id ?? "");
                  }}
                  className={
                    active
                      ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{wall.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{wall.subtitle}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {wall.parts.length}종
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
            Part Filters
          </p>
          <h2 className="text-2xl font-semibold text-white">{selectedWall?.title ?? "부자재 월"}</h2>
          <p className="text-sm leading-6 text-slate-300">
            카테고리와 검색어로 필요한 파츠를 빠르게 찾고 현재 작업 흐름에 맞는 조합을 선택합니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as PartCategory | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              {partCategoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">검색</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="파츠명, 보관코드, 용도"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="grid gap-3">
          {filteredParts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
              현재 조건에 맞는 파츠가 없습니다.
            </div>
          ) : (
            filteredParts.map((part) => {
              const active = selectedPart?.id === part.id;

              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setSelectedPartId(part.id)}
                  className={
                    active
                      ? "rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                          {part.binCode}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(part.status)}`}>
                          {part.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                          {part.category}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">{part.title}</div>
                      <div className="text-sm text-slate-300">
                        {part.finish} · 재고 {part.stockCount}개
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {part.compatibleProducts.map((product) => (
                          <span
                            key={product}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-cyan-100">
                      추천 흐름: {getRouteLabel(part.recommendedRoute)}
                    </div>
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
            Part Detail
          </p>
          <h2 className="text-2xl font-semibold text-white">선택 파츠 상세</h2>
          <p className="text-sm leading-6 text-slate-300">
            현재 파츠 재고와 연결 작업 공간을 읽고 작업대로 바로 이동합니다.
          </p>
        </div>

        {selectedPart ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {selectedPart.binCode}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedPart.status)}`}>
                  {selectedPart.status}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold text-white">{selectedPart.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedPart.note}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">카테고리</div>
                <div className="mt-1 text-slate-100">{selectedPart.category}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">마감</div>
                <div className="mt-1 text-slate-100">{selectedPart.finish}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">재고</div>
                <div className="mt-1 text-slate-100">{selectedPart.stockCount}개</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">추천 작업 공간</div>
                <div className="mt-1 text-cyan-100">{getRouteLabel(selectedPart.recommendedRoute)}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-semibold text-emerald-50">라우트 연동 요약</p>
              <div className="mt-3 grid gap-2">
                {Object.entries(routeCounts).map(([route, count]) => (
                  <div
                    key={route}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
                  >
                    {getRouteLabel(route)} · {count}종 파츠 연결
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedPart.recommendedRoute}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                추천 작업 공간으로 이동
              </Link>
              <Link
                href="/materials-room"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                원자재 룸 보기
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
            가운데 목록에서 파츠를 선택하면 상세가 표시됩니다.
          </div>
        )}
      </aside>
    </div>
  );
}