import RouteDock from "../../_components/RouteDock";
import KeyringWorkbenchClient from "./_components/KeyringWorkbenchClient";

const benchRules = [
  "키링 작업대는 단순 상품 소개가 아니라 실제 조합 판단을 내리는 작업 허브여야 합니다.",
  "두께, 인쇄면, 고리, 후가공, 수량을 따로 보지 말고 한 작업 흐름 안에서 연결해야 합니다.",
  "작업대는 레고/테트리스처럼 파츠를 조합하는 감각으로 읽혀야 하며, 제작 전 판단이 먼저 보여야 합니다.",
];

const benchFlow = [
  { title: "본체 결정", body: "아크릴 두께, 크기, 인쇄면, 기본 구조를 먼저 고정하는 단계" },
  { title: "파츠 조합", body: "링, 체인, 자석, 추가 파츠처럼 결합 요소를 붙여보는 단계" },
  { title: "생산 판단", body: "수량, 후가공, 단가, 납기 영향을 함께 읽고 다음 단계로 넘기는 단계" },
];

const benchSignals = [
  { label: "프리셋", description: "빠르게 시작하되 최종 판단은 작업대에서 이뤄져야 합니다." },
  { label: "조합 우선", description: "옵션 나열보다 어떤 부품이 맞는지 먼저 판단해야 합니다." },
  { label: "생산 연결", description: "보여주기용 화면이 아니라 실제 제작 흐름으로 이어져야 합니다." },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["Keyring", "Workbench", "Preset", "Estimate", "Flow"].map((tag) => (
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
                Keyring Workbench
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                키링 제작은 작업대에서 실제 조합을 판단하는 흐름이어야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                프리셋, 두께, 인쇄면, 링, 후가공, 수량을 작업대 맥락에서 조합해 제작 흐름을 다룹니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Bench Rules
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {benchRules.map((item) => (
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
              Bench Flow
            </p>
            <div className="mt-4 space-y-3">
              {benchFlow.map((item) => (
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
          {benchSignals.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <KeyringWorkbenchClient />
        <RouteDock />
      </div>
    </main>
  );
}