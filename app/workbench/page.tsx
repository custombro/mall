import Link from "next/link";

const deployMarker = "DEPLOY_WORKBENCH_20260416_01";

const workbenchGroups = [
  { name: "키링 작업", hint: "멀티 파일 · 붓칠 · 칼선 확인" },
  { name: "POP 작업", hint: "전시 / 스탠드 중심" },
  { name: "저장본 재사용", hint: "서랍에서 다시 불러오기" },
  { name: "주문 연결", hint: "주문 / 주문확인 바로 이동" }
];

const workbenchCards = [
  {
    title: "가장 빠른 키링 시작",
    badge: "기본",
    summary: "여러 이미지를 한 번에 올리고 파일별 작업 상태를 유지한 채 바로 칼선까지 확인한다.",
    bullets: ["키링 작업 시작", "여러 파일 업로드", "파일별 상태 유지"]
  },
  {
    title: "브러시 분리 실험실",
    badge: "실험실",
    summary: "러프한 붓칠만으로 스무딩된 윤곽선을 계산해 칼선 느낌을 먼저 확인하는 흐름이다.",
    bullets: ["작업 실험실", "붓칠 데모", "스무딩 칼선 확인"]
  },
  {
    title: "저장과 다음 행동",
    badge: "이동",
    summary: "작업 후 저장본 재사용, 주문, 주문확인으로 자연스럽게 이어지게 핵심 행동만 남겼다.",
    bullets: ["서랍 열기", "주문으로 이동", "주문확인"]
  }
];

const summaryRows = [
  { label: "좌측", value: "작업 범주 / 파일 선택" },
  { label: "중앙", value: "핵심 작업 카드" },
  { label: "우측", value: "실험실 / 저장 / 주문 CTA" }
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
                작업대에서 바로 멀티 파일 칼선 확인까지
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                설명을 줄이고, 키링 작업 시작 · 브러시 실험실 · 저장 · 주문 연결만 선명하게 남긴 작업 허브다.
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
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">브러시 실험실 진입</div>
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
                  브러시 실험실
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
                  작업 시작, 실험실 진입, 저장, 주문 연결까지 가장 자주 쓰는 행동만 남겼다.
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
                <div className="mt-1 text-sm text-neutral-600">키링 시작, 브러시 실험실, 저장본 재사용, 주문 이동만 선명하게 남긴 허브 구조다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/workbench/keyring" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    키링 작업 시작
                  </Link>
                  <Link href="/workbench/keyring/brush-assist-lab" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    브러시 실험실 열기
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
