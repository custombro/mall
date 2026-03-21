import RouteDock from "../_components/RouteDock";
import B2BClient from "./_components/B2BClient";

const b2bSignals = [
  { title: "수량", body: "소량 커스텀과 달리 최소 수량, 묶음 수량, 반복 발주 규모를 먼저 봅니다." },
  { title: "납기", body: "행사일, 오픈일, 제출일처럼 고정 일정이 있는지 먼저 확인합니다." },
  { title: "자재", body: "두께, 판재 확보, 부자재 수급 가능성을 일반 주문보다 먼저 판정합니다." },
];

const b2bRules = [
  "대량 주문 화면은 예쁜 소개 페이지가 아니라 운영 조건을 먼저 읽는 허브여야 합니다.",
  "기관, 행사, 브랜드 주문은 일반 소비자 주문과 분리된 상담 흐름으로 다뤄야 합니다.",
  "같은 디자인 반복 생산 여부를 빨리 판단할 수 있게 텍스트 구조를 정리해야 합니다.",
];

const b2bFlows = [
  { label: "기관/학교", description: "행사 일정, 예산, 납품 방식이 먼저 정리되는 흐름" },
  { label: "브랜드/기업", description: "브랜딩 목적과 반복 납품 가능성이 핵심인 흐름" },
  { label: "행사 대량", description: "짧은 납기와 묶음 생산이 중요한 긴급 운영 흐름" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["대량주문", "벌크", "기관", "납기", "분기"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                대량주문 허브
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                대량 주문 페이지는 수량·납기·자재를 먼저 판정하는 운영 허브여야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                행사, 기관, 브랜드, 반복 거래처 주문을 일반 소비자 흐름과 분리해 운영합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              대량주문 신호
            </p>
            <div className="mt-4 space-y-3">
              {b2bSignals.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              대량주문 규칙
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {b2bRules.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {b2bFlows.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <B2BClient />
        <RouteDock />
      </div>
    </main>
  );
}