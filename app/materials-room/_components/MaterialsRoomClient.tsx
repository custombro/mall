"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getRouteLabel,
  getStatusClass,
  materialCategoryOptions,
  materialRacks,
  type MaterialCategory,
} from "./materials-config";

type ThicknessFilter = "전체" | "2.7T" | "3T" | "5T";

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function MaterialsRoomClient() {
  const [selectedRackId, setSelectedRackId] = useState(materialRacks[0]?.id ?? "");
  const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | "전체">("전체");
  const [thicknessFilter, setThicknessFilter] = useState<ThicknessFilter>("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedSheetId, setSelectedSheetId] = useState(materialRacks[0]?.sheets[0]?.id ?? "");

  const selectedRack = useMemo(
    () => materialRacks.find((rack) => rack.id === selectedRackId) ?? materialRacks[0],
    [selectedRackId],
  );

  const filteredSheets = useMemo(() => {
    if (!selectedRack) return [];

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

  useEffect(() => {
    if (!filteredSheets.length) {
      setSelectedSheetId("");
      return;
    }

    if (!filteredSheets.find((sheet) => sheet.id === selectedSheetId)) {
      setSelectedSheetId(filteredSheets[0].id);
    }
  }, [filteredSheets, selectedSheetId]);

  const selectedSheet = useMemo(
    () => filteredSheets.find((sheet) => sheet.id === selectedSheetId) ?? filteredSheets[0] ?? null,
    [filteredSheets, selectedSheetId],
  );

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
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">랙 선택</p>
          <div className="space-y-2">
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
                      ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <p className="text-sm font-semibold text-white">{rack.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{rack.subtitle}</p>
                  <p className="mt-3 text-xs text-slate-300">{rack.sheets.length}장</p>
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
                onChange={(e) => setCategoryFilter(e.target.value as MaterialCategory | "전체")}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                {materialCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs text-slate-400">두께</span>
              <select
                value={thicknessFilter}
                onChange={(e) => setThicknessFilter(e.target.value as ThicknessFilter)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                <option value="2.7T">2.7T</option>
                <option value="3T">3T</option>
                <option value="5T">5T</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs text-slate-400">검색</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="원장명, 랙코드, 용도"
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
                CENTER / 원장 선택
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedRack?.title ?? "원자재 랙"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                재질, 두께, 재고 상태를 보고 지금 필요한 원장을 바로 선택합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 랙</p>
              <p className="mt-1 font-semibold text-white">{selectedRack?.subtitle ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryChip label="등록 원장" value={`${totalSheets}장`} />
            <SummaryChip label="주의/부족" value={`${lowStockCount}장`} />
            <SummaryChip label="키링 연동" value={`${keyringLinkedCount}장`} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">원장 목록</p>

          {filteredSheets.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              현재 조건에 맞는 원장이 없습니다.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {filteredSheets.map((sheet) => {
                const active = selectedSheet?.id === sheet.id;

                return (
                  <button
                    key={sheet.id}
                    type="button"
                    onClick={() => setSelectedSheetId(sheet.id)}
                    className={
                      active
                        ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                        : "rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">{sheet.rackCode}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                          {sheet.thickness}
                        </span>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(sheet.status)}`}>
                          {sheet.status}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white">{sheet.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {sheet.category} · {sheet.size} · 재고 {sheet.stockSheets}장
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {sheet.useCases.map((useCase) => (
                        <span
                          key={useCase}
                          className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-300"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-slate-300">
                      추천 흐름: {getRouteLabel(sheet.recommendedRoute)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">선택 원장 상세</p>

          {selectedSheet ? (
            <div className="mt-3 grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedSheet.rackCode}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedSheet.status)}`}>
                  {selectedSheet.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedSheet.category}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white">{selectedSheet.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedSheet.note}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryChip label="두께" value={selectedSheet.thickness} />
                <SummaryChip label="규격" value={selectedSheet.size} />
                <SummaryChip label="재고" value={`${selectedSheet.stockSheets}장`} />
                <SummaryChip label="추천 작업 공간" value={getRouteLabel(selectedSheet.recommendedRoute)} />
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              가운데 목록에서 원장을 선택하면 상세가 표시됩니다.
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
              RIGHT / 상태 · 이동
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">실행 카드</h2>

            <div className="mt-4 grid gap-3">
              {Object.entries(routeCounts).map(([route, count]) => (
                <div
                  key={route}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-300">{getRouteLabel(route)}</span>
                    <span className="font-semibold text-white">{count}장</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              {selectedSheet ? (
                <Link
                  href={selectedSheet.recommendedRoute}
                  className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  추천 작업 공간으로 이동
                </Link>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 px-4 py-3 text-center text-sm text-slate-500">
                  선택된 원장 없음
                </div>
              )}

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
        </section>

        <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-emerald-50">현재 기준</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-100/90">
            <li>• 원자재는 장식보다 재질·두께·재고 판단이 먼저 보여야 합니다.</li>
            <li>• 부족/주의 원장은 선택 직후 바로 읽혀야 합니다.</li>
            <li>• 추천 작업 공간 CTA는 우측에만 모아 중복을 줄였습니다.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}