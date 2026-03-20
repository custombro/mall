import KeyringWorkbenchClient from "./_components/KeyringWorkbenchClient";
import { keyringPresets } from "./_components/keyring-config";

export default function KeyringWorkbenchPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["Workbench", "Keyring", "Preset", "Estimate", "Recall Link"].map((tag) => (
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
                  Keyring Workbench
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  키링 작업대는 단순 설명 페이지가 아니라,
                  <br className="hidden sm:block" />
                  실제 선택과 판단이 이루어지는 작업 공간이어야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  프리셋 선택, 두께/링/마감 조합, 추가 옵션, 예상 단가, 생산 힌트를
                  한 화면에서 읽고 바로 다음 공간으로 연결하는 작업대형 UI입니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">프리셋 수</div>
                <div className="mt-2 text-3xl font-semibold text-white">{keyringPresets.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">작업 방식</div>
                <div className="mt-2 text-xl font-semibold text-white">프리셋 + 수동 조합</div>
              </div>
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-200/80">연결 동선</div>
                <div className="mt-2 text-xl font-semibold text-emerald-50">보관함 / 파츠룸 / 홈 허브</div>
              </div>
            </div>
          </div>
        </section>

        <KeyringWorkbenchClient />
      </div>
    </main>
  );
}