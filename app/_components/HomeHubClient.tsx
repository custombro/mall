"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getHomeRouteKindClass,
  homeQuickRoutes,
  type HomeRouteKind,
} from "./home-hub-config";

export default function HomeHubClient() {
  const [kindFilter, setKindFilter] = useState<HomeRouteKind | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState(homeQuickRoutes[0]?.id ?? "");

  const filteredRoutes = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return homeQuickRoutes.filter((route) => {
      const kindMatch = kindFilter === "전체" || route.kind === kindFilter;
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          route.title,
          route.eyebrow,
          route.summary,
          route.note,
          route.kind,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return kindMatch && keywordMatch;
    });
  }, [kindFilter, keyword]);

  const selectedRoute = useMemo(
    () => filteredRoutes.find((route) => route.id === selectedRouteId) ?? filteredRoutes[0] ?? null,
    [filteredRoutes, selectedRouteId],
  );

  const kindCounts = useMemo(() => {
    return homeQuickRoutes.reduce<Record<string, number>>((acc, route) => {
      acc[route.kind] = (acc[route.kind] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_1.08fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Home Gateway
          </p>
          <h2 className="text-2xl font-semibold text-white">홈은 진입 허브만 담당</h2>
          <p className="text-sm leading-6 text-slate-300">
            홈에서 모든 기능을 다 보여주지 않고, 지금 필요한 공간으로 보내는 역할만 하도록 정리했습니다.
          </p>
        </div>

        <div className="rounded-[2rem] border border-cyan-300/25 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.92),rgba(99,102,241,0.12))] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            추천 Start
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">먼저 모드 선택으로 들어가세요</h3>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            제작·보관·자재·판매운영을 먼저 분기한 뒤 들어가야 홈이 길게 늘어지지 않고 구조가 유지됩니다.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/mode-select"
              className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              모드 선택으로 시작
            </Link>
            <Link
              href="/storage"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              최근 작업 재호출 보기
            </Link>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">카테고리 분포</p>
          <div className="grid gap-2">
            {(["제작", "보관", "자재", "판매운영"] as Array<HomeRouteKind>).map((kind) => (
              <div
                key={kind}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm"
              >
                <span className="text-slate-100">{kind}</span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getHomeRouteKindClass(kind)}`}>
                  {kindCounts[kind] ?? 0}개
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Quick Route Selector
          </p>
          <h2 className="text-2xl font-semibold text-white">바로 갈 공간 선택</h2>
          <p className="text-sm leading-6 text-slate-300">
            홈에서 바로 점프가 필요한 경우만 빠르게 고르고, 나머지는 모드 선택 허브로 넘깁니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">카테고리</span>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as HomeRouteKind | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              <option value="제작">제작</option>
              <option value="보관">보관</option>
              <option value="자재">자재</option>
              <option value="판매운영">판매운영</option>
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
          {filteredRoutes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
              현재 조건에 맞는 공간이 없습니다.
            </div>
          ) : (
            filteredRoutes.map((route) => {
              const active = selectedRoute?.id === route.id;

              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                  className={
                    active
                      ? "rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs ${getHomeRouteKindClass(route.kind)}`}>
                          {route.kind}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                          {route.eyebrow}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">{route.title}</div>
                      <div className="text-sm text-slate-300">{route.summary}</div>
                    </div>

                    <div className="text-sm text-cyan-100">{route.note}</div>
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
            선택한 공간이 무엇을 해결하는지, 언제 써야 하는지, 바로 어디로 들어가야 하는지 보여줍니다.
          </p>
        </div>

        {selectedRoute ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${getHomeRouteKindClass(selectedRoute.kind)}`}>
                  {selectedRoute.kind}
                </span>
                <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {selectedRoute.eyebrow}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold text-white">{selectedRoute.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedRoute.summary}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">언제 사용</div>
                <div className="mt-1 text-slate-100">{selectedRoute.note}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">권장 진입</div>
                <div className="mt-1 text-cyan-100">{selectedRoute.href}</div>
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedRoute.href}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                선택한 공간으로 이동
              </Link>
              <Link
                href="/mode-select"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                모드 선택 허브로 이동
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