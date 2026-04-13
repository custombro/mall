import Link from "next/link";

const deployMarker = "DEPLOY_ORDER_CHECK_20260325_231147";

const checkGroups = [
  { name: "주문 조회", hint: "주문번호 / 연락처 기준" },
  { name: "제작 상태", hint: "접수 · 제작 · 출고" },
  { name: "재주문", hint: "서랍 / 기존 주문 연결" },
  { name: "문의 전 확인", hint: "가장 많이 찾는 상태 확인" }
];

const statusCards = [
  {
    title: "지금 가장 먼저 확인할 것",
    badge: "기본",
    summary: "주문번호와 연락처 기준으로 가장 빠르게 상태를 찾는 흐름만 남겼다.",
    bullets: ["주문번호 입력", "기본 연락처 확인", "상태 바로 확인"]
  },
  {
    title: "제작 상태 단계",
    badge: "진행",
    summary: "상단 설명 대신 실제로 궁금한 제작 단계만 중앙 카드에 정리했다.",
    bullets: ["접수 완료", "제작 진행", "출고 완료"]
  },
  {
    title: "다음 행동 연결",
    badge: "이동",
    summary: "상태 확인 후 재주문, 서랍, 문의로 바로 이어지게 정리했다.",
    bullets: ["서랍으로 이동", "주문으로 이동", "문의 전 Q&A 확인"]
  }
];

const summaryRows = [
  { label: "조회 방식", value: "좌측 범주 선택" },
  { label: "핵심 정보", value: "중앙 상태 카드" },
  { label: "다음 행동", value: "우측 CTA 요약" }
];

export default function OrderCheckPage() {
  return (
    <main className="cb-shell-page">
      <div className="cb-shell-content">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                ORDER CHECK
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                주문확인도 설명보다 상태가 먼저 보이게
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                중복 안내를 줄이고, 조회 · 상태 · 다음 행동만 남긴 단순한 주문확인 화면이다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                배포 확인 기준: {deployMarker}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 조회 방식</p>
            <div className="mt-3 space-y-2">
              {checkGroups.map((item, index) => {
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">빠른 조회</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">주문번호 기준</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">연락처 뒷자리 기준</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">서랍 저장본 연결</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {statusCards.map((card) => (
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
                <Link href="/qa" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  Q&amp;A 확인
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 요약 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  조회 후 바로 다음 행동을 고를 수 있게 핵심 CTA만 남겼다.
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">지금 주문 상태 확인</div>
                <div className="mt-1 text-sm text-neutral-600">주문확인 후 바로 주문, 서랍, 문의 흐름으로 이동하게 정리했다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/orders" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    주문으로 이동
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 저장물 보기
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