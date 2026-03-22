"use client";

import { useMemo, useState } from "react";

type ShapeKey = "circle" | "square" | "free";
type SizeKey = "s" | "m" | "l";
type ThicknessKey = "2t" | "3t" | "5t";
type RingKey = "silver" | "ball" | "strap";

const STEPS = [
  "1. 이미지",
  "2. 모양",
  "3. 크기",
  "4. 옵션",
  "5. 주문",
] as const;

const SHAPES: Array<{ key: ShapeKey; label: string; hint: string }> = [
  { key: "circle", label: "원형", hint: "가장 무난한 기본형" },
  { key: "square", label: "사각형", hint: "사진/문구 배치에 유리" },
  { key: "free", label: "자유형", hint: "윤곽 따라 커팅" },
];

const SIZES: Array<{ key: SizeKey; label: string; mm: number; price: number }> = [
  { key: "s", label: "40mm", mm: 40, price: 4500 },
  { key: "m", label: "50mm", mm: 50, price: 5200 },
  { key: "l", label: "60mm", mm: 60, price: 6100 },
];

const THICKNESS: Array<{ key: ThicknessKey; label: string; hint: string }> = [
  { key: "2t", label: "2T", hint: "가볍고 얇은 편" },
  { key: "3t", label: "3T", hint: "가장 무난한 기본 두께" },
  { key: "5t", label: "5T", hint: "두껍고 존재감 있는 편" },
];

