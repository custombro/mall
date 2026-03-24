import RouteDock from "../_components/RouteDock";
import ModeSelectClient from "./_components/ModeSelectClient";


const modeFlows = [
  { title: "제작 모드", body: "작업대 중심으로 프리셋, 파츠 조합, 수량 판단을 진행하는 흐름" },
  { title: "운영 모드", body: "원자재 보관실, 부자재 보관실, 서랍처럼 생산 지원 판단을 진행하는 흐름" },
  { title: "판매 모드", body: "옵션, 크루 판매, 대량주문, 재고정리처럼 판매 운영으로 이어지는 흐름" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
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

            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-200/60">제작</p>
              <h1 className="text-lg font-medium leading-tight text-white sm:text-xl">
                모드 선택
              </h1>
              </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
    제작 선택 흐름
  </p>
  <div className="mt-4 grid gap-3 md:grid-cols-3">
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
</section>

        <ModeSelectClient />
        <RouteDock />
      </div>
    </main>
  );
}