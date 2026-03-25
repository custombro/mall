import Link from "next/link";

const deployMarker = "DEPLOY_POP_20260325_233947";

const popGroups = [
  { name: "기본 POP", hint: "가장 빠른 시작" },
  { name: "받침 / 전시", hint: "스탠드 중심 선택" },
  { name: "저장본 재사용", hint: "서랍에서 다시 불러오기" },
  { name: "주문 연결", hint: "주문과 상태 확인 이동" }
];

const popCards = [
  {
    title: "가장 빠른 POP 시작",
    badge: "기본",
    summary: "설명보다 바로 시작 버튼이 먼저 보이도록 핵심 카드만 남겼다.",
    bullets: ["기본 POP 시작", "사이즈 기준 선택", "즉시 제작 흐름 시작"]
  },
  {
    title: "받침과 전시 구성",
    badge: "전시",
    summary: "전시용 받침과 보조 부자재 판단 흐름을 중앙에 모았다.",
    bullets: ["받침 선택", "전시형 구성", "옵션 비교 단순화"]
  },
  {
    title: "다음 행동 연결",
    badge: "이동",
    summary: "작업 후 주문, 주문확인, 서랍으로 바로 이어지게 핵심 CTA만 남겼다.",
    bullets: ["주문으로 이동", "주문확인", "서랍 열기"]
  }
];

const summaryRows = [
  { label: "좌측", value: "POP 범주 선택" },
  { label: "중앙", value: "핵심 제작 카드" },
  { label: "우측", value: "시작 / 저장 / 주문 CTA" }
];

export default function PopStudioPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                POP STUDIO
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                POP 제작도 더 짧고 바로 시작되게
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                상단 보조 설명과 중복 박스를 줄이고, 시작 · 전시 구성 · 다음 행동만 남긴 단순한 POP 화면이다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                배포 확인 기준: {deployMarker}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 제작 범주</p>
            <div className="mt-3 space-y-2">
              {popGroups.map((item, index) => {
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
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">기본 POP 시작</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">받침 선택</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">저장본 재사용</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {popCards.map((card) => (
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
                <Link href="/option-store" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  부자재 보기
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 요약 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  POP 작업에서도 가장 많이 쓰는 행동만 남겨 바로 다음 단계로 움직이게 정리했다.
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">지금 바로 POP 시작</div>
                <div className="mt-1 text-sm text-neutral-600">POP 시작, 저장본 재사용, 주문 흐름만 선명하게 남긴 단순한 허브 구조다.</div>

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