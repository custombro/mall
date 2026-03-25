import Link from "next/link";

const materialCategories = [
  { name: "투명 아크릴", hint: "가장 기본이 되는 소재" },
  { name: "유색 아크릴", hint: "색감 중심 선택" },
  { name: "반투명 / 오팔", hint: "부드러운 표현용" },
  { name: "특수 마감", hint: "펄 / 미러 / 포인트용" }
];

const materialCards = [
  {
    name: "기본 투명 3T",
    badge: "기본",
    price: "₩2,400",
    stock: "재고 충분",
    summary: "가장 많이 쓰는 기본 소재만 먼저 보이게 정리했다.",
    bullets: ["키링 기본용", "인쇄/커팅 기준 안정적", "재주문 연결 쉬움"]
  },
  {
    name: "화이트 오팔 3T",
    badge: "인기",
    price: "₩3,100",
    stock: "잔여 23",
    summary: "설명보다 선택 판단에 필요한 정보만 남긴 소재 카드다.",
    bullets: ["은은한 반투명", "POP 포인트용", "과한 설명 제거"]
  },
  {
    name: "컬러 블루 3T",
    badge: "포인트",
    price: "₩3,400",
    stock: "잔여 12",
    summary: "색상 계열은 하나의 카드 구조로 동일하게 비교되도록 맞췄다.",
    bullets: ["유색 시리즈", "가시성 좋은 포인트", "저장 후 재사용 가능"]
  }
];

const summaryRows = [
  { label: "좌측", value: "소재 계열 선택" },
  { label: "중앙", value: "핵심 소재 카드 비교" },
  { label: "우측", value: "가격 / 저장 / 주문" }
];

export default function MaterialsRoomPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">MATERIALS ROOM</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">자재 선택은 단순하게, 판단은 더 빠르게</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600">
              상단 장식과 중복 설명을 줄이고, 좌측 선택 · 중앙 비교 · 우측 저장/주문 구조만 남긴 자재실 화면이다.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 옵션</p>
            <div className="mt-3 space-y-2">
              {materialCategories.map((item, index) => {
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">이번 정리 포인트</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li className="rounded-xl bg-white px-3 py-2">선택 흐름 먼저</li>
                <li className="rounded-xl bg-white px-3 py-2">설명 박스 최소화</li>
                <li className="rounded-xl bg-white px-3 py-2">주문 행동은 우측 고정</li>
              </ul>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-3">
              {materialCards.map((card) => (
                <article key={card.name} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{card.name}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{card.summary}</p>
                    </div>
                    <span className="rounded-full bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white">
                      {card.badge}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8f4ec] px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">기준가</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">{card.price}</div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-black/10 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">핵심 정보</div>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                      {card.bullets.map((bullet) => (
                        <li key={bullet} className="rounded-xl bg-[#f8f4ec] px-3 py-2">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-neutral-500">재고 상태</span>
                    <span className="font-semibold text-neutral-900">{card.stock}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">중앙 · 바로 이동</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/workbench/keyring" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  키링 작업
                </Link>
                <Link href="/option-store" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  부자재 선택
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
                <p className="text-sm font-semibold text-neutral-900">우측 · 가격 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  자재실에서도 마지막 판단 카드만 남겨서 사용자가 바로 다음 행동을 결정할 수 있게 만들었다.
                </p>
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">기본 투명 3T</div>
                <div className="mt-1 text-sm text-neutral-600">가장 많이 쓰는 기본 자재를 첫 카드로 고정했다.</div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">선택가</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">₩2,400</div>
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
                  <Link href="/materials-room" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
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