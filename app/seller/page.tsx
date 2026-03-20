import SellerCenterClient from "./_components/SellerCenterClient";
import { sellerProducts, sellerPrograms } from "./_components/seller-config";

export default function SellerPage() {
  const activeCount = sellerProducts.filter((product) => product.status === "판매중").length;
  const reviewCount = sellerProducts.filter((product) => product.status === "검수필요").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.96),rgba(99,102,241,0.18))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["Seller", "Crew", "Settlement", "Reorder", "Routing"].map((tag) => (
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
                  Seller Center
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  판매자 센터는 단순 목록이 아니라,
                  <br className="hidden sm:block" />
                  크루 판매 구조를 단계별로 운영하는 허브여야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  입문, 운영, 확장 셀러 구조를 분리하고 판매 상품, 리오더, 정산 감각, 검수 흐름을 한곳에서 판단합니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">프로그램 수</div>
                <div className="mt-2 text-3xl font-semibold text-white">{sellerPrograms.length}</div>
              </div>
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">판매중</div>
                <div className="mt-2 text-3xl font-semibold text-emerald-50">{activeCount}</div>
              </div>
              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-amber-100/80">검수 필요</div>
                <div className="mt-2 text-3xl font-semibold text-amber-50">{reviewCount}</div>
              </div>
            </div>
          </div>
        </section>

        <SellerCenterClient />
      </div>
    </main>
  );
}