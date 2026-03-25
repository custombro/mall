"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getRouteLabel,
  getStatusClass,
  optionCategoryOptions,
  optionGroups,
  type OptionCategory,
} from "./option-config";

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

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

  useEffect(() => {
    if (!filteredOptions.length) {
      setSelectedOptionId("");
      return;
    }

    if (!filteredOptions.find((item) => item.id === selectedOptionId)) {
      setSelectedOptionId(filteredOptions[0].id);
    }
  }, [filteredOptions, selectedOptionId]);

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

  const premiumCount = useMemo(
    () =>
      optionGroups
        .flatMap((group) => group.items)
        .filter((item) => item.category === "프리미엄").length,
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
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">옵션 선반</p>
          <div className="space-y-2">
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
                      ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <p className="text-sm font-semibold text-white">{group.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{group.subtitle}</p>
                  <p className="mt-3 text-xs text-slate-300">{group.items.length}개</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">필터</p>

          <div className="grid gap-3">
            <label className="space-y-2">
              <span className="text-xs text-slate-400">카테고리</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as OptionCategory | "전체")}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                {optionCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs text-slate-400">검색</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="옵션명, 코드, 용도"
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
                CENTER / 옵션 선택
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedGroup?.title ?? "옵션 선반"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                본체와 섞지 않고, 후가공 · 포장 · 결합 · 전시 · 프리미엄 옵션만 따로 판단합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 선반</p>
              <p className="mt-1 font-semibold text-white">{selectedGroup?.subtitle ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryChip label="전체 옵션" value={`${totalOptions}개`} />
            <SummaryChip label="주의/부족" value={`${warningCount}개`} />
            <SummaryChip label="프리미엄" value={`${premiumCount}개`} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">옵션 목록</p>

          {filteredOptions.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              현재 조건에 맞는 옵션이 없습니다.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {filteredOptions.map((item) => {
                const active = selectedOption?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedOptionId(item.id)}
                    className={
                      active
                        ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                        : "rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">{item.code}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.category}</p>
                    <p className="mt-3 text-xs leading-5 text-slate-300">{item.summary}</p>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-300">
                      <span>+{item.priceDelta.toLocaleString()}원</span>
                      <span>{getRouteLabel(item.recommendedRoute)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">선택 옵션 상세</p>

          {selectedOption ? (
            <div className="mt-3 grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedOption.code}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedOption.status)}`}>
                  {selectedOption.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedOption.category}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white">{selectedOption.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedOption.note}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryChip label="카테고리" value={selectedOption.category} />
                <SummaryChip label="가격 변화" value={`+${selectedOption.priceDelta.toLocaleString()}원`} />
                <SummaryChip label="추천 작업 공간" value={getRouteLabel(selectedOption.recommendedRoute)} />
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              가운데 목록에서 옵션을 선택하면 상세가 표시됩니다.
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
          {selectedOption ? (
            <Link
              href={selectedOption.recommendedRoute}
              className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              추천 작업 공간으로 이동
            </Link>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 px-4 py-3 text-center text-sm text-slate-500">
              선택된 옵션 없음
            </div>
          )}

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

        <section className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-emerald-50">현재 기준</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-100/90">
            <li>• 옵션은 본체 화면에서 설명으로 늘어놓지 않고 별도 허브에서 판단합니다.</li>
            <li>• 추가금과 제작 영향은 선택 직후 바로 읽혀야 합니다.</li>
            <li>• 다음 작업 공간 CTA는 우측에만 모아 중복을 줄였습니다.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}