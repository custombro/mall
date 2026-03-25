"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getHomeRouteKindClass,
  homeQuickRoutes,
  type HomeRouteKind,
} from "./home-hub-config";

const kindOptions: Array<HomeRouteKind | "전체"> = [
  "전체",
  "제작",
  "보관",
  "자재",
  "판매운영",
];

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

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
        [route.title, route.eyebrow, route.summary, route.note, route.kind, route.href]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return kindMatch && keywordMatch;
    });
  }, [kindFilter, keyword]);

  useEffect(() => {
    if (!filteredRoutes.length) {
      setSelectedRouteId("");
      return;
    }

    if (!filteredRoutes.find((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(filteredRoutes[0].id);
    }
  }, [filteredRoutes, selectedRouteId]);

  const selectedRoute = useMemo(() => {
    return filteredRoutes.find((route) => route.id === selectedRouteId) ?? filteredRoutes[0] ?? null;
  }, [filteredRoutes, selectedRouteId]);

  const kindCounts = useMemo(() => {
    return homeQuickRoutes.reduce<Record<HomeRouteKind, number>>(
      (acc, route) => {
        acc[route.kind] = (acc[route.kind] ?? 0) + 1;
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
          <p className="text-sm font-semibold text-white">빠른 선택</p>

          <div className="grid gap-2">
            <label className="space-y-2">
              <span className="text-xs text-slate-400">카테고리</span>
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as HomeRouteKind | "전체")}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              >
                {kindOptions.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs text-slate-400">검색</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="공간명, 용도, 경로"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">공간 목록</p>

          {filteredRoutes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              현재 조건에 맞는 공간이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoutes.map((route) => {
                const active = selectedRoute?.id === route.id;

                return (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => setSelectedRouteId(route.id)}
                    className={
                      active
                        ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                        : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${getHomeRouteKindClass(route.kind)}`}
                      >
                        {route.kind}
                      </span>
                      <span className="text-[11px] text-slate-400">{route.eyebrow}</span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white">{route.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{route.summary}</p>
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
                {selectedRoute?.title ?? "선택된 공간 없음"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedRoute?.summary ?? "좌측에서 공간을 선택하면 여기서 바로 판단할 수 있습니다."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">선택 분류</p>
              <p className="mt-1 font-semibold text-white">{selectedRoute?.kind ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryChip label="분류" value={selectedRoute?.kind ?? "-"} />
            <SummaryChip label="표시명" value={selectedRoute?.eyebrow ?? "-"} />
            <SummaryChip label="경로" value={selectedRoute?.href ?? "-"} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">언제 들어가나</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {selectedRoute?.note ?? "선택된 공간이 없습니다."}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">바로 이동</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {selectedRoute ? (
              <Link
                href={selectedRoute.href}
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
              href="/mode-select"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              모드 선택 허브
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
            <h2 className="mt-2 text-xl font-semibold text-white">빠른 진입</h2>

            <div className="mt-4 grid gap-3">
              <Link
                href="/mode-select"
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                제작 시작
              </Link>
              <Link
                href="/storage"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                서랍 열기
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
            {(["제작", "보관", "자재", "판매운영"] as HomeRouteKind[]).map((kind) => (
              <div
                key={kind}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-emerald-100/90">{kind}</span>
                <span className="font-semibold text-white">{kindCounts[kind]}개</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-emerald-100/80">
            홈은 설명보다 진입 분기가 먼저 보여야 한다는 원칙으로 압축한 상태입니다.
          </p>
        </section>
      </aside>
    </div>
  );
}