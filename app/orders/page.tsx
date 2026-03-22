import Link from "next/link";

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">Orders</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">주문 허브 준비중</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
            홈 허브에서 끊기지 않도록 기본 주문 라우트를 먼저 고정했습니다. 다음 단계에서 실제 주문 목록,
            생성, 생산 큐 연결을 붙이면 됩니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950">
              홈으로
            </Link>
            <Link href="/workbench/keyring" className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white">
              제작으로
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}