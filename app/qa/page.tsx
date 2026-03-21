import Link from "next/link";
import RouteDock from "../_components/RouteDock";

const qaBuckets = [
  {
    title: "허브",
    intent: "진입 결정",
    items: [
      { href: "/", label: "홈", pass: "첫 화면에서 길게 읽지 않아도 어디로 갈지 바로 보인다." },
      { href: "/mode-select", label: "모드 선택", pass: "제작 · 운영 · 판매 분기가 역할별로 즉시 읽힌다." },
    ],
  },
  {
    title: "제작",
    intent: "작업 판단",
    items: [
      { href: "/workbench/keyring", label: "키링 작업대", pass: "본체 결정 → 파츠 조합 → 생산 판단 순서가 읽힌다." },
      { href: "/pop-studio", label: "POP 스튜디오", pass: "구조물 계열 POP 흐름이 키링과 섞이지 않는다." },
    ],
  },
  {
    title: "운영",
    intent: "생산 지원",
    items: [
      { href: "/materials-room", label: "원자재실", pass: "금속 랙 · 판재 두께 · usable stock 의미가 먼저 보인다." },
      { href: "/parts-room", label: "부자재실", pass: "링 · 체인 · 포장 파츠가 기능별로 분리되어 읽힌다." },
      { href: "/storage", label: "서랍", pass: "제작 완료 → 보관 → 재호출/리오더 흐름이 보인다." },
    ],
  },
  {
    title: "판매",
    intent: "운영 분리",
    items: [
      { href: "/option-store", label: "옵션 스토어", pass: "결합 · 포장 · 후가공 옵션이 본체와 분리되어 보인다." },
      { href: "/seller", label: "크루 판매", pass: "판매 운영 · 정산 · 리오더 흐름이 쇼핑 화면과 다르게 읽힌다." },
      { href: "/b2b", label: "대량주문", pass: "수량 · 납기 · 자재 판정이 일반 소비자 주문보다 먼저 보인다." },
      { href: "/clearance", label: "재고정리", pass: "정규 제작 흐름이 아니라 소진 허브라는 점이 분명하다." },
    ],
  },
];

const failSignals = [
  "모든 페이지가 비슷한 소개 페이지처럼 보인다.",
  "다음 행동이 아니라 사진/분위기 설명만 보인다.",
  "운영 공간인데도 생산 조건보다 감성 문구가 먼저 읽힌다.",
  "판매 운영 화면끼리 서로 역할 차이가 잘 안 느껴진다.",
  "홈과 모드 선택이 같은 일을 하는 것처럼 보인다.",
];

const quickJudges = [
  { title: "3초 판정", body: "첫 화면에서 어디로 들어가야 하는지 3초 안에 말할 수 있어야 한다." },
  { title: "역할 분리", body: "허브, 제작, 운영, 판매가 문구 단계에서 서로 다른 역할로 읽혀야 한다." },
  { title: "행동 유도", body: "각 화면은 다음 액션을 명확히 설명해야 한다." },
];

export default function QAPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["제작 가이드", "분기 IA", "라우팅", "통과/보완", "검수"].map((tag) => (
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
                제작 가이드
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                지금 단계의 제작 가이드는 예쁜 화면 확인이 아니라 역할 분리 확인입니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                홈, 모드 선택, 작업대, 운영 공간, 판매 공간이 서로 다른 일을 하는 화면처럼 읽히는지 빠르게 점검합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {quickJudges.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="grid gap-4">
            {qaBuckets.map((bucket) => (
              <article
                key={bucket.title}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                      {bucket.intent}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{bucket.title}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    {bucket.items.length} checks
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {bucket.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 transition hover:border-white/20 hover:bg-slate-950/90"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
                          이동
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.pass}</p>
                      <p className="mt-2 text-xs text-slate-500">{item.href}</p>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              즉시 보완 신호
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              아래 항목이 보이면 바로 문구 구조를 다시 손봐야 합니다.
            </h2>
            <ul className="mt-5 space-y-3">
              {failSignals.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-3 text-sm leading-6 text-slate-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <RouteDock />
      </div>
    </main>
  );
}