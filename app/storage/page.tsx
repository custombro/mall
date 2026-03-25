import Link from "next/link";

const deployMarker = "DEPLOY_STORAGE_20260325_232504";

const drawerGroups = [
  { name: "최근 저장본", hint: "가장 최근 작업 다시 열기" },
  { name: "재주문용", hint: "같은 옵션 반복 사용" },
  { name: "수정 대기", hint: "부분 수정 후 재주문" },
  { name: "보관 확인", hint: "정리된 저장 상태 확인" }
];

const storageCards = [
  {
    title: "최근 저장본 다시 열기",
    badge: "기본",
    summary: "설명보다 가장 많이 쓰는 저장본 재열기 흐름을 먼저 보이게 정리했다.",
    bullets: ["최근 작업 바로 열기", "작업대로 이동", "같은 옵션 재사용"]
  },
  {
    title: "수정 후 재주문",
    badge: "수정",
    summary: "저장된 작업을 바탕으로 수정 재주문으로 이어지는 흐름만 남겼다.",
    bullets: ["기존 저장본 선택", "수정 후 다시 주문", "상태 확인과 연결"]
  },
  {
    title: "보관 상태와 다음 행동",
    badge: "이동",
    summary: "저장 후 바로 주문확인, 작업대, 주문으로 넘기는 CTA만 선명하게 남겼다.",
    bullets: ["주문확인 이동", "주문으로 이동", "작업대로 복귀"]
  }
];

const summaryRows = [
  { label: "좌측", value: "저장본 범주 선택" },
  { label: "중앙", value: "핵심 저장본 카드" },
  { label: "우측", value: "재주문 / 이동 CTA" }
];

export default function StoragePage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                STORAGE
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                서랍도 더 짧고 바로 꺼내 쓰기 쉽게
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                중복 안내를 줄이고, 저장본 선택 · 재사용 · 재주문 흐름만 남긴 단순한 서랍 화면이다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                배포 확인 기준: {deployMarker}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 저장 범주</p>
            <div className="mt-3 space-y-2">
              {drawerGroups.map((item, index) => {
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
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">최근 저장본 우선</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">수정 재주문 우선</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">보관 상태 확인</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {storageCards.map((card) => (
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
                  작업대로 이동
                </Link>
                <Link href="/orders" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  주문으로 이동
                </Link>
                <Link href="/order-check" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  주문확인
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 상태 요약 / 저장 / 재주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  저장본을 고른 뒤 바로 재사용하거나 재주문할 수 있게 핵심 CTA만 남겼다.
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
                <div className="mt-2 text-2xl font-semibold tracking-tight">저장본 다시 사용</div>
                <div className="mt-1 text-sm text-neutral-600">서랍에서 바로 작업대, 주문, 주문확인으로 이어지는 흐름만 남겼다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/workbench/keyring" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    작업대로 이동
                  </Link>
                  <Link href="/orders" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    바로 주문
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