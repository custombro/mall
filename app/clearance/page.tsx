import ClearanceClient from "./_components/ClearanceClient";
import { clearanceShelves } from "./_components/clearance-config";

export default function ClearancePage() {
  const totalItems = clearanceShelves.reduce((sum, shelf) => sum + shelf.items.length, 0);
  const fastSaleCount = clearanceShelves
    .flatMap((shelf) => shelf.items)
    .filter((item) => item.status === "즉시판매").length;
  const holdCount = clearanceShelves
    .flatMap((shelf) => shelf.items)
    .filter((item) => item.status === "보류").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.96),rgba(148,163,184,0.18))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["Clearance", "Leftover", "Fast Sale", "Bundle", "Routing"].map((tag) => (
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
                  Clearance Hub
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  재고 정리 탭은 남은 상품을 아무 데나 두는 곳이 아니라,
                  <br className="hidden sm:block" />
                  정규 제작 흐름과 분리해 소진시키는 운영 허브여야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  행사 종료 재고, 샘플 잔량, 테스트 파츠, 보류 자재를 즉시판매·검수후판매·묶음정리·보류로 나눠 정리합니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">정리 대상</div>
                <div className="mt-2 text-3xl font-semibold text-white">{totalItems}</div>
              </div>
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">즉시판매</div>
                <div className="mt-2 text-3xl font-semibold text-emerald-50">{fastSaleCount}</div>
              </div>
              <div className="rounded-3xl border border-violet-300/20 bg-violet-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-violet-100/80">보류</div>
                <div className="mt-2 text-3xl font-semibold text-violet-50">{holdCount}</div>
              </div>
            </div>
          </div>
        </section>

        <ClearanceClient />
      </div>
    </main>
  );
}