import Link from "next/link";

const deployMarker = "DEPLOY_KEYRING_WIDE_20260326_002820";

const materialRows = [
  { name: "투명 아크릴 3T", state: "기본" },
  { name: "백색 아크릴 3T", state: "선택" },
  { name: "유백 아크릴 5T", state: "포인트" }
];

const partRows = [
  { name: "D고리", value: "1ea" },
  { name: "타공 위치", value: "상단" },
  { name: "체인 옵션", value: "기본" }
];

const summaryRows = [
  { label: "수량", value: "1ea" },
  { label: "기준가", value: "₩3,900" },
  { label: "저장", value: "서랍 저장 가능" }
];

export default function KeyringWorkbenchPage() {
  return (
    <main className="min-h-screen bg-[#ebe7e1] text-neutral-900">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-4 px-4 py-5 lg:px-6">
        <header className="rounded-[28px] border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                KEYRING WORKBENCH
              </p>
              <h1 className="text-[30px] font-semibold tracking-tight">
                키링 제작은 큰 작업 테이블 기준으로 본다
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm leading-6 text-neutral-600">
                  좌우는 얇게, 중앙은 크게. 실제로 배치하고 확인하기 쉬운 작업형 구조로 다시 넓혔다.
                </p>
                <p className="mt-1 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                  배포 확인 기준: {deployMarker}
                </p>
              </div>
              <Link
                href="/orders"
                className="shrink-0 rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                바로 주문
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)_260px]">
          <aside className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-neutral-900">좌측 · 선택 / 자재</p>
              <div className="mt-3 space-y-2">
                {materialRows.map((item, index) => {
                  const active = index === 0;
                  return (
                    <div
                      key={item.name}
                      className={[
                        "rounded-2xl border px-4 py-3",
                        active ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-[#f7f3ed] text-neutral-900"
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{item.name}</span>
                        <span className={active ? "text-xs text-white/70" : "text-xs text-neutral-500"}>
                          {item.state}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#f7f3ed] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">빠른 선택</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">투명 아크릴 우선</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">백색 대체 선택</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">작업대 즉시 반영</div>
              </div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">중앙 · 제작 테이블</p>
                <p className="mt-1 text-sm text-neutral-600">
                  실제 배치 감각이 살아야 하므로 중앙 작업 테이블을 화면의 주인공으로 키운 상태다.
                </p>
              </div>
              <span className="rounded-full border border-black/10 bg-[#f7f3ed] px-3 py-1 text-xs font-semibold text-neutral-700">
                넓은 작업대
              </span>
            </div>

            <div className="mt-4 rounded-[34px] border border-black/10 bg-[#ede7de] p-5">
              <div className="relative min-h-[760px] overflow-hidden rounded-[30px] border border-black/10 bg-[#f7f3ed]">
                <div className="absolute inset-x-[4%] top-[5%] h-10 rounded-full border border-dashed border-black/10 bg-white/70" />
                <div className="absolute inset-x-[2.5%] bottom-[5.5%] h-[46%] rounded-[46px] border border-black/10 bg-white shadow-[0_18px_30px_rgba(0,0,0,0.05)]" />
                <div className="absolute left-[5%] top-[10%] bottom-[12%] w-[21%] rounded-[28px] border border-dashed border-black/10 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">자재 존</p>
                  <div className="mt-6 flex h-[58%] items-center justify-center rounded-[22px] border border-dashed border-black/10 bg-[#faf8f4] text-lg font-semibold text-neutral-700">
                    투명 아크릴 3T
                  </div>
                </div>

                <div className="absolute left-[29%] top-[12%] right-[23%] bottom-[17%] rounded-[34px] border border-black/10 bg-white shadow-sm">
                  <div className="absolute left-[10%] top-[14%] h-12 w-12 rounded-full border border-black/15 bg-[#f8f4ec]" />
                  <div className="absolute left-[22%] top-[40%] h-28 w-28 rounded-full bg-neutral-900" />
                  <div className="absolute left-[38%] top-[40%] h-24 w-24 rounded-full bg-neutral-900" />
                  <div className="absolute left-[52%] top-[38%] h-30 w-30 rounded-full bg-neutral-900" />
                  <div className="absolute inset-x-0 bottom-[10%] text-center text-[36px] font-semibold tracking-tight text-neutral-800">
                    키링
                  </div>
                </div>

                <div className="absolute right-[5%] top-[14%] bottom-[24%] w-[17%] rounded-[28px] border border-dashed border-black/10 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">부자재 존</p>
                  <div className="mt-6 flex h-[42%] items-center justify-center rounded-[22px] border border-dashed border-black/10 bg-[#faf8f4] text-lg font-semibold text-neutral-700">
                    D고리 / 1ea
                  </div>
                </div>

                <div className="absolute inset-x-[8%] bottom-[2.8%] flex flex-wrap items-center gap-2">
                  <Link href="/materials-room" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                    자재실 보기
                  </Link>
                  <Link href="/parts-room" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                    부자재실 보기
                  </Link>
                  <Link href="/storage" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                    서랍 열기
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">우측 · 수량 / 가격 / 저장 / 주문</p>
                <p className="mt-1 text-sm text-neutral-600">
                  우측은 마지막 판단만 남겨 저장과 주문 흐름을 짧게 유지한다.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ed] p-4">
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
                    <div className="mt-1 text-[34px] font-semibold tracking-tight">₩3,900</div>
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
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f7f3ed] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
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
                      <span className="font-medium text-neutral-900">{item.value}</span>
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