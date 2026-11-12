import Link from "next/link";

const homeGroups = [
  { name: "진열대 제작 상담", hint: "제품 크기와 필요한 수량으로 시작" },
  { name: "키링 디자인", hint: "작업 도구에서 직접 디자인" },
  { name: "추가 제작 상담", hint: "기존 디자인과 변경 사항 전달" },
  { name: "소재와 인쇄", hint: "브랜드에 어울리는 마감 선택" }
];

const startCards = [
  {
    title: "진열대 제작 상담",
    badge: "추천",
    summary: "앰플 한 병부터 제품 라인업까지, 원하는 구성과 제품 정보를 알려주세요.",
    bullets: ["제품 몸체의 크기와 높이", "동일 디자인별 필요한 수량", "소재·인쇄·희망 사용일"]
  },
  {
    title: "직접 디자인하기",
    badge: "작업",
    summary: "키링 작업 도구에서 이미지와 글자를 배치하며 원하는 디자인을 만들어보세요.",
    bullets: ["이미지와 글자 배치", "제품에 맞는 디자인 구상", "제작 상담을 위한 시안 준비"]
  },
  {
    title: "추가 제작과 변경",
    badge: "상담",
    summary: "기존 진열대를 다시 만들거나 그래픽을 바꾸고 싶다면 상담에서 변경 내용을 알려주세요.",
    bullets: ["기존 주문번호 또는 디자인명", "바꾸고 싶은 이미지와 문구", "추가로 필요한 제작 수량"]
  }
];

const summaryRows = [
  { label: "제품", value: "크기·모양·진열 개수" },
  { label: "수량", value: "동일 디자인별 제작 수량" },
  { label: "사용처", value: "매장·박람회·팝업" }
];

export default function HomePage() {
  return (
    <main className="cb-shell-page">
      <div className="cb-shell-content">
        <Link href="/display" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#bfcdb4] bg-[#e8efdf] px-6 py-5 text-[#304c36]">
          <span><strong className="block text-lg">화장품 미니 진열대 맞춤 제작</strong><span className="mt-1 block text-sm">한 병부터 박람회·팝업까지. 제품 크기와 수량으로 제작 상담을 시작하세요.</span></span>
          <span className="rounded-full bg-[#42634b] px-5 py-3 text-sm font-semibold text-white">제작 상담하기 →</span>
        </Link>
        <header className="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                CUSTOMBRO MALL
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                제품에 맞추고, 브랜드를 담습니다.
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-neutral-600">
                진열대와 판촉물을 위한 커스텀브로 제작 상담. 제품 크기와 필요한 수량을 알려주시면 소재와 구성을 검토합니다.
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-neutral-500">
                상담 후 제작 사양·최종 견적·일정을 확인합니다.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-900">어떤 작업이 필요한가요?</p>
            <div className="mt-3 space-y-2">
              {homeGroups.map((item, index) => {
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">상담 전에 준비해 주세요</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">제품의 실제 크기</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">브랜드 이미지와 문구</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">수량과 희망 사용일</div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-3">
                {startCards.map((card) => (
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
              <p className="text-sm font-semibold text-neutral-900">작업 도구와 이용 안내</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/workbench/keyring" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  키링 작업 시작
                </Link>
                <Link href="/storage" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  저장 안내
                </Link>
                <Link href="/orders" className="rounded-full border border-black/10 bg-[#f8f4ec] px-4 py-2 text-sm font-medium text-neutral-900 hover:border-black/20">
                  주문 안내 · 준비 중
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="sticky top-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">제작 상담부터 시작하세요</p>
                <p className="mt-1 text-sm text-neutral-600">
                  도면이 없어도 제품 정보와 원하는 모습을 알려주세요. 필요한 사양을 상담에서 함께 확인합니다.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f4ec] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">알려주시면 좋은 정보</div>
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
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">CUSTOM DISPLAY</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">우리 제품만의 진열대</div>
                <div className="mt-1 text-sm text-neutral-600">상담 접수는 결제나 제작 확정이 아닙니다. 사양을 확인한 뒤 견적을 안내합니다.</div>

                <div className="mt-4 space-y-2">
                  <Link href="/display" className="flex w-full items-center justify-center rounded-2xl bg-[#42634b] px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                    진열대 제작 상담하기
                  </Link>
                  <Link href="/workbench/keyring" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    키링 작업 시작
                  </Link>
                  <Link href="/storage" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    저장 안내 보기
                  </Link>
                  <Link href="/order-check" className="flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[#f8f4ec] px-4 py-3 text-sm font-semibold text-neutral-900 hover:border-black/20">
                    주문 조회 안내 · 준비 중
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
