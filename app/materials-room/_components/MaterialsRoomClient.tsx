"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getRouteLabel,
  getStatusClass,
  materialCategoryOptions,
  materialRacks,
  type AcrylicSheet,
  type MaterialCategory,
} from "./materials-config";

export default function MaterialsRoomClient() {
  const [selectedRackId, setSelectedRackId] = useState(materialRacks[0]?.id ?? "");
  const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | "전체">("전체");
  const [thicknessFilter, setThicknessFilter] = useState<"전체" | "2.7T" | "3T" | "5T">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedSheetId, setSelectedSheetId] = useState(materialRacks[0]?.sheets[0]?.id ?? "");

  const selectedRack = useMemo(
    () => materialRacks.find((rack) => rack.id === selectedRackId) ?? materialRacks[0],
    [selectedRackId],
  );

  const filteredSheets = useMemo(() => {
    if (!selectedRack) {
      return [];
    }

    const normalizedKeyword = keyword.trim().toLowerCase();

    return selectedRack.sheets.filter((sheet) => {
      const categoryMatch = categoryFilter === "전체" || sheet.category === categoryFilter;
      const thicknessMatch = thicknessFilter === "전체" || sheet.thickness === thicknessFilter;
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          sheet.title,
          sheet.rackCode,
          sheet.size,
          sheet.note,
          sheet.useCases.join(" "),
          sheet.category,
          sheet.thickness,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return categoryMatch && thicknessMatch && keywordMatch;
    });
  }, [categoryFilter, keyword, selectedRack, thicknessFilter]);

  const selectedSheet = useMemo(() => {
    return filteredSheets.find((sheet) => sheet.id === selectedSheetId) ?? filteredSheets[0] ?? null;
  }, [filteredSheets, selectedSheetId]);

  const totalSheets = useMemo(
    () => materialRacks.reduce((sum, rack) => sum + rack.sheets.length, 0),
    [],
  );

  const lowStockCount = useMemo(
    () =>
      materialRacks
        .flatMap((rack) => rack.sheets)
        .filter((sheet) => sheet.status === "부족" || sheet.status === "주의").length,
    [],
  );

  const keyringLinkedCount = useMemo(
    () =>
      materialRacks
        .flatMap((rack) => rack.sheets)
        .filter((sheet) => sheet.recommendedRoute === "/workbench/keyring").length,
    [],
  );

  const routeCounts = useMemo(() => {
    return materialRacks
      .flatMap((rack) => rack.sheets)
      .reduce<Record<string, number>>((acc, sheet) => {
        acc[sheet.recommendedRoute] = (acc[sheet.recommendedRoute] ?? 0) + 1;
        return acc;
      }, {});
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_1.1fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Rack Overview
          </p>
          <h2 className="text-2xl font-semibold text-white">금속 랙 기반 원자재 존</h2>
          <p className="text-sm leading-6 text-slate-300">
            원자재는 소품 서랍이 아니라 금속 랙에 쌓인 원장 구역으로 이해시킵니다. 두께, 재질, 재고 상태를 보고 다음 작업 공간으로 연결합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">등록 원장</p>
            <div className="mt-2 text-3xl font-semibold text-white">{totalSheets}</div>
            <p className="mt-2 text-sm text-slate-300">전체 원장 기준</p>
          </div>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-100/80">주의/부족</p>
            <div className="mt-2 text-3xl font-semibold text-amber-50">{lowStockCount}</div>
            <p className="mt-2 text-sm text-amber-100/80">재고 경계 구간</p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">키링 연동</p>
            <div className="mt-2 text-3xl font-semibold text-cyan-50">{keyringLinkedCount}</div>
            <p className="mt-2 text-sm text-cyan-100/80">작업대 바로 연결 가능</p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">랙 선택</p>
          <div className="grid gap-2">
            {materialRacks.map((rack) => {
              const active = rack.id === selectedRack?.id;

              return (
                <button
                  key={rack.id}
                  type="button"
                  onClick={() => {
                    setSelectedRackId(rack.id);
                    setSelectedSheetId(rack.sheets[0]?.id ?? "");
                  }}
                  className={
                    active
                      ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{rack.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{rack.subtitle}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {rack.sheets.length}장
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
            Material Filters
          </p>
          <h2 className="text-2xl font-semibold text-white">{selectedRack?.title ?? "원자재 랙"}</h2>
          <p className="text-sm leading-6 text-slate-300">
            재질, 두께, 검색어로 필요한 원장을 빠르게 찾고 실제 다음 작업 흐름을 결정합니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as MaterialCategory | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              {materialCategoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">두께</span>
            <select
              value={thicknessFilter}
              onChange={(e) => setThicknessFilter(e.target.value as "전체" | "2.7T" | "3T" | "5T")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              <option value="2.7T">2.7T</option>
              <option value="3T">3T</option>
              <option value="5T">5T</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">검색</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="원장명, 랙코드, 용도"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="grid gap-3">
          {filteredSheets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
              현재 조건에 맞는 원장이 없습니다.
            </div>
          ) : (
            filteredSheets.map((sheet) => {
              const active = selectedSheet?.id === sheet.id;

              return (
                <button
                  key={sheet.id}
                  type="button"
                  onClick={() => setSelectedSheetId(sheet.id)}
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
                          {sheet.rackCode}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(sheet.status)}`}>
                          {sheet.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                          {sheet.thickness}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">{sheet.title}</div>
                      <div className="text-sm text-slate-300">
                        {sheet.category} · {sheet.size} · 재고 {sheet.stockSheets}장
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sheet.useCases.map((useCase) => (
                          <span
                            key={useCase}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                          >
                            {useCase}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-cyan-100">
                      추천 흐름: {getRouteLabel(sheet.recommendedRoute)}
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
            Material Detail
          </p>
          <h2 className="text-2xl font-semibold text-white">선택 원장 상세</h2>
          <p className="text-sm leading-6 text-slate-300">
            현재 원장의 재고와 추천 작업 흐름을 확인하고 바로 다음 공간으로 이동합니다.
          </p>
        </div>

        {selectedSheet ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {selectedSheet.rackCode}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedSheet.status)}`}>
                  {selectedSheet.status}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold text-white">{selectedSheet.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedSheet.note}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">카테고리</div>
                <div className="mt-1 text-slate-100">{selectedSheet.category}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">두께</div>
                <div className="mt-1 text-slate-100">{selectedSheet.thickness}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">규격</div>
                <div className="mt-1 text-slate-100">{selectedSheet.size}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">재고</div>
                <div className="mt-1 text-slate-100">{selectedSheet.stockSheets}장</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">추천 작업 공간</div>
                <div className="mt-1 text-cyan-100">{getRouteLabel(selectedSheet.recommendedRoute)}</div>
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
                    {getRouteLabel(route)} · {count}개 원장 연결
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedSheet.recommendedRoute}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                추천 작업 공간으로 이동
              </Link>
              <Link
                href="/storage"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                보관함 연결 보기
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
            가운데 목록에서 원장을 선택하면 상세가 표시됩니다.
          </div>
        )}
      </aside>
    </div>
  );
}