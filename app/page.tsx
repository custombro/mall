import HomeHubClient from "./_components/HomeHubClient";
import { homeQuickRoutes } from "./_components/home-hub-config";

export default function HomePage() {
  const productionCount = homeQuickRoutes.filter((route) => route.kind === "제작").length;
  const resourceCount = homeQuickRoutes.filter((route) => route.kind === "자재").length;
  const operationsCount = homeQuickRoutes.filter((route) => route.kind === "보관" || route.kind === "판매운영").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
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
                  홈은 모든 기능을 길게 펼치는 화면이 아니라,
                  <br className="hidden sm:block" />
                  지금 필요한 공간으로 보내는 허브여야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  제작, 보관, 자재, 판매운영을 한곳에 다 쌓지 않고 먼저 분기시켜서 구조를 유지하는 홈 허브입니다.
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

        <HomeHubClient />
      </div>
    </main>
  );
}