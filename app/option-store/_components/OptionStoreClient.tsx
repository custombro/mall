"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getRouteLabel,
  getStatusClass,
  optionCategoryOptions,
  optionGroups,
  type OptionCategory,
} from "./option-config";

export default function OptionStoreClient() {
  const [selectedGroupId, setSelectedGroupId] = useState(optionGroups[0]?.id ?? "");
  const [categoryFilter, setCategoryFilter] = useState<OptionCategory | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState(optionGroups[0]?.items[0]?.id ?? "");

  const selectedGroup = useMemo(
    () => optionGroups.find((group) => group.id === selectedGroupId) ?? optionGroups[0],
    [selectedGroupId],
  );

  const filteredOptions = useMemo(() => {
    if (!selectedGroup) return [];

    const normalizedKeyword = keyword.trim().toLowerCase();

    return selectedGroup.items.filter((item) => {
      const categoryMatch = categoryFilter === "전체" || item.category === categoryFilter;
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          item.title,
          item.code,
          item.summary,
          item.note,
          item.category,
          item.recommendedRoute,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return categoryMatch && keywordMatch;
    });
  }, [categoryFilter, keyword, selectedGroup]);

  const selectedOption = useMemo(
    () => filteredOptions.find((item) => item.id === selectedOptionId) ?? filteredOptions[0] ?? null,
    [filteredOptions, selectedOptionId],
  );

  const totalOptions = useMemo(
    () => optionGroups.reduce((sum, group) => sum + group.items.length, 0),
    [],
  );

  const warningCount = useMemo(
    () =>
      optionGroups
        .flatMap((group) => group.items)
        .filter((item) => item.status === "주의" || item.status === "부족").length,
    [],
  );

  const routeCounts = useMemo(() => {
    return optionGroups
      .flatMap((group) => group.items)
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
            Option Shelves
          </p>
          <h2 className="text-2xl font-semibold text-white">옵션 분리 허브</h2>
          <p className="text-sm leading-6 text-slate-300">
            옵션은 작업 본체와 섞지 않고 별도 선반에서 판단합니다. 후가공, 포장, 결합, 전시, 프리미엄 옵션을 분리해 다음 흐름으로 연결합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">옵션 수</p>
            <div className="mt-2 text-3xl font-semibold text-white">{totalOptions}</div>
            <p className="mt-2 text-sm text-slate-300">전체 옵션 기준</p>
          </div>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-100/80">주의/부족</p>
            <div className="mt-2 text-3xl font-semibold text-amber-50">{warningCount}</div>
            <p className="mt-2 text-sm text-amber-100/80">재고/판단 확인 필요</p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">핵심 개념</p>
            <div className="mt-2 text-xl font-semibold text-cyan-50">옵션 분리 구조</div>
            <p className="mt-2 text-sm text-cyan-100/80">본체와 분리 선택</p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">옵션 선반 선택</p>
          <div className="grid gap-2">
            {optionGroups.map((group) => {
              const active = group.id === selectedGroup?.id;

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setSelectedOptionId(group.items[0]?.id ?? "");
                  }}
                  className={
                    active
                      ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{group.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{group.subtitle}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {group.items.length}개
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
            Option Filters
          </p>
          <h2 className="text-2xl font-semibold text-white">{selectedGroup?.title ?? "옵션 선반"}</h2>
          <p className="text-sm leading-6 text-slate-300">
            옵션 종류와 검색어로 필요한 구성만 골라 현재 작업 흐름과 연결합니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as OptionCategory | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              {optionCategoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">검색</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="옵션명, 코드, 용도"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="grid gap-3">
          {filteredOptions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
              현재 조건에 맞는 옵션이 없습니다.
            </div>
          ) : (
            filteredOptions.map((item) => {
              const active = selectedOption?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedOptionId(item.id)}
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
                          {item.code}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">{item.title}</div>
                      <div className="text-sm text-slate-300">{item.summary}</div>
                      <div className="text-sm text-cyan-100">+{item.priceDelta.toLocaleString()}원</div>
                    </div>

                    <div className="text-sm text-cyan-100">
                      추천 흐름: {getRouteLabel(item.recommendedRoute)}
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
            Option Detail
          </p>
          <h2 className="text-2xl font-semibold text-white">선택 옵션 상세</h2>
          <p className="text-sm leading-6 text-slate-300">
            옵션 가격 변화와 연결 작업 공간을 읽고 바로 다음 판단으로 넘어갑니다.
          </p>
        </div>

        {selectedOption ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {selectedOption.code}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedOption.status)}`}>
                  {selectedOption.status}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold text-white">{selectedOption.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedOption.note}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">카테고리</div>
                <div className="mt-1 text-slate-100">{selectedOption.category}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">가격 변화</div>
                <div className="mt-1 text-slate-100">+{selectedOption.priceDelta.toLocaleString()}원</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">추천 작업 공간</div>
                <div className="mt-1 text-cyan-100">{getRouteLabel(selectedOption.recommendedRoute)}</div>
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
                    {getRouteLabel(route)} · {count}개 옵션 연결
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedOption.recommendedRoute}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                추천 작업 공간으로 이동
              </Link>
              <Link
                href="/parts-room"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                부자재 룸 보기
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
            가운데 목록에서 옵션을 선택하면 상세가 표시됩니다.
          </div>
        )}
      </aside>
    </div>
  );
}