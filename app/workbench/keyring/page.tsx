import KeyringWorkbenchClient from "./_components/KeyringWorkbenchClient";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0f18] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              KEYRING / WORKBENCH
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              키링 제작
            </h1>
          </div>
          <p className="max-w-xl text-sm text-slate-300">
            좌측에서 선택하고, 중앙에서 사양을 맞추고, 우측에서 저장·주문만 처리하는 단순 작업 화면입니다.
          </p>
        </div>

        <KeyringWorkbenchClient />
      </div>
    </main>
  );
}