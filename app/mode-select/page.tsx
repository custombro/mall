import RouteDock from "../_components/RouteDock";
import ModeSelectClient from "./_components/ModeSelectClient";

const modeRules = [
  "지금 할 작업으로 바로 이동합니다.",
];

const modeFlows = [
  { title: "제작 모드", body: "작업대 중심으로 프리셋, 파츠 조합, 수량 판단을 진행하는 흐름" },
  { title: "운영 모드", body: "원자재 보관실, 부자재 보관실, 서랍처럼 생산 지원 판단을 진행하는 흐름" },
  { title: "판매 모드", body: "옵션, 크루 판매, 대량주문, 재고정리처럼 판매 운영으로 이어지는 흐름" },
];

const modeChecks = [
  { label: "진입 명확성", description: "사용자가 어떤 공간에 들어가는지 바로 알아야 합니다." },
  { label: "동선 분리", description: "작업과 운영과 판매가 문구 단계에서 먼저 분리되어야 합니다." },
  { label: "다음 행동", description: "각 카드가 다음 페이지의 역할을 미리 설명해야 합니다." },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["제작 선택", "허브", "작업대", "서랍", "판매"].map((tag) => (
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
                제작 선택
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                지금 할 작업으로 바로 이동합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                필요한 흐름으로 바로 들어갑니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              제작 선택 규칙
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {modeRules.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              제작 선택 흐름
            </p>
            <div className="mt-4 space-y-3">
              {modeFlows.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-4"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {modeChecks.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <ModeSelectClient />
        <RouteDock />
      </div>
    </main>
  );
}