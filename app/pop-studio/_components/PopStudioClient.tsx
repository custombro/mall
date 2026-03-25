'use client';

import { useMemo, useState } from 'react';

type Mode = 'single' | 'multi';
type SlotId = 1 | 2 | 3 | 4;
type MaterialName = '투명 3T' | '백색 3T' | '홀로그램' | '미러';

const allSlots: SlotId[] = [1, 2, 3, 4];
const materialOptions: MaterialName[] = ['투명 3T', '백색 3T', '홀로그램', '미러'];

function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function PillButton(props: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const { active, label, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-2xl border px-3 py-2 text-sm transition',
        active
          ? 'border-fuchsia-400 bg-fuchsia-400/20 text-fuchsia-100'
          : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10'
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function PopStudioClient() {
  const [mode, setMode] = useState<Mode>('single');
  const [multiCount, setMultiCount] = useState<2 | 3 | 4>(2);
  const [activeSlot, setActiveSlot] = useState<SlotId>(1);
  const [quantity, setQuantity] = useState<number>(5);
  const [saveState, setSaveState] = useState<'미저장' | '저장됨'>('미저장');
  const [slotMaterials, setSlotMaterials] = useState<Record<SlotId, MaterialName>>({
    1: '투명 3T',
    2: '백색 3T',
    3: '홀로그램',
    4: '미러'
  });

  const enabledSlots = useMemo<SlotId[]>(() => {
    return mode === 'single' ? [1] : allSlots.slice(0, multiCount);
  }, [mode, multiCount]);

  const activeUnitPrice = useMemo(() => {
    let base = 9800;
    base += enabledSlots.length * 2200;
    if (mode === 'multi') base += 1800;
    return base;
  }, [enabledSlots.length, mode]);

  const totalPrice = activeUnitPrice * quantity;
  const activeMaterial = slotMaterials[activeSlot];
  const enabledSlotCount = enabledSlots.length;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <section className="mb-5 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-fuchsia-300">POP / SIMPLIFY / POP_SIMPLIFY_20260326_020952</div>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">POP 제작</h1>
            <p className="mt-2 text-sm text-neutral-300">
              좌측에서 소재 구성을 선택하고 중앙 작업테이블에서 패널 상태를 확인한 뒤 우측에서 수량·가격·저장·주문을 처리합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-3 text-sm text-fuchsia-100">
            라이브 확인 마커
            <div className="mt-1 font-mono text-xs text-fuchsia-200">POP_SIMPLIFY_20260326_020952</div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">좌측 / 선택</div>
              <h2 className="mt-2 text-lg font-semibold">소재 구성</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 text-sm font-medium text-neutral-200">구성 방식</div>
                <div className="grid grid-cols-2 gap-2">
                  <PillButton
                    active={mode === 'single'}
                    label="단일 소재"
                    onClick={() => {
                      setMode('single');
                      setActiveSlot(1);
                      setSaveState('미저장');
                    }}
                  />
                  <PillButton
                    active={mode === 'multi'}
                    label="여러 소재"
                    onClick={() => {
                      setMode('multi');
                      setActiveSlot(1);
                      setSaveState('미저장');
                    }}
                  />
                </div>
              </div>

              {mode === 'multi' ? (
                <div>
                  <div className="mb-2 text-sm font-medium text-neutral-200">사용 패널 수</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((countValue) => (
                      <PillButton
                        key={countValue}
                        active={multiCount === countValue}
                        label={`${countValue}패널`}
                        onClick={() => {
                          setMultiCount(countValue as 2 | 3 | 4);
                          if (activeSlot > countValue) setActiveSlot(countValue as SlotId);
                          setSaveState('미저장');
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <div className="mb-2 text-sm font-medium text-neutral-200">패널 선택</div>
                <div className="grid grid-cols-2 gap-2">
                  {allSlots.map((slot) => {
                    const enabled = enabledSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!enabled}
                        onClick={() => {
                          if (!enabled) return;
                          setActiveSlot(slot);
                          setSaveState('미저장');
                        }}
                        className={[
                          'rounded-2xl border px-3 py-2 text-sm transition',
                          activeSlot === slot && enabled
                            ? 'border-fuchsia-400 bg-fuchsia-400/20 text-fuchsia-100'
                            : enabled
                              ? 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10'
                              : 'cursor-not-allowed border-white/5 bg-white/5 text-neutral-600'
                        ].join(' ')}
                      >
                        {slot}번 소재
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-neutral-200">선택 패널 소재</div>
                <div className="grid gap-2">
                  {materialOptions.map((material) => (
                    <PillButton
                      key={material}
                      active={activeMaterial === material}
                      label={material}
                      onClick={() => {
                        setSlotMaterials((prev) => ({ ...prev, [activeSlot]: material }));
                        setSaveState('미저장');
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">중앙 / 작업</div>
                <h2 className="mt-2 text-lg font-semibold">POP 작업테이블</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300">
                활성 패널 {enabledSlotCount}개 / 현재 {activeSlot}번 선택
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-neutral-900/70 p-4 md:p-6">
              <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
                <div className="grid gap-4 md:grid-cols-2">
                  {allSlots.map((slot) => {
                    const enabled = enabledSlots.includes(slot);
                    const selected = activeSlot === slot && enabled;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!enabled}
                        onClick={() => {
                          if (!enabled) return;
                          setActiveSlot(slot);
                          setSaveState('미저장');
                        }}
                        className={[
                          'min-h-[220px] rounded-[28px] border p-5 text-left transition',
                          selected
                            ? 'border-fuchsia-400 bg-fuchsia-400/10'
                            : enabled
                              ? 'border-white/10 bg-white/5 hover:border-white/20'
                              : 'cursor-not-allowed border-white/5 bg-black/20 opacity-40'
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">Panel {slot}</div>
                          <div className="rounded-full border border-white/10 px-2 py-1 text-xs text-neutral-300">
                            {enabled ? '활성' : '비활성'}
                          </div>
                        </div>
                        <div className="mt-4 text-xl font-semibold">{slot}번 소재 패널</div>
                        <div className="mt-2 text-sm text-neutral-300">
                          {enabled ? `현재 소재: ${slotMaterials[slot]}` : '현재 구성에서는 사용하지 않는 패널입니다.'}
                        </div>
                        <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-neutral-400">
                          {enabled ? `작업물 배치 영역 / ${slotMaterials[slot]}` : '대기'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">Summary</div>
                  <div className="mt-4 space-y-3 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300">
                    <div className="flex items-center justify-between">
                      <span>구성 방식</span>
                      <span className="font-semibold text-white">{mode === 'single' ? '단일 소재' : '여러 소재'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>활성 패널 수</span>
                      <span className="font-semibold text-white">{enabledSlotCount}개</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>현재 패널</span>
                      <span className="font-semibold text-fuchsia-200">{activeSlot}번</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>현재 소재</span>
                      <span className="font-semibold text-white">{activeMaterial}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>저장 상태</span>
                      <span className="font-semibold text-fuchsia-200">{saveState}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl border border-dashed border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-10 text-center">
                    <div className="text-sm text-neutral-300">현재 작업 확인</div>
                    <div className="mt-2 text-xl font-semibold">{activeSlot}번 소재 / {activeMaterial}</div>
                    <div className="mt-2 text-sm text-fuchsia-100">POP_SIMPLIFY_20260326_020952</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">우측 / 요약</div>
              <h2 className="mt-2 text-lg font-semibold">수량 · 가격 · 저장 · 주문</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-neutral-400">수량</div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity((prev) => Math.max(1, prev - 1));
                      setSaveState('미저장');
                    }}
                    className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-lg"
                  >
                    -
                  </button>
                  <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-lg font-semibold">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity((prev) => Math.min(500, prev + 1));
                      setSaveState('미저장');
                    }}
                    className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">단가</span>
                  <span className="font-semibold text-white">{formatWon(activeUnitPrice)}원</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-400">합계</span>
                  <span className="text-xl font-semibold text-fuchsia-200">{formatWon(totalPrice)}원</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300">
                <div>구성: <span className="font-semibold text-white">{mode === 'single' ? '단일 소재' : `여러 소재 ${enabledSlotCount}패널`}</span></div>
                <div className="mt-2">현재 패널: <span className="font-semibold text-white">{activeSlot}번</span></div>
                <div className="mt-2">현재 소재: <span className="font-semibold text-white">{activeMaterial}</span></div>
                <div className="mt-2">저장 상태: <span className="font-semibold text-fuchsia-200">{saveState}</span></div>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setSaveState('저장됨')}
                  className="rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90"
                >
                  보관함 저장
                </button>
                <button
                  type="button"
                  onClick={() => setSaveState('미저장')}
                  className="rounded-2xl border border-fuchsia-400/40 bg-fuchsia-400/15 px-4 py-3 font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/25"
                >
                  바로 주문 진행
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}