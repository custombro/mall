"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  storageShelves,
  storageStatusOptions,
  storageTagOptions,
  type StorageItem,
} from "./storage-config";

function getStatusClass(status: StorageItem["status"]) {
  switch (status) {
    case "재주문 가능":
      return "border-emerald-400/30 bg-emerald-400/15 text-emerald-100";
    case "작업중":
      return "border-cyan-400/30 bg-cyan-400/15 text-cyan-100";
    case "검수 필요":
      return "border-amber-400/30 bg-amber-400/15 text-amber-100";
    default:
      return "border-white/15 bg-white/10 text-slate-100";
  }
}

function getRouteLabel(href: string) {
  const map: Record<string, string> = {
    "/": "홈 허브",
    "/workbench/keyring": "키링 작업대",
    "/pop-studio": "POP 스튜디오",
    "/materials-room": "원자재 룸",
    "/parts-room": "부자재 룸",
    "/option-store": "옵션 스토어",
    "/seller": "판매자 센터",
    "/b2b": "B2B 허브",
    "/clearance": "재고 정리",
  };

  return map[href] ?? href;
}

export default function StorageWallClient() {
  const [selectedShelfId, setSelectedShelfId] = useState(storageShelves[0]?.id ?? "");
  const [statusFilter, setStatusFilter] = useState<StorageItem["status"] | "전체">("전체");
  const [tagFilter, setTagFilter] = useState<string>("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>(() => storageShelves[0]?.drawers[0]?.id ?? "");

  const selectedShelf = useMemo(() => {
    return storageShelves.find((shelf) => shelf.id === selectedShelfId) ?? storageShelves[0];
  }, [selectedShelfId]);

  const filteredDrawers = useMemo(() => {
    if (!selectedShelf) {
      return [];
    }

    const normalizedKeyword = keyword.trim().toLowerCase();

    return selectedShelf.drawers.filter((item) => {
      const statusMatch = statusFilter === "전체" || item.status === statusFilter;
      const tagMatch = tagFilter === "전체" || item.tags.includes(tagFilter);
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          item.title,
          item.customer,
          item.productLine,
          item.drawerCode,
          item.materialSummary,
          item.note,
          item.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return statusMatch && tagMatch && keywordMatch;
    });
  }, [keyword, selectedShelf, statusFilter, tagFilter]);

  const selectedItem = useMemo(() => {
    const byId = filteredDrawers.find((item) => item.id === selectedItemId);
    return byId ?? filteredDrawers[0] ?? null;
  }, [filteredDrawers, selectedItemId]);

  const totalItems = useMemo(() => {
    return storageShelves.reduce((sum, shelf) => sum + shelf.drawers.length, 0);
  }, []);

  const reorderableCount = useMemo(() => {
    return storageShelves
      .flatMap((shelf) => shelf.drawers)
      .filter((item) => item.status === "재주문 가능").length;
  }, []);

  const inspectionCount = useMemo(() => {
    return storageShelves
      .flatMap((shelf) => shelf.drawers)
      .filter((item) => item.status === "검수 필요").length;
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_1.1fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Storage Overview
          </p>
          <h2 className="text-2xl font-semibold text-white">서랍형 재호출 허브</h2>
          <p className="text-sm leading-6 text-slate-300">
            작업물을 단순 목록이 아니라 서랍처럼 보관하고, 필요할 때 다시 꺼내
            다음 작업 공간으로 즉시 넘기는 흐름에 집중합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">총 보관 단위</p>
            <div className="mt-2 text-3xl font-semibold text-white">{totalItems}</div>
            <p className="mt-2 text-sm text-slate-300">현재 서랍에 등록된 작업물 수</p>
          </div>
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">재주문 가능</p>
            <div className="mt-2 text-3xl font-semibold text-emerald-50">{reorderableCount}</div>
            <p className="mt-2 text-sm text-emerald-100/80">바로 다음 제작 흐름으로 재호출 가능</p>
          </div>
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">검수 필요</p>
            <div className="mt-2 text-3xl font-semibold text-amber-50">{inspectionCount}</div>
            <p className="mt-2 text-sm text-amber-100/80">보강/확인 메모가 남은 상태</p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">보관 월 선택</p>
          <div className="grid gap-2">
            {storageShelves.map((shelf) => {
              const active = shelf.id === selectedShelf?.id;

              return (
                <button
                  key={shelf.id}
                  type="button"
                  onClick={() => {
                    setSelectedShelfId(shelf.id);
                    setSelectedItemId(shelf.drawers[0]?.id ?? "");
                  }}
                  className={
                    active
                      ? "rounded-2xl border border-cyan-300/40 bg-cyan-300/15 p-4 text-left"
                      : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{shelf.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-300">{shelf.subtitle}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {shelf.drawers.length}칸
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              Drawer Filters
            </p>
            <h2 className="text-2xl font-semibold text-white">{selectedShelf?.title ?? "보관 월"}</h2>
            <p className="text-sm leading-6 text-slate-300">
              보관 월 안에서 상태, 태그, 검색어로 원하는 작업물을 빠르게 찾아냅니다.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">상태</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StorageItem["status"] | "전체")}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                {storageStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">태그</span>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="전체">전체</option>
                {storageTagOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">검색</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="고객명, 제품명, 서랍코드"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-3">
          {filteredDrawers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
              현재 필터 조건에 맞는 서랍이 없습니다.
            </div>
          ) : (
            filteredDrawers.map((item) => {
              const active = item.id === selectedItem?.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
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
                          {item.drawerCode}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">{item.title}</div>
                        <div className="mt-1 text-sm text-slate-300">
                          {item.customer} · {item.productLine} · 수량 {item.quantity}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-slate-300">
                      마지막 작업: {item.lastWorkedAt}
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
            Drawer Detail
          </p>
          <h2 className="text-2xl font-semibold text-white">선택한 서랍 상세</h2>
          <p className="text-sm leading-6 text-slate-300">
            작업물 메모를 확인하고 적절한 다음 공간으로 바로 이동합니다.
          </p>
        </div>

        {selectedItem ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {selectedItem.drawerCode}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold text-white">{selectedItem.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedItem.note}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">고객</div>
                <div className="mt-1 text-slate-100">{selectedItem.customer}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">제품군</div>
                <div className="mt-1 text-slate-100">{selectedItem.productLine}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">소재/구성</div>
                <div className="mt-1 text-slate-100">{selectedItem.materialSummary}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">마지막 작업일</div>
                <div className="mt-1 text-slate-100">{selectedItem.lastWorkedAt}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">다음 추천 공간</div>
                <div className="mt-1 text-cyan-100">{getRouteLabel(selectedItem.recommendedRoute)}</div>
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedItem.recommendedRoute}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                추천 공간으로 이동
              </Link>
              <Link
                href="/mode-select"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                제작 모드 다시 선택
              </Link>
              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                홈 허브로 돌아가기
              </Link>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm font-semibold text-emerald-50">재호출 흐름 메모</p>
              <p className="mt-2 text-sm leading-6 text-emerald-100/90">
                이 서랍은 단순 보관이 아니라 다음 작업으로 재호출하기 위한 중간 지점입니다.
                작업물 성격에 따라 키링 작업대, POP 스튜디오, 자재 공간, 판매 공간으로 바로 이동합니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
            왼쪽에서 서랍을 선택하면 상세 정보가 표시됩니다.
          </div>
        )}
      </aside>
    </div>
  );
}