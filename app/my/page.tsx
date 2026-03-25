import Link from "next/link";

const profileSections = [
  { name: "내 주문", hint: "진행 상태와 재주문 확인" },
  { name: "내 서랍", hint: "저장한 작업과 수정 재주문" },
  { name: "내 옵션", hint: "자주 쓰는 선택 빠른 접근" },
  { name: "계정 / 문의", hint: "기본 정보와 바로 이동" }
];

const infoCards = [
  {
    title: "최근 주문 확인",
    badge: "주문",
    summary: "주문확인과 재주문으로 바로 이어지게 가장 먼저 보이는 카드다.",
    bullets: ["제작 대기 / 진행 / 출고 확인", "주문번호 중심 확인", "바로 다음 행동 연결"]
  },
  {
    title: "서랍 저장물 보기",
    badge: "서랍",
    summary: "설명보다 저장된 작업을 다시 꺼내는 흐름이 먼저 보이도록 정리했다.",
    bullets: ["저장본 재사용", "수정 재주문 이동", "보관 상태 확인"]
  },
  {
    title: "빠른 재주문",
    badge: "빠른 이동",
    summary: "자주 쓰는 이동만 남겨서 내정보 화면을 허브처럼 쓸 수 있게 압축했다.",
    bullets: ["작업대로 이동", "옵션 다시 선택", "문의 전 주요 정보 확인"]
  }
];

const summaryRows = [
  { label: "좌측", value: "내 정보 범주" },
  { label: "중앙", value: "핵심 행동 카드" },
  { label: "우측", value: "저장 / 주문 / 문의" }
];

export default function MyPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">MY</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">내정보도 설명보다 행동이 먼저 보이게</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600">
              중복 안내를 줄이고, 자주 쓰는 확인 · 저장 · 재주문 동선만 남긴 단순한 내정보 화면이다.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 범주</p>
            <div className="mt-3 space-y-2">
              {profileSections.map((item, index) => {
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
                <li className="rounded-xl bg-white px-3 py-2">안내 문장 축소</li>
                <li className="rounded-xl bg-white px-3 py-2">핵심 행동 카드 3개</li>
                <li className="rounded-xl bg-white px-3 py-2">우측 CTA 고정</li>
              </ul>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-3">
              {infoCards.map((card) => (
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

                  <div className="mt-4 rounded-2xl border border-black/10 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">핵심 항목</div>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-800">
                      {card.bullets.map((bullet) => (
                        <li key={bullet} className="rounded-xl bg-[#f8f4ec] px-3 py-2">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">중앙 · 바로 이동</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/order-check" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  주문확인
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
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  마지막에 필요한 행동만 모아서 내정보 탭에서 바로 다음 단계로 넘길 수 있게 만들었다.
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
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">빠른 행동</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">내 주문부터 확인</div>
                <div className="mt-1 text-sm text-neutral-600">가장 자주 쓰는 주문확인과 서랍 이동을 먼저 보이게 고정했다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    주문확인
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 보기
                  </Link>
                  <Link href="/qa" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    문의 전 Q&amp;A 보기
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