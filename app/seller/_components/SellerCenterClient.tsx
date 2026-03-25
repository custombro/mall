"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getRouteLabel,
  getStatusClass,
  getTierClass,
  sellerProducts,
  sellerPrograms,
  sellerStatusOptions,
  sellerTierOptions,
  settlementCards,
  type SellerStatus,
  type SellerTier,
} from "./seller-config";

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function SellerCenterClient() {
  const [selectedProgramId, setSelectedProgramId] = useState(sellerPrograms[0]?.id ?? "");
  const [tierFilter, setTierFilter] = useState<SellerTier | "전체">("전체");
  const [statusFilter, setStatusFilter] = useState<SellerStatus | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(sellerProducts[0]?.id ?? "");

  const selectedProgram = useMemo(
    () => sellerPrograms.find((program) => program.id === selectedProgramId) ?? sellerPrograms[0],
    [selectedProgramId],
  );

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return sellerProducts.filter((product) => {
      const tierMatch = tierFilter === "전체" || product.sellerTier === tierFilter;
      const statusMatch = statusFilter === "전체" || product.status === statusFilter;
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          product.title,
          product.category,
          product.sku,
          product.summary,
          product.stockNote,
          product.marginHint,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return tierMatch && statusMatch && keywordMatch;
    });
  }, [keyword, statusFilter, tierFilter]);

  useEffect(() => {
    if (!filteredProducts.length) {
      setSelectedProductId("");
      return;
    }

    if (!filteredProducts.find((product) => product.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0].id);
    }
  }, [filteredProducts, selectedProductId]);

  const selectedProduct = useMemo(
    () => filteredProducts.find((product) => product.id === selectedProductId) ?? filteredProducts[0] ?? null,
    [filteredProducts, selectedProductId],
  );

  const routeCounts = useMemo(() => {
    return sellerProducts.reduce<Record<string, number>>((acc, product) => {
      acc[product.recommendedRoute] = (acc[product.recommendedRoute] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const sellingCount = useMemo(
    () => sellerProducts.filter((product) => product.status === "판매중").length,
    [],
  );

  const scaleCount = useMemo(
    () => sellerProducts.filter((product) => product.sellerTier === "확장").length,
    [],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">판매 프로그램</p>
            <span className="text-xs text-slate-400">{selectedProgram?.monthlyTarget ?? "-"}</span>
          </div>

          <div className="space-y-2">
            {sellerPrograms.map((program) => {
              const active = program.id === selectedProgram?.id;

              return (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => setSelectedProgramId(program.id)}
                  className={
                    active
                      ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getTierClass(program.tier)}`}>
                      {program.tier}
                    </span>
                    <span className="text-[11px] text-slate-300">{program.monthlyTarget}</span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-white">{program.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{program.summary}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">필터</p>

          <div className="grid gap-3">
            <label className="space-y-2">
              <span className="text-xs text-slate-400">등급</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as SellerTier | "전체")}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                {sellerTierOptions.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs text-slate-400">상태</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SellerStatus | "전체")}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                {sellerStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs text-slate-400">검색</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="상품명, SKU, 판매 메모"
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
                CENTER / 판매 상품
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedProgram?.title ?? "판매 상품"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                판매 상태와 셀러 단계 기준으로 현재 어떤 상품을 밀고, 어떤 상품을 정리할지 바로 판단합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 프로그램</p>
              <p className="mt-1 font-semibold text-white">{selectedProgram?.headline ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryChip label="전체 상품" value={`${sellerProducts.length}개`} />
            <SummaryChip label="판매중" value={`${sellingCount}개`} />
            <SummaryChip label="확장 단계" value={`${scaleCount}개`} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">상품 목록</p>

          {filteredProducts.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              현재 조건에 맞는 판매 상품이 없습니다.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {filteredProducts.map((product) => {
                const active = selectedProduct?.id === product.id;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProductId(product.id)}
                    className={
                      active
                        ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                        : "rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getTierClass(product.sellerTier)}`}>
                        {product.sellerTier}
                      </span>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(product.status)}`}>
                        {product.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white">{product.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{product.sku} · {product.category}</p>
                    <p className="mt-3 text-xs leading-5 text-slate-300">{product.summary}</p>
                    <p className="mt-3 text-xs text-slate-300">{product.marginHint}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">선택 판매 상세</p>

          {selectedProduct ? (
            <div className="mt-3 grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${getTierClass(selectedProduct.sellerTier)}`}>
                  {selectedProduct.sellerTier}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedProduct.status)}`}>
                  {selectedProduct.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedProduct.sku}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white">{selectedProduct.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedProduct.stockNote}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryChip label="카테고리" value={selectedProduct.category} />
                <SummaryChip label="마진 힌트" value={selectedProduct.marginHint} />
                <SummaryChip label="추천 작업 공간" value={getRouteLabel(selectedProduct.recommendedRoute)} />
                <SummaryChip label="프로그램" value={selectedProgram?.title ?? "-"} />
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              가운데 목록에서 판매 상품을 선택하면 상세가 표시됩니다.
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
            RIGHT / 정산 · 이동
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">실행 카드</h2>
        </div>

        <section className="grid gap-3">
          {settlementCards.map((card) => (
            <div key={card.id} className={card.toneClass}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200/80">{card.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-xs text-slate-200/80">{card.note}</p>
            </div>
          ))}
        </section>

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
          {selectedProduct ? (
            <Link
              href={selectedProduct.recommendedRoute}
              className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              추천 작업 공간으로 이동
            </Link>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 px-4 py-3 text-center text-sm text-slate-500">
              선택된 상품 없음
            </div>
          )}

          <Link
            href="/storage"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            보관함 보기
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
            <li>• 셀러 화면은 상품 소개가 아니라 운영 판단이 먼저 보여야 합니다.</li>
            <li>• 등급, 판매상태, 정산감이 선택 직후 바로 읽혀야 합니다.</li>
            <li>• 추천 작업 공간 CTA는 우측에만 모아 중복을 줄였습니다.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}