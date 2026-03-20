import OptionStoreClient from "./_components/OptionStoreClient";
import { optionGroups } from "./_components/option-config";

export default function OptionStorePage() {
  const totalOptions = optionGroups.reduce((sum, group) => sum + group.items.length, 0);
  const warningCount = optionGroups
    .flatMap((group) => group.items)
    .filter((item) => item.status === "주의" || item.status === "부족").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.96),rgba(16,185,129,0.18))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["Option", "Addon", "Package", "Premium", "Routing"].map((tag) => (
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
                  Option Store
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  옵션은 본체 화면 안에 뒤섞는 게 아니라,
                  <br className="hidden sm:block" />
                  별도 스토어에서 판단해야 구조가 깔끔해집니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  후가공, 포장, 결합, 전시, 프리미엄 옵션을 분리해 선택하고 키링 작업대, POP 스튜디오, 판매자 센터, B2B와 연결합니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">옵션 선반</div>
                <div className="mt-2 text-3xl font-semibold text-white">{optionGroups.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">옵션 수</div>
                <div className="mt-2 text-3xl font-semibold text-white">{totalOptions}</div>
              </div>
              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-amber-100/80">주의/부족</div>
                <div className="mt-2 text-3xl font-semibold text-amber-50">{warningCount}</div>
              </div>
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">핵심 개념</div>
                <div className="mt-2 text-xl font-semibold text-cyan-50">옵션 분리 구조</div>
              </div>
            </div>
          </div>
        </section>

        <OptionStoreClient />
      </div>
    </main>
  );
}