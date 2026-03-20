import RouteDock from "../_components/RouteDock";
import PartsRoomClient from "./_components/PartsRoomClient";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["Parts", "Ring", "Chain", "Stand", "Routing"].map((tag) => (
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
                Parts Room
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                부자재 존은 조합을 판정하는 벽면 허브여야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                링, 체인, 스탠드, 자석, 보조파츠를 분리해서 작업 전 조합 판단에 집중합니다.
              </p>
            </div>
          </div>
        </section>

        <PartsRoomClient />
        <RouteDock />
      </div>
    </main>
  );
}