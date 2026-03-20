import PartsRoomClient from "./_components/PartsRoomClient";
import { partWalls } from "./_components/parts-config";

export default function PartsRoomPage() {
  const totalParts = partWalls.reduce((sum, wall) => sum + wall.parts.length, 0);
  const lowStockCount = partWalls
    .flatMap((wall) => wall.parts)
    .filter((part) => part.status === "주의" || part.status === "부족").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.96),rgba(99,102,241,0.18))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["Parts", "Ring", "Chain", "Stand", "Routing"].map((tag) => (
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
                  Parts Room
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  부자재 존은 작은 부품을 뒤섞어 놓는 곳이 아니라,
                  <br className="hidden sm:block" />
                  작업 전 조합을 판정하는 벽면 허브여야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  링, 체인, 스탠드, 자석, 보조파츠를 벽면 단위로 나누고 현재 작업 흐름에 맞는 파츠를 골라 다음 공간으로 연결합니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">부자재 월</div>
                <div className="mt-2 text-3xl font-semibold text-white">{partWalls.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">파츠 수</div>
                <div className="mt-2 text-3xl font-semibold text-white">{totalParts}</div>
              </div>
              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-amber-100/80">주의/부족</div>
                <div className="mt-2 text-3xl font-semibold text-amber-50">{lowStockCount}</div>
              </div>
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">핵심 개념</div>
                <div className="mt-2 text-xl font-semibold text-cyan-50">벽면 파츠 존</div>
              </div>
            </div>
          </div>
        </section>

        <PartsRoomClient />
      </div>
    </main>
  );
}