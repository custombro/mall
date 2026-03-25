"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCategoryClass,
  modeCategoryOptions,
  modeRouteCards,
  type ModeCategory,
} from "./mode-select-config";

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function ModeSelectClient() {
  const [categoryFilter, setCategoryFilter] = useState<ModeCategory | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(modeRouteCards[0]?.id ?? "");

  const filteredCards = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return modeRouteCards.filter((card) => {
      const categoryMatch =
        categoryFilter === "전체" || card.category === categoryFilter;

      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          card.title,
          card.category,
          card.summary,
          card.whenToUse,
          card.statusLine,
          card.tags.join(" "),
          card.href,
          card.eyebrow,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return categoryMatch && keywordMatch;
    });
  }, [categoryFilter, keyword]);

  useEffect(() => {
    if (!filteredCards.length) {
      setSelectedCardId("");
      return;
    }

    if (!filteredCards.find((card) => card.id === selectedCardId)) {
      setSelectedCardId(filteredCards[0].id);
    }
  }, [filteredCards, selectedCardId]);

  const selectedCard = useMemo(() => {
    return filteredCards.find((card) => card.id === selectedCardId) ?? filteredCards[0] ?? null;
  }, [filteredCards, selectedCardId]);

  const categoryCounts = useMemo(() => {
    return modeRouteCards.reduce<Record<ModeCategory, number>>(
      (acc, card) => {
        acc[card.category] = (acc[card.category] ?? 0) + 1;
        return acc;
      },
      {
        제작: 0,
        보관: 0,
        자재: 0,
        판매운영: 0,
      },
    );
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">공간 좁히기</p>

          <div className="grid gap-2">
            <label className="space-y-2">
              <span className="text-xs text-slate-400">카테고리</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ModeCategory | "전체")}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                {modeCategoryOptions.map((category) => (
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
                placeholder="공간명, 용도, 태그"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">공간 목록</p>

          {filteredCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              현재 조건에 맞는 공간이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCards.map((card) => {
                const active = selectedCard?.id === card.id;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(card.id)}
                    className={
                      active
                        ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                        : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${getCategoryClass(card.category)}`}
                      >
                        {card.category}
                      </span>
                      <span className="text-[11px] text-slate-400">{card.eyebrow}</span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white">{card.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{card.summary}</p>
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
                CENTER / 진입 판단
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedCard?.title ?? "선택된 공간 없음"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedCard?.whenToUse ?? "좌측에서 공간을 선택하면 여기서 바로 판단할 수 있습니다."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 분류</p>
              <p className="mt-1 font-semibold text-white">{selectedCard?.category ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryChip label="공간명" value={selectedCard?.title ?? "-"} />
            <SummaryChip label="분류" value={selectedCard?.category ?? "-"} />
            <SummaryChip label="경로" value={selectedCard?.href ?? "-"} />
            <SummaryChip label="표시명" value={selectedCard?.eyebrow ?? "-"} />
            <SummaryChip label="현재 역할" value={selectedCard?.summary ?? "-"} />
            <SummaryChip label="상태 라인" value={selectedCard?.statusLine ?? "-"} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">태그</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedCard?.tags?.length ? (
              selectedCard.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">태그 없음</span>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">이동 흐름</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {selectedCard ? (
              <Link
                href={selectedCard.href}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                선택한 공간으로 이동
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 px-4 py-3 text-center text-sm text-slate-500">
                선택된 공간 없음
              </div>
            )}

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              홈 허브로
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
            <h2 className="mt-2 text-xl font-semibold text-white">빠른 이동</h2>

            <div className="mt-4 grid gap-3">
              <Link
                href="/workbench/keyring"
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                키링 작업대
              </Link>
              <Link
                href="/storage"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                서랍
              </Link>
              <Link
                href="/orders"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                주문 허브
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-emerald-50">분류 현황</p>
          <div className="mt-3 grid gap-2">
            {modeCategoryOptions.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-emerald-100/90">{category}</span>
                <span className="font-semibold text-white">{categoryCounts[category]}개</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-emerald-100/80">
            설명보다 진입 판단이 먼저 보이도록 압축한 상태입니다.
          </p>
        </section>
      </aside>
    </div>
  );
}