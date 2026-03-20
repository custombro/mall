import PopStudioClient from "./_components/PopStudioClient";
import { popLayers, popPresets } from "./_components/pop-config";

export default function PopStudioPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(16,185,129,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["POP", "Snap Guide", "Workbench", "Display", "Recall Flow"].map((tag) => (
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
                  POP Studio
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  POP 제작은 단순 소개가 아니라,
                  <br className="hidden sm:block" />
                  붙일 수 있는 위치를 눈으로 이해하는 작업면이어야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  파트를 고르면 호환 가능한 구역이 드러나고, 현재 위치가 접착 가능한 범위면
                  체크와 함께 스냅 가능 상태를 보여주는 POP 스튜디오 첫 인터랙션입니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">프리셋 수</div>
                <div className="mt-2 text-3xl font-semibold text-white">{popPresets.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">파츠 수</div>
                <div className="mt-2 text-3xl font-semibold text-white">{popLayers.length}</div>
              </div>
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-200/80">핵심 개념</div>
                <div className="mt-2 text-xl font-semibold text-emerald-50">스냅 가이드</div>
              </div>
            </div>
          </div>
        </section>

        <PopStudioClient />
      </div>
    </main>
  );
}