import MaterialsRoomClient from "./_components/MaterialsRoomClient";
import { materialRacks } from "./_components/materials-config";

export default function MaterialsRoomPage() {
  const totalSheets = materialRacks.reduce((sum, rack) => sum + rack.sheets.length, 0);
  const lowStockCount = materialRacks
    .flatMap((rack) => rack.sheets)
    .filter((sheet) => sheet.status === "주의" || sheet.status === "부족").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.96),rgba(148,163,184,0.18))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["Materials", "Metal Rack", "Acrylic Sheet", "Routing", "Stock"].map((tag) => (
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
                  Materials Room
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  원자재 존은 소품 서랍이 아니라,
                  <br className="hidden sm:block" />
                  금속 랙 위에 원장이 겹겹이 쌓인 공간이어야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  원장 두께, 재질, 재고 상태를 기준으로 다음 작업대를 선택하는 원자재 허브입니다.
                  키링 작업대, POP 스튜디오, B2B 허브, 보관함과 연결됩니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">랙 수</div>
                <div className="mt-2 text-3xl font-semibold text-white">{materialRacks.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">원장 수</div>
                <div className="mt-2 text-3xl font-semibold text-white">{totalSheets}</div>
              </div>
              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-amber-100/80">주의/부족</div>
                <div className="mt-2 text-3xl font-semibold text-amber-50">{lowStockCount}</div>
              </div>
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">핵심 개념</div>
                <div className="mt-2 text-xl font-semibold text-cyan-50">금속 랙 원장 존</div>
              </div>
            </div>
          </div>
        </section>

        <MaterialsRoomClient />
      </div>
    </main>
  );
}