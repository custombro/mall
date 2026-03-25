import Link from "next/link";

const deployMarker = "DEPLOY_QA_20260325_235855";

const qaGroups = [
  { name: "주문 전", hint: "가격 / 제작 가능 여부" },
  { name: "제작 중", hint: "일정 / 수정 / 상태 확인" },
  { name: "출고 후", hint: "재주문 / 저장 / 추가 문의" },
  { name: "빠른 이동", hint: "주문 / 주문확인 / 서랍" }
];

const qaCards = [
  {
    title: "가장 많이 묻는 시작 질문",
    badge: "기본",
    summary: "긴 안내 대신 주문 직전 판단에 필요한 질문만 먼저 보이게 정리했다.",
    bullets: ["최소 수량은 어떻게 되나요?", "파일 없이도 제작 가능한가요?", "오늘 접수하면 언제 출고되나요?"]
  },
  {
    title: "제작 중 확인 질문",
    badge: "진행",
    summary: "고객이 가장 자주 보는 일정·수정 여부만 중앙 카드에 모았다.",
    bullets: ["지금 제작 단계는 어디인가요?", "수정 요청은 어디서 하나요?", "주문확인에서 무엇을 보면 되나요?"]
  },
  {
    title: "재주문과 저장 질문",
    badge: "재사용",
    summary: "서랍 저장과 재주문 동선으로 바로 이어지게 핵심 질문만 남겼다.",
    bullets: ["같은 옵션으로 다시 주문 가능한가요?", "이전에 만든 파일을 다시 쓸 수 있나요?", "보관함에서 수정 재주문 가능한가요?"]
  }
];

const summaryRows = [
  { label: "좌측", value: "질문 범주 선택" },
  { label: "중앙", value: "핵심 질문 카드" },
  { label: "우측", value: "주문 / 저장 / 이동 CTA" }
];

export default function QAPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Q&amp;A
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                질문도 더 짧고 답을 빨리 찾게
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                상단 보조 설명과 중복 요소를 줄이고, 질문 범주 · 핵심 답 · 다음 행동만 남긴 단순한 Q&amp;A 화면이다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                배포 확인 기준: {deployMarker}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 질문 범주</p>
            <div className="mt-3 space-y-2">
              {qaGroups.map((item, index) => {
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">빠른 확인</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">최소 수량</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">제작 일정</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">재주문 방법</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {qaCards.map((card) => (
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
                <Link href="/order-check" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  주문확인
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
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 요약 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  질문을 본 뒤 바로 다음 행동으로 움직일 수 있게 핵심 CTA만 남겼다.
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">지금 바로 다음 단계로 이동</div>
                <div className="mt-1 text-sm text-neutral-600">주문, 주문확인, 서랍 이동만 선명하게 남긴 단순한 안내 구조다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/orders" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    주문으로 이동
                  </Link>
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    주문확인
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 열기
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