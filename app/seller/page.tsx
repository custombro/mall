import RouteDock from "../_components/RouteDock";
import SellerCenterClient from "./_components/SellerCenterClient";

const sellerTiers = [
  { title: "입문 크루", body: "소수 SKU와 단순 재주문 중심으로 시작하는 판매 흐름" },
  { title: "운영 크루", body: "주문량 증가에 맞춰 옵션, 포장, 리오더를 함께 관리하는 흐름" },
  { title: "확장 크루", body: "크루 단위 판매와 반복 거래를 운영하는 상위 판매 흐름" },
];

const sellerRules = [
  "크루 판매 허브는 고객용 쇼핑 화면이 아니라 운영/정산/리오더를 함께 보는 허브여야 합니다.",
  "판매 상태, 제작 상태, 정산 상태를 섞지 말고 단계별로 분리해서 보여줘야 합니다.",
  "크루 판매 구조는 누가 판매했고 누가 제작으로 넘겼는지 흐름이 보여야 합니다.",
];

const sellerChecks = [
  { label: "상품 운영", description: "어떤 상품이 판매 중인지, 보류인지, 재정비 중인지 바로 확인" },
  { label: "정산 흐름", description: "판매 발생 후 정산 대기와 지급 완료를 운영 화면에서 구분" },
  { label: "리오더 연결", description: "같은 디자인 재판매를 빠르게 다시 태울 수 있게 연결" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["크루 판매", "크루", "정산", "리오더", "분기"].map((tag) => (
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
                크루 판매
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                크루 판매 허브는 판매 구조를 단계별로 운영하는 허브여야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                입문, 운영, 확장 크루 흐름과 판매 상품 상태를 한곳에서 판단하도록 유지합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              크루 판매 단계
            </p>
            <div className="mt-4 space-y-3">
              {sellerTiers.map((item) => (
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
              크루 판매 규칙
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {sellerRules.map((item) => (
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
          {sellerChecks.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <SellerCenterClient />
        <RouteDock />
      </div>
    </main>
  );
}