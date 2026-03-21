import RouteDock from "../_components/RouteDock";
import OptionStoreClient from "./_components/OptionStoreClient";

const optionRules = [
  "옵션은 본체 설계와 섞지 말고 결합/포장/후가공 판단을 분리해서 읽어야 합니다.",
  "고객이 고르는 항목과 작업자가 확인할 생산 조건을 같은 구조 안에서 맞춰야 합니다.",
  "추가금이 붙는 프리미엄 옵션은 보기용 장식이 아니라 실제 공정 차이로 설명되어야 합니다.",
];

const optionFlows = [
  { title: "결합 옵션", body: "고리, 체인, 자석, 받침처럼 본체와 연결되는 부품 흐름" },
  { title: "포장 옵션", body: "OPP, 백카드, 보호재, 선물 포장처럼 출고 형태를 바꾸는 흐름" },
  { title: "후가공 옵션", body: "에폭시, 추가 인쇄, 특수 마감처럼 생산 조건을 바꾸는 흐름" },
];

const optionSignals = [
  { label: "기본 포함", description: "본체 가격 안에 들어가는 항목과 별도 옵션을 명확히 분리" },
  { label: "추가금 발생", description: "고객 선택 순간 비용이 올라가는 항목을 분명히 표기" },
  { label: "제작 영향", description: "납기, 자재, 결합 난이도에 영향을 주는 옵션을 먼저 경고" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["Option", "Addon", "Package", "Premium", "Routing"].map((tag) => (
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
                옵션 보관소
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                옵션은 본체와 분리된 별도 스토어에서 판단해야 구조가 깔끔해집니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                후가공, 포장, 결합, 전시, 프리미엄 옵션을 작업 본체와 분리해 선택합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              옵션 규칙
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {optionRules.map((item) => (
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
              옵션 흐름
            </p>
            <div className="mt-4 space-y-3">
              {optionFlows.map((item) => (
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
          {optionSignals.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <OptionStoreClient />
        <RouteDock />
      </div>
    </main>
  );
}