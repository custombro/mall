import RouteDock from "./_components/RouteDock";
import HomeHubClient from "./_components/HomeHubClient";

const homePrinciples = [
  "홈은 모든 기능을 길게 나열하는 페이지가 아니라 지금 들어가야 할 공간을 빠르게 정하는 허브여야 합니다.",
  "제작, 자재, 보관, 판매운영을 한 화면에 다 섞지 말고 각 공간으로 분기시키는 역할만 담당해야 합니다.",
  "첫 화면에서 어디로 가야 하는지 3초 안에 이해되지 않으면 홈 구조가 실패한 것입니다.",
];

const homeRoutes = [
  { title: "작업대로 이동", body: "키링, POP, 조합 작업처럼 실제 제작 판단이 필요한 흐름으로 보냅니다." },
  { title: "운영 공간으로 이동", body: "원자재실, 부자재실, 보관함처럼 생산 운영 판단이 필요한 공간으로 보냅니다." },
  { title: "판매 공간으로 이동", body: "옵션, 셀러, 대량주문, 재고정리처럼 판매 운영 흐름으로 분기합니다." },
];

const homeSignals = [
  { label: "허브 역할", description: "소개보다 진입 결정이 먼저 보여야 합니다." },
  { label: "과밀 방지", description: "기능을 한 화면에 늘어뜨리지 않고 진입만 남깁니다." },
  { label: "Split IA", description: "공간별 역할이 분리되어야 다음 화면이 이해됩니다." },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["Home", "Mode", "Split IA", "Workbench", "Sales"].map((tag) => (
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
                CB Mall Home Hub
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                홈은 지금 필요한 공간으로 보내는 허브여야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                홈은 모든 기능을 길게 늘어뜨리지 않고, 모드 선택과 핵심 공간 진입만 담당하도록 유지합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Hub Principles
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {homePrinciples.map((item) => (
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
              Primary Routes
            </p>
            <div className="mt-4 space-y-3">
              {homeRoutes.map((item) => (
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
          {homeSignals.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <HomeHubClient />
        <RouteDock />
      </div>
    </main>
  );
}