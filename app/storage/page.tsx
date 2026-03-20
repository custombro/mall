import StorageWallClient from "./_components/StorageWallClient";
import { storageShelves } from "./_components/storage-config";

function getCounts() {
  const drawers = storageShelves.flatMap((shelf) => shelf.drawers);

  return {
    shelfCount: storageShelves.length,
    drawerCount: drawers.length,
    reorderableCount: drawers.filter((item) => item.status === "재주문 가능").length,
    inspectionCount: drawers.filter((item) => item.status === "검수 필요").length,
  };
}

export default function StoragePage() {
  const counts = getCounts();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96),rgba(16,185,129,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["Storage", "Drawer Recall", "Reorder", "Workbench Link"].map((tag) => (
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
                  Storage Room
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  보관함은 끝난 작업을 쌓아두는 곳이 아니라,
                  <br className="hidden sm:block" />
                  다시 꺼내 다음 흐름으로 보내는 서랍형 허브입니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  작업물을 서랍 단위로 보관하고, 상태와 메모를 확인한 뒤 키링 작업대,
                  POP 스튜디오, 자재 공간, 판매 공간으로 다시 연결하는 재호출 UX를 중심에 둡니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">보관 월</div>
                <div className="mt-2 text-3xl font-semibold text-white">{counts.shelfCount}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">등록 서랍</div>
                <div className="mt-2 text-3xl font-semibold text-white">{counts.drawerCount}</div>
              </div>
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-200/80">즉시 재호출</div>
                <div className="mt-2 text-3xl font-semibold text-emerald-50">{counts.reorderableCount}</div>
              </div>
              <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-amber-200/80">검수 체크</div>
                <div className="mt-2 text-3xl font-semibold text-amber-50">{counts.inspectionCount}</div>
              </div>
            </div>
          </div>
        </section>

        <StorageWallClient />
      </div>
    </main>
  );
}