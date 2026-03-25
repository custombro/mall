import Link from "next/link";

const deployMarker = "DEPLOY_MY_20260326_000754";

const myGroups = [
  { name: "내 주문", hint: "상태와 재주문 확인" },
  { name: "내 서랍", hint: "저장본 다시 쓰기" },
  { name: "내 작업", hint: "작업대로 바로 이동" },
  { name: "빠른 연결", hint: "주문 / 주문확인 / Q&A" }
];

const myCards = [
  {
    title: "가장 빠른 내 주문 확인",
    badge: "기본",
    summary: "복잡한 안내 대신 주문 상태와 다음 행동이 먼저 보이게 정리했다.",
    bullets: ["주문 상태 확인", "주문확인 바로 이동", "재주문 흐름 연결"]
  },
  {
    title: "저장본과 재사용",
    badge: "서랍",
    summary: "저장본 재사용과 수정 재주문 흐름을 중앙 카드에 모아 판단을 짧게 만들었다.",
    bullets: ["서랍 저장본 열기", "최근 작업 다시 쓰기", "수정 후 재주문"]
  },
  {
    title: "다음 행동 연결",
    badge: "이동",
    summary: "내정보 화면에서도 작업대, 주문, Q&A로 바로 이어지게 CTA만 선명하게 남겼다.",
    bullets: ["작업대로 이동", "주문으로 이동", "Q&A 확인"]
  }
];

const summaryRows = [
  { label: "좌측", value: "내 정보 범주 선택" },
  { label: "중앙", value: "핵심 내 정보 카드" },
  { label: "우측", value: "확인 / 저장 / 이동 CTA" }
];

export default function MyPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                MY
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                내정보도 더 짧고 바로 움직이게
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                상단 보조 설명과 중복 요소를 줄이고, 주문 확인 · 저장본 재사용 · 다음 행동만 남긴 단순한 내정보 화면이다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                배포 확인 기준: {deployMarker}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 내 정보 범주</p>
            <div className="mt-3 space-y-2">
              {myGroups.map((item, index) => {
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
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">주문 상태 확인</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">서랍 저장본 열기</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">작업대로 바로 이동</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {myCards.map((card) => (
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
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 요약 / 저장 / 이동</p>
                <p className="mt-1 text-sm text-neutral-600">
                  내정보 화면에서도 가장 많이 쓰는 행동만 남겨 바로 다음 단계로 움직이게 정리했다.
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">지금 바로 확인</div>
                <div className="mt-1 text-sm text-neutral-600">주문확인, 서랍, 작업대 이동만 선명하게 남긴 단순한 내정보 허브 구조다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    주문확인
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 저장본 보기
                  </Link>
                  <Link href="/workbench" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
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