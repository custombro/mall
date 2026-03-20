import ModeSelectClient from "./_components/ModeSelectClient";
import { modeRouteCards } from "./_components/mode-select-config";

export default function ModeSelectPage() {
  const productionCount = modeRouteCards.filter((card) => card.category === "제작").length;
  const resourceCount = modeRouteCards.filter((card) => card.category === "자재").length;
  const operationsCount = modeRouteCards.filter((card) => card.category === "보관" || card.category === "판매운영").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["Mode", "Hub", "Workbench", "Storage", "Sales"].map((tag) => (
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
                  Mode Select
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  모드 선택은 긴 설명 페이지가 아니라,
                  <br className="hidden sm:block" />
                  지금 해야 할 공간으로 바로 보내는 분기 허브여야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  제작, 보관, 자재, 판매운영을 분리해서 현재 업무에 맞는 공간으로 진입시키는 CB Mall 허브 페이지입니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">제작</div>
                <div className="mt-2 text-3xl font-semibold text-cyan-50">{productionCount}</div>
              </div>
              <div className="rounded-3xl border border-violet-300/20 bg-violet-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-violet-100/80">자재</div>
                <div className="mt-2 text-3xl font-semibold text-violet-50">{resourceCount}</div>
              </div>
              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-amber-100/80">보관/운영</div>
                <div className="mt-2 text-3xl font-semibold text-amber-50">{operationsCount}</div>
              </div>
            </div>
          </div>
        </section>

        <ModeSelectClient />
      </div>
    </main>
  );
}