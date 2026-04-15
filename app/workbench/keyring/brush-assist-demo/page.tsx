import Link from "next/link";

export default function BrushAssistDemoPage() {
  return (
    <main className="min-h-screen bg-[#f5f4f1] text-neutral-900">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">BRUSH ASSIST DEMO</p>
          <h1 className="mt-2 text-2xl font-semibold">붓칠 분리 데모</h1>
          <p className="mt-2 text-sm text-neutral-600">주문 전 흐름 확인용 데모입니다. 실제 작업은 본편에서 진행하세요.</p>

          <div className="mt-5 grid gap-2 text-sm">
            <div className="rounded-2xl bg-[#f8f4ec] px-4 py-3">1 이미지 올리기</div>
            <div className="rounded-2xl bg-[#f8f4ec] px-4 py-3">2 캐릭터 부분만 러프하게 붓칠</div>
            <div className="rounded-2xl bg-[#f8f4ec] px-4 py-3">3 계산된 칼선 확인</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/workbench/keyring" className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
              본편으로 이동
            </Link>
            <Link href="/workbench/keyring/brush-assist-lab" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
              실험실 열기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
