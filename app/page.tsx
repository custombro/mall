import RouteDock from "./_components/RouteDock";
import HomeHubClient from "./_components/HomeHubClient";

const homePrinciples = [
  "홈은 모든 기능을 길게 늘어놓는 페이지가 아니라 고객과 운영자가 지금 들어가야 할 공간을 즉시 고르게 만드는 허브여야 합니다.",
  "고객은 빠르게 제작을 시작하고, 관리자는 주문·보관·출고·운영 판단을 한눈에 잡을 수 있어야 합니다.",
  "첫 화면은 설명보다 다음 행동이 먼저 보여야 하며, 공간 역할이 섞이면 안 됩니다.",
];

const customerRoutes = [
  {
    title: "제작 바로 시작",
    body: "키링, POP처럼 원하는 상품군을 고른 뒤 바로 작업대로 들어가는 흐름입니다.",
    points: ["설명보다 시작이 먼저 보입니다.", "불필요한 선택을 줄여 진입 속도를 높입니다.", "저장과 주문 전환까지 흐름이 짧아집니다."],
  },
  {
    title: "옵션 빠른 이해",
    body: "두께, 인쇄면, 파츠, 수량처럼 실제로 고민하는 항목만 먼저 이해하게 합니다.",
    points: ["복잡한 사양 나열을 줄입니다.", "조합 판단이 쉬워집니다.", "처음 들어온 손님도 덜 헤맵니다."],
  },
  {
    title: "재주문 연결",
    body: "이전에 만들었던 작업물이나 보관 데이터로 다시 이어질 수 있는 흐름입니다.",
    points: ["같은 디자인 재주문이 빨라집니다.", "보관함과 주문 경험이 연결됩니다.", "반복 고객 경험이 매끄러워집니다."],
  },
];

const adminRoutes = [
  {
    title: "운영 우선순위 파악",
    body: "주문, 보관, 출고, 정리판매 중 지금 바로 처리할 운영 흐름을 빠르게 고르는 구조입니다.",
    points: ["관리자가 다음 액션을 즉시 잡습니다.", "운영 화면 진입 동선이 짧아집니다.", "중요 작업이 첫 화면에서 분기됩니다."],
  },
  {
    title: "보관 / 리오더 허브",
    body: "서랍, 보관, 재호출 흐름을 단순 저장이 아니라 다음 주문과 생산으로 다시 연결합니다.",
    points: ["재주문 대응 속도가 올라갑니다.", "보관 목적보다 다음 액션이 보입니다.", "회수와 재진입 동선이 쉬워집니다."],
  },
  {
    title: "판매 운영 분리",
    body: "옵션 운영, 셀러 운영, 대량주문, 재고정리 같은 판매 운영 흐름을 홈에서 분기합니다.",
    points: ["고객용 화면과 운영용 화면을 덜 섞습니다.", "관리 포인트가 더 선명해집니다.", "운영자가 필요한 공간을 바로 찾습니다."],
  },
];

const routeGroups = [
  {
    title: "고객 제작 공간",
    body: "손님이 바로 제작을 시작하고 저장·주문으로 이어지는 흐름입니다.",
  },
  {
    title: "보관 / 재호출 공간",
    body: "완료품 보관, 리오더, 검수 재진입, 출고 직전 흐름을 연결하는 운영 공간입니다.",
  },
  {
    title: "판매 / 관리자 공간",
    body: "옵션 관리, 셀러 운영, 대량 주문 대응, 재고 정리를 처리하는 관리자 허브입니다.",
  },
];

const hubSignals = [
  { label: "고객 진입 단순화", description: "처음 온 손님도 어디서 시작해야 하는지 바로 이해해야 합니다." },
  { label: "운영 분기 명확화", description: "관리자는 주문·보관·판매 운영의 우선순위를 첫 화면에서 잡아야 합니다." },
  { label: "재주문 연결", description: "한 번 만든 작업물이 다음 주문과 보관 흐름으로 자연스럽게 이어져야 합니다." },
  { label: "공간 역할 분리", description: "홈, 제작, 보관, 판매 운영이 각자 다른 책임을 가져야 인터페이스가 깔끔해집니다." },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(15,23,42,0.96),rgba(99,102,241,0.18))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["홈 허브", "고객 진입", "운영 허브", "재주문", "깔끔한 IA"].map((tag) => (
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
                고객은 더 빠르게 시작하고, 관리자는 더 쉽게 운영을 잡는 홈 허브
              </h1>
              <p className="max-w-4xl text-base leading-7 text-slate-200 sm:text-lg">
                홈은 모든 기능을 한 화면에 늘어놓지 않고, 고객용 제작 진입과 관리자용 운영 분기를 먼저 보여주는
                선택 허브로 유지합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
          <div className="rounded-[1.75rem] border border-cyan-400/20 bg-cyan-500/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                  고객 입장
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">복잡한 설명보다 빠른 시작</h2>
              </div>
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                Customer
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {customerRoutes.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                    {item.points.map((point) => (
                      <li key={point} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-violet-400/20 bg-violet-500/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/80">
                  관리자 입장
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">운영 판단이 바로 보이는 구조</h2>
              </div>
              <span className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs font-medium text-violet-100">
                Admin
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {adminRoutes.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                    {item.points.map((point) => (
                      <li key={point} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.02fr,0.98fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              허브 원칙
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {homePrinciples.map((item) => (
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
              공간 분기
            </p>
            <div className="mt-4 space-y-3">
              {routeGroups.map((item) => (
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {hubSignals.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <HomeHubClient />
        <RouteDock />
      </div>
    </main>
  );
}