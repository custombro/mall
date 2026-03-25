"use client";

import Link from "next/link";

type ClearanceBundle = {
  id: string;
  name: string;
  badge: string;
  price: string;
  stock: string;
  eta: string;
  discount: string;
  summary: string;
  includes: string[];
  notes: string[];
};

const bundles: ClearanceBundle[] = [
  {
    id: "starter",
    name: "빠른 소진 묶음",
    badge: "추천",
    price: "₩7,900",
    stock: "잔여 42세트",
    eta: "오늘 마감 기준 1~2일",
    discount: "-28%",
    summary: "남은 재고를 바로 소진하기 좋은 기본 구성이다.",
    includes: ["기본 아크릴 1종", "일반 포장", "즉시 주문 가능"],
    notes: ["색상 선택 최소화", "설명 박스 제거", "작업 판단을 우측으로 집중"]
  },
  {
    id: "bulk",
    name: "수량 우선 묶음",
    badge: "수량용",
    price: "₩14,900",
    stock: "잔여 18세트",
    eta: "내일 출고 우선",
    discount: "-34%",
    summary: "행사용/대량용으로 빠르게 담는 수량 중심 구성이다.",
    includes: ["동일 옵션 대량 적용", "포장 간소화", "저장 후 재주문 동선 유지"],
    notes: ["옵션 수 줄임", "중앙 콘텐츠 집중", "오른쪽에 CTA 고정"]
  },
  {
    id: "custom",
    name: "부분 커스텀 묶음",
    badge: "수정 가능",
    price: "₩19,900",
    stock: "잔여 11세트",
    eta: "2~3일",
    discount: "-19%",
    summary: "핵심 옵션만 남겨서 수정 가능성과 속도를 같이 잡는다.",
    includes: ["소재 2종 중 선택", "수량 조정", "서랍 저장 가능"],
    notes: ["복잡한 안내 제거", "선택-작업-주문 흐름 고정", "재고 상태 바로 노출"]
  }
];

const statusRows = [
  { label: "저장 상태", value: "서랍 저장 가능" },
  { label: "주문 흐름", value: "바로 주문 / 주문확인 연동" },
  { label: "표시 방식", value: "좌측 선택 · 중앙 핵심 · 우측 요약" }
];

const quickFilters = ["아크릴", "소량", "대량", "재주문"];
const fastLinks = [
  { href: "/workbench", label: "작업대로 이동" },
  { href: "/storage", label: "서랍 열기" },
  { href: "/orders", label: "주문으로 이동" },
  { href: "/order-check", label: "주문확인" }
];

export default function ClearanceClient() {
  const selected = bundles[0];

  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                CLEARANCE
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                복잡한 설명 없이 바로 담는 정리 판매
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600">
              상단 보조 설명과 중복 박스를 줄이고, 선택 · 작업 판단 · 주문 이동만 남긴 간소화 화면이다.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 옵션</p>
              <div className="space-y-2">
                {bundles.map((bundle, index) => {
                  const active = index === 0;
                  return (
                    <button
                      key={bundle.id}
                      type="button"
                      className={[
                        "w-full rounded-2xl border px-4 py-3 text-left transition",
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-black/10 bg-[#f8f4ec] text-neutral-900 hover:border-black/20"
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{bundle.name}</div>
                          <div className={active ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-neutral-500"}>
                            {bundle.summary}
                          </div>
                        </div>
                        <span
                          className={[
                            "rounded-full px-2 py-1 text-[11px] font-semibold",
                            active ? "bg-white/15 text-white" : "bg-neutral-900 text-white"
                          ].join(" ")}
                        >
                          {bundle.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#f8f4ec] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">빠른 필터</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickFilters.map((filterItem) => (
                  <span
                    key={filterItem}
                    className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-neutral-700"
                  >
                    {filterItem}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight">{selected.name}</h2>
                    <span className="rounded-full bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white">
                      {selected.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-neutral-600">{selected.summary}</p>
                </div>
                <div className="rounded-2xl bg-[#f8f4ec] px-4 py-3 text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">기준가</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">{selected.price}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f8f4ec] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">핵심 구성</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                    {selected.includes.map((item) => (
                      <li key={item} className="rounded-xl bg-white px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">작업 판단 메모</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                    {selected.notes.map((item) => (
                      <li key={item} className="rounded-xl bg-[#f8f4ec] px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">재고</p>
                <p className="mt-2 text-lg font-semibold">{selected.stock}</p>
                <p className="mt-1 text-sm text-neutral-600">남은 재고를 바로 판단할 수 있게 상단 장식 없이 표기한다.</p>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">예상 납기</p>
                <p className="mt-2 text-lg font-semibold">{selected.eta}</p>
                <p className="mt-1 text-sm text-neutral-600">작업 대기보다 실제 출고 판단 정보가 먼저 보이도록 정리했다.</p>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">할인</p>
                <p className="mt-2 text-lg font-semibold">{selected.discount}</p>
                <p className="mt-1 text-sm text-neutral-600">복잡한 이유 설명 대신 가격·재고·주문 흐름만 남겼다.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">중앙 · 바로 이동</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {fastLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-black/20 hover:bg-[#f1eadf]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 / 가격 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  사용자가 마지막에 결정을 내리는 카드만 남겨서 읽는 순서를 짧게 만들었다.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f4ec] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">선택 요약</div>
                <div className="mt-3 space-y-3">
                  {statusRows.map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-neutral-500">{row.label}</span>
                      <span className="text-right font-medium text-neutral-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">현재 선택가</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">{selected.price}</div>
                  </div>
                  <div className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                    {selected.discount}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link
                    href="/orders"
                    className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    바로 주문
                  </Link>
                  <Link
                    href="/storage"
                    className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:border-black/20"
                  >
                    서랍 저장
                  </Link>
                  <Link
                    href="/workbench"
                    className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:border-black/20"
                  >
                    작업대로 이동
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}