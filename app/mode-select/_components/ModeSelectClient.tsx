"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getCategoryClass,
  modeCategoryOptions,
  modeRouteCards,
  type ModeCategory,
} from "./mode-select-config";

export default function ModeSelectClient() {
  const [categoryFilter, setCategoryFilter] = useState<ModeCategory | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(modeRouteCards[0]?.id ?? "");

  const filteredCards = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return modeRouteCards.filter((card) => {
      const categoryMatch = categoryFilter === "전체" || card.category === categoryFilter;
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          card.title,
          card.category,
          card.summary,
          card.whenToUse,
          card.statusLine,
          card.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return categoryMatch && keywordMatch;
    });
  }, [categoryFilter, keyword]);

  const selectedCard = useMemo(
    () => filteredCards.find((card) => card.id === selectedCardId) ?? filteredCards[0] ?? null,
    [filteredCards, selectedCardId],
  );

  const categoryCounts = useMemo(() => {
    return modeRouteCards.reduce<Record<string, number>>((acc, card) => {
      acc[card.category] = (acc[card.category] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const routeCount = modeRouteCards.length;
  const productionCount = categoryCounts["제작"] ?? 0;
  const operationsCount = (categoryCounts["판매운영"] ?? 0) + (categoryCounts["보관"] ?? 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_1.08fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Hub Overview
          </p>
          <h2 className="text-2xl font-semibold text-white">모드 선택 허브</h2>
          <p className="text-sm leading-6 text-slate-300">
            홈에서 바로 모든 기능을 펼치지 않고, 지금 필요한 공간으로 정확히 진입시키는 허브 역할만 담당합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">전체 공간</p>
            <div className="mt-2 text-3xl font-semibold text-white">{routeCount}</div>
            <p className="mt-2 text-sm text-slate-300">현재 분리된 라우트 수</p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">제작 공간</p>
            <div className="mt-2 text-3xl font-semibold text-cyan-50">{productionCount}</div>
            <p className="mt-2 text-sm text-cyan-100/80">실제 작업대/스튜디오</p>
          </div>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-100/80">운영 공간</p>
            <div className="mt-2 text-3xl font-semibold text-amber-50">{operationsCount}</div>
            <p className="mt-2 text-sm text-amber-100/80">보관/판매/대량 흐름</p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">카테고리 분포</p>
          <div className="grid gap-2">
            {modeCategoryOptions.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm"
              >
                <span className="text-slate-100">{category}</span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getCategoryClass(category)}`}>
                  {categoryCounts[category] ?? 0}개
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Route Selector
          </p>
          <h2 className="text-2xl font-semibold text-white">공간 선택</h2>
          <p className="text-sm leading-6 text-slate-300">
            지금 하려는 일이 제작인지, 보관인지, 자재 확인인지, 판매 운영인지 먼저 좁힌 다음 공간으로 들어갑니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ModeCategory | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              {modeCategoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">검색</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="공간명, 용도, 태그"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="grid gap-3">
          {filteredCards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
              현재 조건에 맞는 공간이 없습니다.
            </div>
          ) : (
            filteredCards.map((card) => {
              const active = selectedCard?.id === card.id;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCardId(card.id)}
                  className={
                    active
                      ? "rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs ${getCategoryClass(card.category)}`}>
                          {card.category}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                          {card.eyebrow}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">{card.title}</div>
                      <div className="text-sm text-slate-300">{card.summary}</div>
                    </div>

                    <div className="text-sm text-cyan-100">{card.statusLine}</div>
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
            Selected Route
          </p>
          <h2 className="text-2xl font-semibold text-white">현재 진입 판단</h2>
          <p className="text-sm leading-6 text-slate-300">
            선택한 공간이 무엇을 해결하는지, 언제 들어가야 하는지, 다음 동선이 무엇인지 명확히 보여준다.
          </p>
        </div>

        {selectedCard ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${getCategoryClass(selectedCard.category)}`}>
                  {selectedCard.category}
                </span>
                <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {selectedCard.eyebrow}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold text-white">{selectedCard.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedCard.whenToUse}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 역할</div>
                <div className="mt-1 text-slate-100">{selectedCard.summary}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">상태 라인</div>
                <div className="mt-1 text-slate-100">{selectedCard.statusLine}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">태그</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedCard.href}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                선택한 공간으로 이동
              </Link>
              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                홈 허브로 돌아가기
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
            가운데에서 공간을 선택하면 상세가 표시됩니다.
          </div>
        )}
      </aside>
    </div>
  );
}