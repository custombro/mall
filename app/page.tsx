import Link from "next/link";

const entries = [
  {
    href: "/workbench/keyring",
    eyebrow: "Workbench",
    title: "제작",
    description: "키링 편집과 작업대 진입. 제작 시작점을 여기로 고정합니다.",
    cta: "제작 시작",
  },
  {
    href: "/storage",
    eyebrow: "Drawer",
    title: "서랍",
    description: "보관함, 재주문, 저장 디자인 확인. 작업 결과물을 쌓아두는 영역입니다.",
    cta: "서랍 열기",
  },
  {
    href: "/orders",
    eyebrow: "Orders",
    title: "주문",
    description: "주문 생성/정리의 진입점. 생산 흐름으로 넘기는 허브 역할입니다.",
    cta: "주문 보기",
  },
  {
    href: "/order-check",
    eyebrow: "Tracking",
    title: "주문확인",
    description: "주문번호 기반 확인과 상태 추적 진입점입니다.",
    cta: "상태 확인",
  },
  {
    href: "/my",
    eyebrow: "Account",
    title: "내정보",
    description: "내 작업, 계정, 저장된 선호 정보를 다루는 개인 허브입니다.",
    cta: "내 정보",
  },
] as const;

const flow = [
  "손님이 홈에서 제작/서랍/주문으로 진입",
  "디자인 저장 후 주문 데이터 생성",
  "주문 메타가 생산 큐로 이동",
  "생산 데이터 정리 후 출력/제작 단계로 연결",
] as const;

const rules = [
  "홈은 긴 스크롤 판매 페이지가 아니라 허브형 진입 화면",
  "주요 기능은 각각 독립 페이지로 분리",
  "제작과 서랍이 가장 앞에 보이도록 배치",
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 shadow-2xl">
          <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-zinc-400">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                CB Mall
              </span>
              <span>Home Hub</span>
              <span>GitHub-first</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  홈은 소개 페이지가 아니라
                  <br />
                  작업 허브여야 한다.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
                  CB Mall의 첫 화면을 긴 스크롤 쇼핑 페이지가 아니라, 제작/서랍/주문/주문확인/내정보로
                  즉시 진입하는 허브형 구조로 정리했습니다. 손님은 홈에서 방향을 정하고, 실제 작업은 각
                  페이지에서 수행합니다.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/workbench/keyring"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5"
                  >
                    키링 제작 시작
                  </Link>
                  <Link
                    href="/storage"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    서랍 바로가기
                  </Link>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Production Flow
                </p>
                <ol className="mt-4 space-y-3">
                  {flow.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-zinc-950">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-zinc-300">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-5">
          {entries.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group rounded-[24px] border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.08]"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                    {entry.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{entry.title}</h2>
                </div>
                <p className="min-h-[72px] text-sm leading-6 text-zinc-300">{entry.description}</p>
                <div className="inline-flex items-center rounded-full border border-white/15 px-3 py-2 text-sm font-medium text-zinc-200 transition group-hover:border-cyan-300/40 group-hover:text-cyan-100">
                  {entry.cta}
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Hub Rules
            </p>
            <div className="mt-4 grid gap-3">
              {rules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-zinc-300"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Immediate Routes
            </p>
            <div className="mt-4 grid gap-3">
              {entries.map((entry) => (
                <div
                  key={entry.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.title}</p>
                    <p className="text-xs text-zinc-400">{entry.href}</p>
                  </div>
                  <Link
                    href={entry.href}
                    className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-100"
                  >
                    이동
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}