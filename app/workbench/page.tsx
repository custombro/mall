import Link from "next/link";

const deployMarker = "DEPLOY_WORKBENCH_20260325_233025";

const workbenchGroups = [
  { name: "키링 작업", hint: "가장 자주 쓰는 기본 시작" },
  { name: "POP 작업", hint: "전시 / 스탠드 중심" },
  { name: "저장본 재사용", hint: "서랍에서 다시 불러오기" },
  { name: "주문 연결", hint: "주문 / 주문확인 바로 이동" }
];

const workbenchCards = [
  {
    title: "가장 빠른 작업 시작",
    badge: "기본",
    summary: "설명보다 바로 시작 버튼이 먼저 보이도록 핵심 카드만 남겼다.",
    bullets: ["키링 작업 시작", "POP 작업 시작", "기본 선택 후 바로 진행"]
  },
  {
    title: "저장본과 재사용",
    badge: "서랍",
    summary: "작업대에서도 저장본 재사용과 수정 재주문 흐름을 중앙에 모았다.",
    bullets: ["최근 저장본 불러오기", "수정 후 재주문", "기존 옵션 재사용"]
  },
  {
    title: "다음 행동 연결",
    badge: "이동",
    summary: "작업 후 주문, 주문확인, 서랍으로 자연스럽게 이어지는 구조만 남겼다.",
    bullets: ["주문으로 이동", "주문확인", "서랍 열기"]
  }
];

const summaryRows = [
  { label: "좌측", value: "작업 범주 선택" },
  { label: "중앙", value: "핵심 작업 카드" },
  { label: "우측", value: "시작 / 저장 / 주문 CTA" }
];

export default function WorkbenchPage() {
  return (
    <main className="cb-shell-page">
      <div className="cb-shell-content">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                WORKBENCH
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                작업대도 더 짧고 바로 시작되게
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                상단 보조 설명과 중복 박스를 줄이고, 시작 · 재사용 · 다음 행동만 남긴 단순한 작업대 화면이다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                배포 확인 기준: {deployMarker}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 작업 범주</p>
            <div className="mt-3 space-y-2">
              {workbenchGroups.map((item, index) => {
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">빠른 선택</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">키링 우선 시작</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">POP 바로 이동</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">서랍 저장본 재사용</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {workbenchCards.map((card) => (
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
                <Link href="/workbench/keyring" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  키링 작업 시작
                </Link>
                <Link href="/workbench/keyring/brush-assist-lab" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  키링 작업 실험실
                </Link>
                <Link href="/workbench/keyring/brush-assist-demo" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  붓칠 데모
                </Link>
                <Link href="/pop-studio" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  POP 작업 시작
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
                  작업대에서 바로 시작하고 저장하고 주문으로 이어지게 핵심 CTA만 남겼다.
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">지금 바로 작업 시작</div>
                <div className="mt-1 text-sm text-neutral-600">작업 시작, 저장, 주문 흐름만 선명하게 남긴 단순한 허브 구조다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/workbench/keyring" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    키링 작업 시작
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 저장본 보기
                  </Link>
                  <Link href="/orders" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    주문으로 이동
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
