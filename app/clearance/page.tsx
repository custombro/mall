import RouteDock from "../_components/RouteDock";
import ClearanceClient from "./_components/ClearanceClient";

const clearanceBuckets = [
  { title: "행사 종료 재고", body: "이벤트 종료 후 남은 수량을 빠르게 소진하는 버킷" },
  { title: "샘플 / 테스트", body: "촬영용, 테스트용, 내부 검수용으로 남은 작업물을 분리하는 버킷" },
  { title: "보류 자재 / 파츠", body: "정규 흐름에 올리기 애매하지만 소진 가능한 항목을 묶는 버킷" },
];

const clearanceRules = [
  "재고정리는 정규 제작 카탈로그가 아니라 남은 것을 빠르게 소진하는 운영 허브여야 합니다.",
  "새 제품 판매와 남은 재고 소진을 같은 톤으로 섞지 말아야 합니다.",
  "묶음 판매, 빠른 판매, 할인 사유를 텍스트 구조로 먼저 설명해야 합니다.",
];

const clearanceChecks = [
  { label: "상태 확인", description: "스크래치, 샘플 표시, 테스트 흔적 등 판매 가능 상태를 먼저 판정" },
  { label: "묶음 구성", description: "단품보다 세트로 빨리 소진할 수 있는지 우선 확인" },
  { label: "정규/재고정리 분기", description: "정규 제작 흐름으로 되돌릴지 클리어런스로 보낼지 구분" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["재고정리", "잔여재고", "빠른판매", "묶음", "분기"].map((tag) => (
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
                재고정리 허브
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                재고 정리 탭은 정규 제작 흐름과 분리된 소진 허브여야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                행사 종료 재고, 샘플 잔량, 테스트 파츠, 보류 자재를 상태별로 분리해 정리합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              재고정리 묶음
            </p>
            <div className="mt-4 space-y-3">
              {clearanceBuckets.map((item) => (
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
              재고정리 규칙
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {clearanceRules.map((item) => (
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
          {clearanceChecks.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <ClearanceClient />
        <RouteDock />
      </div>
    </main>
  );
}