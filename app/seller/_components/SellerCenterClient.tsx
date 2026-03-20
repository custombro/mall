"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_1.1fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Seller Tracks
          </p>
          <h2 className="text-2xl font-semibold text-white">크루 판매 단계</h2>
          <p className="text-sm leading-6 text-slate-300">
            판매자 센터는 셀러 등급과 판매 흐름을 분리해 보는 운영 허브입니다. 입문, 운영, 확장 단계로 나눠 구조를 읽습니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {settlementCards.map((card) => (
            <div key={card.id} className={card.toneClass}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200/80">{card.label}</p>
              <div className="mt-2 text-3xl font-semibold text-white">{card.value}</div>
              <p className="mt-2 text-sm text-slate-200/80">{card.note}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">판매 프로그램 선택</p>
          <div className="grid gap-2">
            {sellerPrograms.map((program) => {
              const active = program.id === selectedProgram?.id;

              return (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => setSelectedProgramId(program.id)}
                  className={
                    active
                      ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs ${getTierClass(program.tier)}`}>
                          {program.tier}
                        </span>
                      </div>
                      <div className="mt-3 text-sm font-semibold text-white">{program.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{program.summary}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {program.monthlyTarget}
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
            Seller Products
          </p>
          <h2 className="text-2xl font-semibold text-white">{selectedProgram?.title ?? "판매 상품"}</h2>
          <p className="text-sm leading-6 text-slate-300">
            판매 상태와 셀러 단계 기준으로 현재 어떤 상품을 밀어야 하는지 판단합니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">등급</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as SellerTier | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              {sellerTierOptions.map((tier) => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">상태</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SellerStatus | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              {sellerStatusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">검색</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="상품명, SKU, 판매 메모"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="grid gap-3">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
              현재 조건에 맞는 판매 상품이 없습니다.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const active = selectedProduct?.id === product.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                  className={
                    active
                      ? "rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                      : "rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs ${getTierClass(product.sellerTier)}`}>
                          {product.sellerTier}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(product.status)}`}>
                          {product.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                          {product.sku}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">{product.title}</div>
                      <div className="text-sm text-slate-300">{product.summary}</div>
                      <div className="text-sm text-cyan-100">{product.marginHint}</div>
                    </div>

                    <div className="text-sm text-cyan-100">
                      추천 흐름: {getRouteLabel(product.recommendedRoute)}
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
            Seller Detail
          </p>
          <h2 className="text-2xl font-semibold text-white">선택 판매 상세</h2>
          <p className="text-sm leading-6 text-slate-300">
            현재 판매 단계, 운영 메모, 추천 작업 공간을 보고 바로 다음 조치를 결정합니다.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">{selectedProgram?.title}</div>
          <div className="mt-1 text-sm text-slate-300">{selectedProgram?.headline}</div>
          <div className="mt-3 text-xs text-cyan-100">판매중 상품 {sellingCount}건</div>
        </div>

        {selectedProduct ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${getTierClass(selectedProduct.sellerTier)}`}>
                  {selectedProduct.sellerTier}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedProduct.status)}`}>
                  {selectedProduct.status}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold text-white">{selectedProduct.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedProduct.stockNote}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">카테고리</div>
                <div className="mt-1 text-slate-100">{selectedProduct.category}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">SKU</div>
                <div className="mt-1 text-slate-100">{selectedProduct.sku}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">마진 힌트</div>
                <div className="mt-1 text-slate-100">{selectedProduct.marginHint}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">추천 작업 공간</div>
                <div className="mt-1 text-cyan-100">{getRouteLabel(selectedProduct.recommendedRoute)}</div>
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
                    {getRouteLabel(route)} · {count}개 판매 흐름 연결
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedProduct.recommendedRoute}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                추천 작업 공간으로 이동
              </Link>
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
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
            가운데 목록에서 판매 상품을 선택하면 상세가 표시됩니다.
          </div>
        )}
      </aside>
    </div>
  );
}