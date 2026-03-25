import RouteDock from "../_components/RouteDock";
import PartsRoomClient from "./_components/PartsRoomClient";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0f18] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              PARTS ROOM / HUB
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              부자재실
            </h1>
          </div>
          <p className="max-w-xl text-sm text-slate-300">
            링 · 체인 · 스탠드 · 포장 부품을 조합 기준으로 읽고, 다음 작업 공간으로 넘기는 허브입니다.
          </p>
        </div>

        <div className="mb-4">
          <RouteDock />
        </div>

        <PartsRoomClient />
      </div>
    </main>
  );
}