import RouteDock from "../_components/RouteDock";
import StorageWallClient from "./_components/StorageWallClient";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(99,102,241,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2">
              {["Storage", "Drawer", "Recall", "Reorder", "Archive"].map((tag) => (
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
                Storage
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                보관함은 다시 꺼내 다음 흐름으로 보내는 재호출 허브여야 합니다.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                완료 작업 보관이 아니라 리오더, 검수 후 재사용, 재호출 중심 흐름으로 연결합니다.
              </p>
            </div>
          </div>
        </section>

        <StorageWallClient />
        <RouteDock />
      </div>
    </main>
  );
}