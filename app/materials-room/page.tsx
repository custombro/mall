import RouteDock from "../_components/RouteDock";
import MaterialsRoomClient from "./_components/MaterialsRoomClient";

const rackRules = [
  "판재 두께와 재질을 먼저 읽고 다음 작업대로 보내야 합니다.",
  "아크릴 원장은 책상 위 소품처럼 두지 않고 금속 랙 기준으로 분류합니다.",
  "부족 수량보다 먼저 확인할 것은 usable stock, 보호필름 상태, 재단 가능 폭입니다.",
];

const routingFlow = [
  { label: "3T / 키링", description: "기본 키링, 소형 파츠, 가벼운 조합 작업으로 라우팅" },
  { label: "5T / POP", description: "받침대, 스탠드, 구조물 계열 POP 설계로 라우팅" },
  { label: "보류 / 재검수", description: "스크래치, 휨, 보호지 상태 이상은 보류 존으로 이동" },
];

const stockSignals = [
  { title: "두께 기준", body: "2.7T · 3T · 5T처럼 작업 결과에 직접 영향을 주는 두께를 먼저 본다." },
  { title: "재질 기준", body: "투명 / 유색 / 반투명 / 특수판을 분리해서 오작업을 줄인다." },
  { title: "상태 기준", body: "보호필름, 휨, 표면 스크래치 여부를 체크해 usable stock만 다음 단계로 보낸다." },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["Materials", "Metal Rack", "Acrylic", "Routing", "Stock"].map((tag) => (
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
                원자재 보관실
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                원자재 존은 금속 랙 기반으로 다음 작업을 판정하는 공간이어야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                원장 두께, 재질, usable stock 상태를 먼저 읽고 작업대나 운영 공간으로 라우팅합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Rack Rules
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              이 공간은 보기 좋은 진열장이 아니라 판재 판정 허브입니다.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              {rackRules.map((item) => (
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
              Routing Flow
            </p>
            <div className="mt-4 space-y-3">
              {routingFlow.map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-4"
                >
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {stockSignals.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.body}</p>
            </article>
          ))}
        </section>

        <MaterialsRoomClient />
        <RouteDock />
      </div>
    </main>
  );
}