const RINGS: Array<{ key: RingKey; label: string; hint: string }> = [
  { key: "silver", label: "실버링", hint: "가장 기본" },
  { key: "ball", label: "볼체인", hint: "가볍고 간단" },
  { key: "strap", label: "스트랩", hint: "가방/파우치용" },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function KeyringWorkbenchPage() {
  const [fileName, setFileName] = useState("아직 업로드한 이미지가 없습니다");
  const [shape, setShape] = useState<ShapeKey>("circle");
  const [size, setSize] = useState<SizeKey>("m");
  const [thickness, setThickness] = useState<ThicknessKey>("3t");
  const [ring, setRing] = useState<RingKey>("silver");
  const [doubleSide, setDoubleSide] = useState(false);
  const [quantity, setQuantity] = useState(20);

  const selectedSize = useMemo(() => SIZES.find((item) => item.key === size) ?? SIZES[1], [size]);
  const selectedShape = useMemo(() => SHAPES.find((item) => item.key === shape) ?? SHAPES[0], [shape]);
  const selectedThickness = useMemo(() => THICKNESS.find((item) => item.key === thickness) ?? THICKNESS[1], [thickness]);
  const selectedRing = useMemo(() => RINGS.find((item) => item.key === ring) ?? RINGS[0], [ring]);

  const unitPrice = selectedSize.price + (doubleSide ? 600 : 0);
  const totalPrice = unitPrice * quantity;

  const previewStyle =
    shape === "circle"
      ? "rounded-full"
      : shape === "square"
      ? "rounded-[24px]"
      : "rounded-[34px]";

  const previewWidth = Math.max(140, selectedSize.mm * 3.2);
  const previewHeight = shape === "free" ? previewWidth * 0.82 : previewWidth;

  return (
    <main className="min-h-screen bg-[#efefec] text-slate-900">
      <div className="w-full px-3 py-3 md:px-5 xl:px-8 2xl:px-10">
        <div className="w-full rounded-[30px] border border-slate-200 bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 px-5 py-4 md:px-8 xl:px-10">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[980px]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">CustomBro Workshop</p>
                <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] md:text-4xl xl:text-[42px]">키링 작업대</h1>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 md:text-base xl:text-[15px]">
                  처음 온 주문자도 바로 이해할 수 있게, 작업대 중심으로 다시 정리한 키링 주문 화면입니다.
                  이미지 올리고, 모양 고르고, mm 크기만 선택하면 바로 주문서가 완성됩니다.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-5 xl:min-w-[620px]">
                {STEPS.map((step, index) => (
                  <div
                    key={step}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-center text-xs font-semibold md:text-sm xl:px-4 xl:py-3",
                      index < 4
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    )}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-4 md:gap-6 md:p-6 xl:grid-cols-[380px_minmax(980px,1fr)_380px] 2xl:grid-cols-[420px_minmax(1180px,1fr)_420px] 2xl:p-8">
            <section className="rounded-[28px] border border-slate-200 bg-[#faf9f5] p-4 md:p-5 xl:min-h-[840px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">재료 서랍</p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] xl:text-2xl">기본 재료 고르기</h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                  공방형 선택
                </span>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="mb-2 text-sm font-semibold xl:text-[15px]">1. 모양</p>
                  <div className="grid gap-2">
                    {SHAPES.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setShape(item.key)}
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-left transition",
                          shape === item.key
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white hover:border-slate-400"
                        )}
                      >
                        <p className="text-sm font-semibold xl:text-base">{item.label}</p>
                        <p className={cn("mt-1 text-xs xl:text-sm", shape === item.key ? "text-slate-200" : "text-slate-500")}>
                          {item.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold xl:text-[15px]">2. 크기</p>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSize(item.key)}
                        className={cn(
                          "rounded-2xl border px-3 py-4 text-center transition xl:px-4 xl:py-5",
                          size === item.key
                            ? "border-sky-600 bg-sky-50 text-sky-700"
                            : "border-slate-200 bg-white hover:border-slate-400"
                        )}
                      >
                        <p className="text-sm font-bold xl:text-base">{item.label}</p>
                        <p className="mt-1 text-[11px] text-slate-500 xl:text-xs">직경 기준</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold xl:text-[15px]">3. 두께</p>
                  <div className="grid gap-2">
                    {THICKNESS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setThickness(item.key)}
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-left transition",
                          thickness === item.key
                            ? "border-amber-500 bg-amber-50"
                            : "border-slate-200 bg-white hover:border-slate-400"
                        )}
                      >
                        <p className="text-sm font-semibold xl:text-base">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500 xl:text-sm">{item.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold xl:text-[15px]">4. 체결</p>
                  <div className="grid gap-2">
                    {RINGS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setRing(item.key)}
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-left transition",
                          ring === item.key
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-400"
                        )}
                      >
                        <p className="text-sm font-semibold xl:text-base">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500 xl:text-sm">{item.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[#f7f6f2] p-4 md:p-5 xl:min-h-[840px]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">작업대</p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] xl:text-2xl">내 키링 바로 만들기</h2>
                  <p className="mt-1 text-sm text-slate-600 xl:text-[15px]">
                    업로드 → 모양 → mm 크기 → 옵션 순서만 따라가면 됩니다.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  이미지 올리기
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setFileName(file ? file.name : "아직 업로드한 이미지가 없습니다");
                    }}
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(940px,1fr)_420px] 2xl:grid-cols-[minmax(1120px,1fr)_460px]">
                <div className="rounded-[30px] border border-slate-200 bg-[#ece8dd] p-6 shadow-inner">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700 xl:text-base">현재 작업물</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm xl:text-sm">
                      {selectedShape.label} · {selectedSize.label}
                    </span>
                  </div>

                  <div className="mt-6 rounded-[32px] border border-dashed border-slate-400/60 bg-white/70 p-8">
                    <div className="flex min-h-[420px] flex-col items-center justify-center gap-8 2xl:min-h-[500px]">
                      <div className="relative flex items-start justify-center">
                        <div
                          className={cn(
                            "relative border-[3px] border-slate-300 bg-gradient-to-b from-white to-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.15)]",
                            previewStyle
                          )}
                          style={{
                            width: `${previewWidth}px`,
                            height: `${previewHeight}px`,
                          }}
                        >
                          <div className="absolute inset-x-0 top-4 flex justify-center">
                            <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white" />
                          </div>

                          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                            <p className="text-base font-semibold text-slate-700 xl:text-lg">{fileName}</p>
                            <p className="mt-2 text-xs text-slate-500 xl:text-sm">
                              {selectedSize.label} · {selectedThickness.label} · {doubleSide ? "양면 인쇄" : "단면 인쇄"}
                            </p>
                          </div>
                        </div>

                        <div className="ml-5 mt-2 flex h-20 w-20 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-600 shadow-sm xl:h-24 xl:w-24 xl:text-sm">
                          {selectedRing.label}
                        </div>
                      </div>

                      <div className="w-full max-w-[760px]">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 xl:text-xs">
                          <span>0</span>
                          <span>{selectedSize.mm / 2}mm</span>
                          <span>{selectedSize.mm}mm</span>
                        </div>
                        <div className="mt-2 h-4 rounded-full bg-[linear-gradient(90deg,#d6d3d1_0%,#fafaf9_50%,#d6d3d1_100%)] shadow-inner" />
                        <p className="mt-3 text-center text-xs text-slate-500 xl:text-sm">
                          아래 눈금은 완성 크기 기준입니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm font-semibold xl:text-base">간단 설정</p>
                      <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 xl:text-base">양면 인쇄</p>
                          <p className="text-xs text-slate-500 xl:text-sm">앞뒤 모두 인쇄</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDoubleSide((prev) => !prev)}
                          className={cn(
                            "h-9 w-16 rounded-full text-sm transition",
                            doubleSide ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                          )}
                        >
                          {doubleSide ? "ON" : "OFF"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm font-semibold xl:text-base">수량</p>
                      <div className="mt-3 flex items-center gap-2">
                        {[10, 20, 50].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setQuantity(value)}
                            className={cn(
                              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                              quantity === value
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white hover:border-slate-400"
                            )}
                          >
                            {value}개
                          </button>
                        ))}
                      </div>
                      <input
                        className="mt-3 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-400"
                        type="number"
                        min={1}
                        step={1}
                        value={quantity}
                        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
                      />
                    </div>
                  </div>
                </div>

                <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:min-h-[760px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">주문서</p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] xl:text-2xl">클립보드 요약</h2>

                  <div className="mt-5 space-y-3 rounded-[24px] border border-slate-200 bg-[#faf9f5] p-4">
                    <div className="flex items-center justify-between text-sm xl:text-base">
                      <span className="text-slate-500">상품</span>
                      <span className="font-semibold">아크릴 키링</span>
                    </div>
                    <div className="flex items-center justify-between text-sm xl:text-base">
                      <span className="text-slate-500">모양</span>
                      <span className="font-semibold">{selectedShape.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm xl:text-base">
                      <span className="text-slate-500">크기</span>
                      <span className="font-semibold">{selectedSize.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm xl:text-base">
                      <span className="text-slate-500">두께</span>
                      <span className="font-semibold">{selectedThickness.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm xl:text-base">
                      <span className="text-slate-500">체결</span>
                      <span className="font-semibold">{selectedRing.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm xl:text-base">
                      <span className="text-slate-500">인쇄</span>
                      <span className="font-semibold">{doubleSide ? "양면" : "단면"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm xl:text-base">
                      <span className="text-slate-500">수량</span>
                      <span className="font-semibold">{quantity}개</span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] bg-slate-900 p-5 text-white">
                    <p className="text-sm text-slate-300 xl:text-base">예상 단가</p>
                    <p className="mt-1 text-3xl font-bold">{unitPrice.toLocaleString()}원</p>
                    <div className="mt-4 h-px bg-white/10" />
                    <p className="mt-4 text-sm text-slate-300 xl:text-base">예상 합계</p>
                    <p className="mt-1 text-4xl font-bold">{totalPrice.toLocaleString()}원</p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      className="h-12 rounded-2xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 xl:h-14 xl:text-base"
                    >
                      장바구니 담기
                    </button>
                    <button
                      type="button"
                      className="h-12 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 transition hover:border-slate-500 xl:h-14 xl:text-base"
                    >
                      주문서 작성
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <p className="text-sm font-semibold xl:text-base">처음 주문자 안내</p>
                    <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600 xl:text-sm">
                      <li>• 먼저 이미지 올리고, 모양과 mm 크기만 골라도 됩니다.</li>
                      <li>• 세부 옵션은 꼭 필요한 것만 먼저 노출했습니다.</li>
                      <li>• 복잡한 제작 정보는 주문자 화면에서 숨겼습니다.</li>
                    </ul>
                  </div>
                </aside>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[#faf9f5] p-4 md:p-5 xl:min-h-[840px]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">공방 메모</p>
              <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] xl:text-2xl">왜 이렇게 바꿨는지</h2>

              <div className="mt-5 space-y-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 xl:p-5">
                  <p className="text-sm font-semibold xl:text-base">시작점 하나만 남김</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 xl:text-[15px]">
                    처음 진입 시 업로드, 모양, mm 크기, 주문서만 보이도록 줄였습니다.
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-4 xl:p-5">
                  <p className="text-sm font-semibold xl:text-base">드롭다운 대신 샘플칩</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 xl:text-[15px]">
                    소/중/대 대신 40mm, 50mm, 60mm를 직접 누르는 방식으로 바꿨습니다.
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-4 xl:p-5">
                  <p className="text-sm font-semibold xl:text-base">관리자 정보 제거</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 xl:text-[15px]">
                    생산 요약, 작업 메모, 부자재 판단 같은 운영자 정보는 주문자 화면에서 숨겼습니다.
                  </p>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}