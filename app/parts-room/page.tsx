import RouteDock from "../_components/RouteDock";
import PartsRoomClient from "./_components/PartsRoomClient";

const partGroups = [
  { title: "링 계열", body: "D링, O링, 키링 고리는 결합 방식과 강도를 기준으로 분리합니다." },
  { title: "체인 계열", body: "짧은 체인, 볼체인, 연결부품은 움직임과 길이를 기준으로 나눕니다." },
  { title: "스탠드 계열", body: "받침, 꽂이, 자석, 보조파츠는 구조물 조합 여부를 먼저 판정합니다." },
];

const routingRules = [
  "부자재는 예쁜 소품 배열이 아니라 조합 실수를 막는 조합 벽이어야 합니다.",
  "작업 전 고객 옵션과 실제 결합 가능 범위를 같은 화면 안에서 읽을 수 있어야 합니다.",
  "고리 · 체인 · 스탠드 · 자석 · 포장 부품을 섞어 부르지 말고 명칭을 고정해야 합니다.",
];

const comboChecks = [
  { label: "키링 조합", description: "링 규격, 체인 길이, 타공 위치가 맞는지 먼저 확인" },
  { label: "POP 조합", description: "받침, 홈, 끼움 구조, 자석 보강 파츠를 함께 판정" },
  { label: "포장 조합", description: "OPP, 백카드, 보호재가 출고 형태와 맞는지 확인" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["부자재", "링", "체인", "스탠드", "분기"].map((tag) => (
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
                부자재 보관실
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                부자재 존은 조합을 판정하는 벽면 허브여야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                링, 체인, 스탠드, 자석, 포장 보조파츠를 분리해서 작업 전 조합 판단에 집중합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Grouping
            </p>
            <div className="mt-4 space-y-3">
              {partGroups.map((item) => (
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
              분기 규칙
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {routingRules.map((item) => (
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
          {comboChecks.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <PartsRoomClient />
        <RouteDock />
      </div>
    </main>
  );
}