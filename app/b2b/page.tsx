import B2BClient from "./_components/B2BClient";
import { b2bProjects } from "./_components/b2b-config";

export default function B2BPage() {
  const quoteCount = b2bProjects.filter((item) => item.stage === "견적중").length;
  const prepCount = b2bProjects.filter((item) => item.stage === "생산준비").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.96),rgba(16,185,129,0.18))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["B2B", "Bulk", "Institution", "Delivery", "Routing"].map((tag) => (
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
                  B2B Hub
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  대량 주문 페이지는 일반 상품 페이지가 아니라,
                  <br className="hidden sm:block" />
                  수량·납기·자재를 먼저 판정하는 운영 허브여야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  행사, 공공기관, 브랜드, 반복 거래처 주문을 일반 소비자 흐름과 분리해 견적과 생산 준비를 빠르게 판단합니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">전체 프로젝트</div>
                <div className="mt-2 text-3xl font-semibold text-white">{b2bProjects.length}</div>
              </div>
              <div className="rounded-3xl border border-violet-300/20 bg-violet-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-violet-100/80">견적중</div>
                <div className="mt-2 text-3xl font-semibold text-violet-50">{quoteCount}</div>
              </div>
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">생산준비</div>
                <div className="mt-2 text-3xl font-semibold text-emerald-50">{prepCount}</div>
              </div>
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">핵심 개념</div>
                <div className="mt-2 text-xl font-semibold text-cyan-50">수량·납기 판정</div>
              </div>
            </div>
          </div>
        </section>

        <B2BClient />
      </div>
    </main>
  );
}