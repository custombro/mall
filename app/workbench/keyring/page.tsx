import Link from "next/link";

const deployMarker = "DEPLOY_KEYRING_20260326_001551";

const materialRows = [
  { name: "투명 아크릴 3T", qty: "기본" },
  { name: "백색 아크릴 3T", qty: "선택" },
  { name: "유백 아크릴 5T", qty: "포인트" }
];

const partRows = [
  { name: "D고리", qty: "1ea" },
  { name: "타공 위치", qty: "상단" },
  { name: "체인 옵션", qty: "기본" }
];

const processCards = [
  {
    title: "1. 파일과 형태",
    badge: "형태",
    bullets: ["이미지 업로드", "기본 컷라인 확인", "작업대 중심 배치"]
  },
  {
    title: "2. 자재와 부자재",
    badge: "선택",
    bullets: ["좌측 자재 선택", "우측 부자재 확인", "불필요한 설명 제거"]
  },
  {
    title: "3. 저장과 주문",
    badge: "CTA",
    bullets: ["서랍 저장", "바로 주문", "주문확인 연결"]
  }
];

const summaryRows = [
  { label: "수량", value: "1ea" },
  { label: "기준가", value: "₩3,900" },
  { label: "저장", value: "서랍 저장 가능" }
];

export default function KeyringWorkbenchPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-neutral-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                KEYRING WORKBENCH
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                키링 제작은 작업 테이블 기준으로 더 짧게
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                좌측에서 자재를 고르고, 중앙 작업 테이블에서 확인하고, 우측에서 저장·주문만 결정하는 단순한 구조다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                배포 확인 기준: {deployMarker}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 자재</p>
            <div className="mt-3 space-y-2">
              {materialRows.map((item, index) => {
                const active = index === 0;
                return (
                  <div
                    key={item.name}
                    className={[
                      "rounded-2xl border px-4 py-3",
                      active ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-[#f8f4ec] text-neutral-900"
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{item.name}</span>
                      <span className={active ? "text-xs text-white/70" : "text-xs text-neutral-500"}>{item.qty}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-[#f8f4ec] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">좌측 빠른 선택</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">투명 아크릴 우선</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">백색 대체 선택</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">작업대 즉시 반영</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {processCards.map((card) => (
                  <article key={card.title} className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight">{card.title}</p>
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

            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">중앙 · 제작 테이블</p>
                  <p className="mt-1 text-sm text-neutral-600">작업대 위에서 소재 · 키링 본체 · 부자재 위치만 바로 보이게 정리했다.</p>
                </div>
                <span className="rounded-full border border-black/10 bg-[#f8f4ec] px-3 py-1 text-xs font-semibold text-neutral-700">
                  작업 테이블 기준
                </span>
              </div>

              <div className="mt-4 rounded-[28px] border border-black/10 bg-[#f4efe7] p-5">
                <div className="rounded-[24px] border border-black/10 bg-white p-5">
                  <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_180px]">
                    <div className="rounded-2xl bg-[#f8f4ec] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">자재</p>
                      <div className="mt-3 rounded-xl border border-dashed border-black/15 bg-white px-3 py-8 text-center text-sm text-neutral-700">
                        투명 아크릴 3T
                      </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-black/15 bg-[#fcfbf8] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">키링 본체</p>
                      <div className="mt-4 flex min-h-[210px] items-center justify-center rounded-[24px] bg-white">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-8 w-8 rounded-full border border-black/15 bg-[#f8f4ec]" />
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded-full bg-neutral-900" />
                            <div className="h-12 w-12 rounded-full bg-neutral-900" />
                            <div className="h-14 w-14 rounded-full bg-neutral-900" />
                          </div>
                          <div className="text-lg font-semibold tracking-tight text-neutral-800">키링</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f8f4ec] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">부자재</p>
                      <div className="mt-3 rounded-xl border border-dashed border-black/15 bg-white px-3 py-8 text-center text-sm text-neutral-700">
                        D고리 / 1ea
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/materials-room" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  자재실 보기
                </Link>
                <Link href="/parts-room" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  부자재실 보기
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
                <p className="text-sm font-semibold text-neutral-900">우측 · 수량 / 가격 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  우측에는 마지막 판단만 남겨서 저장과 주문 흐름을 더 짧게 만들었다.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f4ec] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">현재 선택</div>
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
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">작업 가격</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">₩3,900</div>
                  </div>
                  <div className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                    기본
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link href="/orders" className="flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    바로 주문
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    서랍 저장
                  </Link>
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    주문확인
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">부자재</p>
                <div className="mt-3 space-y-2">
                  {partRows.map((item) => (
                    <div key={item.name} className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                      <span className="text-neutral-700">{item.name}</span>
                      <span className="font-medium text-neutral-900">{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}