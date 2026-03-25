import Link from "next/link";

const deployMarker = "DEPLOY_PARTS_ROOM_20260325_222719";

const partGroups = [
  { name: "링 / 체인", hint: "기본 연결 부자재" },
  { name: "고리 / 집게", hint: "걸이형 선택" },
  { name: "받침 / 스탠드", hint: "POP 전시용" },
  { name: "포장 / 마감", hint: "마지막 정리용" }
];

const partCards = [
  {
    title: "기본 키링 링",
    badge: "기본",
    price: "₩900",
    stock: "재고 충분",
    summary: "가장 많이 쓰는 기본 연결 부자재를 첫 카드로 고정했다.",
    bullets: ["은색 기본 링", "바로 담기 쉬움", "키링 주문과 바로 연결"]
  },
  {
    title: "미니 체인 세트",
    badge: "확장",
    price: "₩1,400",
    stock: "잔여 34",
    summary: "설명보다 선택 판단에 필요한 정보만 남긴 보조 부자재 카드다.",
    bullets: ["짧은 체인 연결", "옵션 비교 쉬움", "수량만 정하면 바로 진행"]
  },
  {
    title: "POP 투명 받침",
    badge: "전시",
    price: "₩2,900",
    stock: "잔여 12",
    summary: "전시용 부자재도 같은 카드 구조로 비교되게 맞췄다.",
    bullets: ["투명 받침", "POP 전시용", "서랍 저장 후 재사용 가능"]
  }
];

const summaryRows = [
  { label: "좌측", value: "부자재 범주 선택" },
  { label: "중앙", value: "핵심 부자재 카드" },
  { label: "우측", value: "가격 / 저장 / 주문" }
];

export default function PartsRoomPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">PARTS ROOM</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">부자재 선택도 더 짧고 바로 이해되게</h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                중복 설명과 장식성 박스를 줄이고, 선택 · 비교 · 저장 · 주문 흐름만 남긴 단순한 부자재실 화면이다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                배포 확인 기준: {deployMarker}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 옵션</p>
            <div className="mt-3 space-y-2">
              {partGroups.map((item, index) => {
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">정리 기준</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li className="rounded-xl bg-white px-3 py-2">선택 흐름 먼저</li>
                <li className="rounded-xl bg-white px-3 py-2">핵심 카드 3개만 유지</li>
                <li className="rounded-xl bg-white px-3 py-2">우측 CTA 고정</li>
              </ul>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-3">
              {partCards.map((card) => (
                <article key={card.title} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{card.title}</p>
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
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">핵심 구성</div>
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
                <Link href="/pop-studio" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  POP 작업
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
                  마지막 판단 카드만 남겨서 부자재 선택 후 바로 다음 행동으로 넘어가게 만들었다.
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">기본 키링 링</div>
                <div className="mt-1 text-sm text-neutral-600">가장 자주 쓰는 기본 부자재를 첫 기준 선택으로 고정했다.</div>

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
                  <Link href="/parts-room" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
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