'use client';

import { useMemo, useState } from 'react';

type Face = '단면' | '양면';
type Finish = '유광' | '무광';
type RingPosition = '상단 중앙' | '좌측 상단' | '우측 상단';
type ActiveZone = 'front' | 'back' | 'ring';

const faces: Face[] = ['단면', '양면'];
const finishes: Finish[] = ['유광', '무광'];
const ringPositions: RingPosition[] = ['상단 중앙', '좌측 상단', '우측 상단'];

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
          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-100'
          : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10'
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function KeyringWorkbenchClient() {
  const [face, setFace] = useState<Face>('양면');
  const [finish, setFinish] = useState<Finish>('유광');
  const [ringPosition, setRingPosition] = useState<RingPosition>('상단 중앙');
  const [quantity, setQuantity] = useState<number>(10);
  const [activeZone, setActiveZone] = useState<ActiveZone>('front');
  const [saveState, setSaveState] = useState<'미저장' | '저장됨'>('미저장');

  const unitPrice = useMemo(() => {
    let base = 2900;
    if (face === '양면') base += 500;
    if (finish === '무광') base += 300;
    return base;
  }, [face, finish]);

  const totalPrice = unitPrice * quantity;
  const boardTitle =
    activeZone === 'front'
      ? '앞면 배치 확인 중'
      : activeZone === 'back'
        ? '뒷면 메모 확인 중'
        : '고리 위치 확인 중';

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <section className="mb-5 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">KEYRING / SIMPLIFY / KEYRING_SIMPLIFY_20260326_020952</div>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">키링 제작</h1>
            <p className="mt-2 text-sm text-neutral-300">
              좌측에서 옵션 선택, 중앙에서 작업테이블 확인, 우측에서 수량·가격·저장·주문까지 바로 처리합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            라이브 확인 마커
            <div className="mt-1 font-mono text-xs text-cyan-200">KEYRING_SIMPLIFY_20260326_020952</div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">좌측 / 선택</div>
              <h2 className="mt-2 text-lg font-semibold">옵션</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 text-sm font-medium text-neutral-200">자재</div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-3 text-sm text-emerald-100">
                  단일 기준 자재
                  <div className="mt-1 text-base font-semibold">투명 아크릴 3T</div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-neutral-200">인쇄 면수</div>
                <div className="grid grid-cols-2 gap-2">
                  {faces.map((item) => (
                    <PillButton
                      key={item}
                      active={face === item}
                      label={item}
                      onClick={() => {
                        setFace(item);
                        setSaveState('미저장');
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-neutral-200">표면 마감</div>
                <div className="grid grid-cols-2 gap-2">
                  {finishes.map((item) => (
                    <PillButton
                      key={item}
                      active={finish === item}
                      label={item}
                      onClick={() => {
                        setFinish(item);
                        setSaveState('미저장');
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-neutral-200">고리 위치</div>
                <div className="grid gap-2">
                  {ringPositions.map((item) => (
                    <PillButton
                      key={item}
                      active={ringPosition === item}
                      label={item}
                      onClick={() => {
                        setRingPosition(item);
                        setActiveZone('ring');
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
                <h2 className="mt-2 text-lg font-semibold">작업테이블</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300">
                {boardTitle}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-neutral-900/70 p-4 md:p-6">
              <div className="mb-4 grid gap-2 md:grid-cols-3">
                <PillButton active={activeZone === 'front'} label="앞면" onClick={() => setActiveZone('front')} />
                <PillButton active={activeZone === 'back'} label="뒷면" onClick={() => setActiveZone('back')} />
                <PillButton active={activeZone === 'ring'} label="고리 위치" onClick={() => setActiveZone('ring')} />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveZone('front');
                      setSaveState('미저장');
                    }}
                    className={[
                      'min-h-[240px] rounded-[28px] border p-5 text-left transition',
                      activeZone === 'front'
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    ].join(' ')}
                  >
                    <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">Front</div>
                    <div className="mt-3 text-xl font-semibold">앞면 핵심 배치</div>
                    <div className="mt-2 text-sm text-neutral-300">
                      업로드 영역과 메인 이미지 위치를 중심에 두고 작업합니다.
                    </div>
                    <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-neutral-400">
                      대표 이미지 놓는 자리
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveZone('back');
                      setSaveState('미저장');
                    }}
                    className={[
                      'min-h-[240px] rounded-[28px] border p-5 text-left transition',
                      activeZone === 'back'
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    ].join(' ')}
                  >
                    <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">Back</div>
                    <div className="mt-3 text-xl font-semibold">뒷면 메모 영역</div>
                    <div className="mt-2 text-sm text-neutral-300">
                      후면 인쇄 여부와 간단한 메모 방향만 바로 확인합니다.
                    </div>
                    <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-neutral-400">
                      뒷면 안내 / 메모 자리
                    </div>
                  </button>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">Preview</div>
                  <div className="mt-3 flex min-h-[240px] items-center justify-center rounded-[28px] border border-dashed border-cyan-400/30 bg-gradient-to-b from-cyan-400/10 to-white/5 p-6">
                    <div className="relative flex h-56 w-44 items-center justify-center rounded-[36px] border border-white/20 bg-white/10 shadow-2xl">
                      <div
                        className={[
                          'absolute h-5 w-5 rounded-full border-2 border-cyan-300 bg-cyan-300/20',
                          ringPosition === '상단 중앙'
                            ? 'left-1/2 top-2 -translate-x-1/2'
                            : ringPosition === '좌측 상단'
                              ? 'left-3 top-3'
                              : 'right-3 top-3'
                        ].join(' ')}
                      />
                      <div className="text-center">
                        <div className="text-sm text-neutral-300">작업 요약</div>
                        <div className="mt-2 text-lg font-semibold">{face} / {finish}</div>
                        <div className="mt-1 text-sm text-cyan-200">{ringPosition}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300">
                    현재 포커스: <span className="font-semibold text-white">{boardTitle}</span>
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
                  <span className="font-semibold text-white">{formatWon(unitPrice)}원</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-400">합계</span>
                  <span className="text-xl font-semibold text-cyan-200">{formatWon(totalPrice)}원</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300">
                <div>자재: <span className="font-semibold text-white">투명 아크릴 3T</span></div>
                <div className="mt-2">면수: <span className="font-semibold text-white">{face}</span></div>
                <div className="mt-2">마감: <span className="font-semibold text-white">{finish}</span></div>
                <div className="mt-2">고리 위치: <span className="font-semibold text-white">{ringPosition}</span></div>
                <div className="mt-2">저장 상태: <span className="font-semibold text-cyan-200">{saveState}</span></div>
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
                  className="rounded-2xl border border-cyan-400/40 bg-cyan-400/15 px-4 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-400/25"
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