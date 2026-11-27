import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "기업·행사 대량 제작 상담 안내 | 커스텀브로",
  description: "제품 규격·인쇄·수량 등 필요한 정보를 정리하는 안내 화면입니다. 실시간 견적·온라인 발주는 아직 연결되지 않았으며, 실제 제작비와 납기는 확인 후 안내합니다.",
  robots: { index: false, follow: false },
};



const b2bGroups = [
  { name: "대량 문의", hint: "행사 / 기업 주문 시작" },
  { name: "샘플 확인", hint: "대표 구성 빠른 확인" },
  { name: "반복 발주", hint: "서랍 기반 재사용" },
  { name: "상태 연결", hint: "주문 / 주문확인 이동" }
];

const b2bCards = [
  {
    title: "가장 빠른 대량 시작",
    badge: "기본",
    summary: "복잡한 설명 대신 기업·행사 주문 시작 흐름만 먼저 보이게 정리했다.",
    bullets: ["대량 주문 시작", "대표 구성 확인", "주문 흐름 바로 연결"]
  },
  {
    title: "샘플과 반복 발주",
    badge: "반복",
    summary: "샘플 확인과 저장본 재사용 흐름을 중앙 카드에 모아 판단을 짧게 만들었다.",
    bullets: ["샘플 기준 확인", "서랍 저장본 재사용", "반복 발주 단순화"]
  },
  {
    title: "상태와 다음 행동",
    badge: "이동",
    summary: "문의 후 주문, 주문확인, 작업대로 바로 이어지게 핵심 CTA만 남겼다.",
    bullets: ["주문으로 이동", "주문확인", "작업대로 이동"]
  }
];

const summaryRows = [
  { label: "좌측", value: "B2B 범주 선택" },
  { label: "중앙", value: "핵심 B2B 카드" },
  { label: "우측", value: "문의 / 주문 / 재사용 CTA" }
];

export default function B2BPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                B2B
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                기업·행사 대량 제작 상담 안내
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                현재는 대량 제작 절차의 안내 화면입니다. 실제 발주·결제와 연결되지 않으며, 제품 치수와 수량·인쇄 범위를 확인한 뒤 개별 견적을 안내합니다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                운영 상태: 온라인 발주 연동 전
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / B2B 범주</p>
            <div className="mt-3 space-y-2">
              {b2bGroups.map((item, index) => {
                const active = index === 0;
                return (
                  <div
                    key={item.name}
                    className={[
                      "rounded-2xl border px-4 py-3",
                      active ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-[#f8f4ec] text-neutral-900"
                    ].join(" ")}
                  >
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className={active ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-neutral-500"}>
                      {item.hint}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-[#f8f4ec] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">빠른 시작</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">대량 주문 시작</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">샘플 기준 확인</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">반복 발주 재사용</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {b2bCards.map((card) => (
                  <article key={card.title} className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight">{card.title}</p>
                        <p className="mt-1 text-sm leading-6 text-neutral-600">{card.summary}</p>
                      </div>
                      <span className="rounded-full bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white">
                        {card.badge}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2 text-sm text-neutral-800">
                      {card.bullets.map((item) => (
                        <li key={item} className="rounded-xl bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">중앙 · 바로 이동</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/orders" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  주문으로 이동
                </Link>
                <Link href="/storage" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  서랍 열기
                </Link>
                <Link href="/workbench" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  작업대로 이동
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 요약 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  B2B 발주에서도 가장 많이 쓰는 행동만 남겨 바로 다음 단계로 움직이게 정리했다.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f4ec] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">현재 구조</div>
                <div className="mt-3 space-y-3">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-neutral-500">{row.label}</span>
                      <span className="text-right font-medium text-neutral-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">빠른 행동</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">지금 바로 B2B 흐름 시작</div>
                <div className="mt-1 text-sm text-neutral-600">대량 시작, 저장본 재사용, 주문 관리 흐름만 선명하게 남긴 단순한 허브 구조다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/orders" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    주문으로 이동
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 저장본 보기
                  </Link>
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    주문확인으로 이동
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