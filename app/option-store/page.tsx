import Link from "next/link";

const categories = [
  { name: "링 / 체인", hint: "가장 많이 쓰는 기본 연결 부자재" },
  { name: "패키지", hint: "포장만 빠르게 선택" },
  { name: "스탠드 / 받침", hint: "POP와 전시용 중심" },
  { name: "보강 옵션", hint: "재주문 대비 저장용" }
];

const options = [
  {
    name: "기본 링 세트",
    price: "₩900",
    stock: "재고 충분",
    summary: "가장 빠르게 붙는 기본 연결 부자재 구성",
    bullets: ["은색 기본 링", "즉시 선택 가능", "키링 주문과 바로 연결"]
  },
  {
    name: "패키지 간소화 세트",
    price: "₩1,500",
    stock: "잔여 28",
    summary: "설명 없이 바로 담는 기본 포장 옵션",
    bullets: ["기본 포장", "단일 규격", "수량만 정하면 끝"]
  },
  {
    name: "POP 받침 세트",
    price: "₩2,900",
    stock: "잔여 11",
    summary: "전시용 POP에 필요한 핵심만 남긴 구성",
    bullets: ["투명 받침", "기본 고정부", "바로 저장 가능"]
  }
];

const summaryRows = [
  { label: "선택 구조", value: "좌측 카테고리" },
  { label: "핵심 비교", value: "중앙 카드 3개" },
  { label: "마지막 행동", value: "우측 저장 / 주문" }
];

export default function OptionStorePage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">OPTION STORE</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">부자재는 복잡한 설명 없이 바로 고른다</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600">
              부자재몰을 안내 문구 중심이 아니라 선택 · 비교 · 저장 · 주문 흐름으로 다시 정리한 단순 화면이다.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 옵션</p>
            <div className="mt-3 space-y-2">
              {categories.map((item, index) => {
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
                    <div className={active ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-neutral-500"}>{item.hint}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-[#f8f4ec] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">정리 기준</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li className="rounded-xl bg-white px-3 py-2">중복 박스 제거</li>
                <li className="rounded-xl bg-white px-3 py-2">선택 이유 설명 최소화</li>
                <li className="rounded-xl bg-white px-3 py-2">가격과 CTA를 우측 고정</li>
              </ul>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-3">
              {options.map((option, index) => (
                <article key={option.name} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{option.name}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{option.summary}</p>
                    </div>
                    <span className="rounded-full bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white">
                      {index === 0 ? "추천" : "선택"}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8f4ec] px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">기준가</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">{option.price}</div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-black/10 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">핵심 구성</div>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                      {option.bullets.map((bullet) => (
                        <li key={bullet} className="rounded-xl bg-[#f8f4ec] px-3 py-2">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-neutral-500">재고 상태</span>
                    <span className="font-semibold text-neutral-900">{option.stock}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">중앙 · 바로 이동</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/workbench/keyring" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  키링 작업으로 이동
                </Link>
                <Link href="/pop-studio" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  POP 작업으로 이동
                </Link>
                <Link href="/storage" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  서랍 열기
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 수량 / 가격 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">마지막 판단 카드만 남겨서 주문 흐름을 짧게 만든 상태다.</p>
              </div>

              <div className="rounded-2xl bg-[#f8f4ec] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">화면 요약</div>
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
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">현재 기준 선택</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">기본 링 세트</div>
                <div className="mt-1 text-sm text-neutral-600">설명보다 바로 담기 쉬운 기본 옵션을 첫 카드로 고정했다.</div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">선택가</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">₩900</div>
                  </div>
                  <div className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">기본</div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link href="/orders" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    바로 주문
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 저장
                  </Link>
                  <Link href="/option-store" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    현재 화면 유지
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