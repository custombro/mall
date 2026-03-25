import KeyringWorkbenchClient from "./_components/KeyringWorkbenchClient";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0f18] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
            KEYRING / 3-ZONE
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            키링 작업대
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            좌측 자재·옵션, 중앙 작업대, 우측 수량·가격·저장·주문만 남긴 간소화 화면입니다.
          </p>
        </header>

        <KeyringWorkbenchClient />
      </div>
    </main>
  );
}