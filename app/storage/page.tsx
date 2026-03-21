import RouteDock from "../_components/RouteDock";
import StorageWallClient from "./_components/StorageWallClient";

const storageStages = [
  { title: "제작 완료", body: "완료품을 쌓아두는 것이 아니라 어떤 상태로 보관할지 먼저 고정합니다." },
  { title: "재호출 대기", body: "리오더, 추가 제작, 검수 재진입 가능성이 있는 작업물을 분리합니다." },
  { title: "출고 / 회수", body: "출고 직전 보관과 다시 꺼내는 회수 동선을 같은 흐름 안에서 봅니다." },
];

const drawerRules = [
  "서랍은 창고가 아니라 다시 꺼내 쓸 수 있는 recall 허브여야 합니다.",
  "서랍·박스·라벨은 재주문 속도를 올리는 방향으로 읽혀야 합니다.",
  "보관 이유가 아니라 다음 액션을 기준으로 정렬해야 합니다.",
];

const nextActions = [
  { label: "리오더", description: "같은 고객 / 같은 디자인의 재주문을 빠르게 다시 태우는 흐름" },
  { label: "검수 재진입", description: "문제 확인 후 다시 확인이 필요한 작업을 회수하는 흐름" },
  { label: "출고 연결", description: "포장 / 송장 / 전달 직전까지 이어지는 출고 연결 흐름" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["서랍", "보관", "재호출", "재주문", "보관기록"].map((tag) => (
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
                서랍
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                서랍은 다시 꺼내 다음 흐름으로 보내는 재호출 허브여야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                완료 작업 보관이 아니라 리오더, 검수 후 재사용, 재호출 중심 흐름으로 연결합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              서랍 단계
            </p>
            <div className="mt-4 space-y-3">
              {storageStages.map((item) => (
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
              Drawer Rules
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {drawerRules.map((item) => (
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
          {nextActions.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <StorageWallClient />
        <RouteDock />
      </div>
    </main>
  );
}