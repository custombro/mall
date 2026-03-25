import Link from "next/link";

const questionGroups = [
  { name: "주문 전", hint: "가격 · 제작 가능 여부" },
  { name: "제작 중", hint: "일정 · 수정 · 상태 확인" },
  { name: "출고 후", hint: "재주문 · 보관 · 추가 문의" },
  { name: "운영 안내", hint: "파일 · 결제 · 기본 정책" }
];

const qaCards = [
  {
    title: "제작 전에 가장 많이 묻는 질문",
    badge: "기본",
    summary: "복잡한 안내 대신 주문 직전 판단에 필요한 질문만 먼저 보이게 정리했다.",
    bullets: ["최소 수량은 어떻게 되나요?", "파일 없이도 제작 가능한가요?", "오늘 접수하면 언제 출고되나요?"]
  },
  {
    title: "제작 중 확인 질문",
    badge: "진행",
    summary: "고객이 가장 불안해하는 일정/수정 여부를 중앙 카드로 바로 비교하게 만들었다.",
    bullets: ["지금 제작 단계는 어디인가요?", "수정 요청은 어디서 하나요?", "주문확인에서 무엇을 보면 되나요?"]
  },
  {
    title: "출고 후 재주문 질문",
    badge: "재주문",
    summary: "서랍 저장과 재주문 동선을 오른쪽 CTA와 연결하기 쉽게 정리했다.",
    bullets: ["같은 옵션으로 다시 주문 가능한가요?", "이전에 만든 파일을 다시 쓸 수 있나요?", "보관함에서 수정 재주문 가능한가요?"]
  }
];

const summaryRows = [
  { label: "좌측", value: "질문 범주 선택" },
  { label: "중앙", value: "핵심 질문 카드" },
  { label: "우측", value: "주문확인 / 서랍 / 문의 이동" }
];

export default function QAPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Q&amp;A</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">질문도 설명보다 답을 빨리 찾게</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600">
              긴 안내 문장 대신 실제로 많이 찾는 질문과 바로 이동 버튼만 남긴 간소화 화면이다.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 범주</p>
            <div className="mt-3 space-y-2">
              {questionGroups.map((item, index) => {
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
                <li className="rounded-xl bg-white px-3 py-2">상단 보조 설명 축소</li>
                <li className="rounded-xl bg-white px-3 py-2">질문은 카드 3개로 압축</li>
                <li className="rounded-xl bg-white px-3 py-2">행동 버튼은 우측 고정</li>
              </ul>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-3">
              {qaCards.map((card) => (
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
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">대표 질문</div>
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
                  주문확인으로 이동
                </Link>
                <Link href="/storage" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  서랍 열기
                </Link>
                <Link href="/orders" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  주문으로 이동
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  설명보다 다음 행동을 빠르게 고를 수 있게 문의 동선을 오른쪽에 모았다.
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">지금 바로 확인</div>
                <div className="mt-1 text-sm text-neutral-600">주문 상태 확인과 재주문 동선을 가장 먼저 보이게 고정했다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    주문확인
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 저장물 보기
                  </Link>
                  <Link href="/qa" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
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