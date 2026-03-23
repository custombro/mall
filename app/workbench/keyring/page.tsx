"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const SYSTEM_MODES = ["둘러보기", "작업대 바로가기"] as const;
const ZONES = [
  {
    key: "materials",
    title: "자재칸",
    description: "아크릴 재질과 두께를 먼저 고르는 구역",
  },
  {
    key: "workbench",
    title: "작업대",
    description: "자재와 부자재가 실제 제품으로 합쳐지는 중심 구역",
  },
  {
    key: "hardware",
    title: "부자재칸",
    description: "고리와 포장, 마감 방식을 고르는 구역",
  },
  {
    key: "finish",
    title: "완성 / 서랍",
    description: "완성 스펙을 저장하고 재주문으로 넘기는 구역",
  },
] as const;

const MATERIALS = [
  { value: "투명", note: "기본 키링용", unitDelta: 0 },
  { value: "백색", note: "불투명 인쇄용", unitDelta: 200 },
  { value: "오로라", note: "반짝임 강조", unitDelta: 450 },
] as const;

const THICKNESS = [
  { value: "2T", note: "가벼움", unitDelta: -150 },
  { value: "3T", note: "표준", unitDelta: 0 },
  { value: "5T", note: "존재감", unitDelta: 350 },
] as const;

const SHAPES = [
  { value: "자유형", note: "도안 기준", unitDelta: 250 },
  { value: "원형", note: "빠른 제작", unitDelta: 0 },
  { value: "사각형", note: "안정형", unitDelta: 80 },
] as const;

const HOLES = [
  { value: "상단 중앙", note: "기본 홀", unitDelta: 0 },
  { value: "좌상단", note: "비대칭 감성", unitDelta: 30 },
  { value: "우상단", note: "비대칭 감성", unitDelta: 30 },
] as const;

const PRINTS = [
  { value: "단면", note: "기본 인쇄", unitDelta: 0 },
  { value: "양면", note: "앞뒤 인쇄", unitDelta: 500 },
] as const;

const HARDWARE = [
  { value: "D고리 실버", note: "가장 무난함", unitDelta: 250 },
  { value: "D고리 골드", note: "포인트 금속감", unitDelta: 320 },
  { value: "O링", note: "보조 연결", unitDelta: 120 },
  { value: "군번줄", note: "간단 부착", unitDelta: 180 },
] as const;

const PACKAGES = [
  { value: "OPP 6x8", note: "소형 포장", unitDelta: 40 },
  { value: "OPP 8x10", note: "표준 포장", unitDelta: 60 },
  { value: "클립 패키지", note: "전시형 포장", unitDelta: 240 },
] as const;

const SIZE_PRESETS = [
  { value: "40 x 40", work: "44 x 44", note: "기본 키링", unitDelta: 0 },
  { value: "50 x 50", work: "54 x 54", note: "큰 판형", unitDelta: 350 },
  { value: "60 x 40", work: "64 x 44", note: "가로형", unitDelta: 280 },
] as const;

const QUICK_PRESETS = [
  {
    name: "가장 많이 쓰는 기본조합",
    material: "투명",
    thickness: "3T",
    shape: "자유형",
    hole: "상단 중앙",
    print: "단면",
    hardware: "D고리 실버",
    packageType: "OPP 8x10",
    sizePreset: "40 x 40",
    quantity: 10,
  },
  {
    name: "지난번과 동일",
    material: "투명",
    thickness: "3T",
    shape: "자유형",
    hole: "좌상단",
    print: "양면",
    hardware: "D고리 골드",
    packageType: "클립 패키지",
    sizePreset: "50 x 50",
    quantity: 30,
  },
  {
    name: "VIP 빠른 견적",
    material: "오로라",
    thickness: "5T",
    shape: "자유형",
    hole: "상단 중앙",
    print: "양면",
    hardware: "D고리 골드",
    packageType: "클립 패키지",
    sizePreset: "60 x 40",
    quantity: 100,
  },
] as const;

const CUSTOMER_PATHS = [
  {
    title: "처음 방문",
    description: "기본조합으로 시작해서 작업대 흐름을 짧게 익힘",
    preset: "가장 많이 쓰는 기본조합",
  },
  {
    title: "자주 오는 손님",
    description: "지난번과 동일 조합을 즉시 불러와 수량만 바꿈",
    preset: "지난번과 동일",
  },
  {
    title: "하이 레벨",
    description: "자재·두께·인쇄·홀 위치를 세부 제어",
    preset: "가장 많이 쓰는 기본조합",
  },
  {
    title: "VIP / 대량",
    description: "빠른 견적, 저장된 스펙, 대량 수량 입력 우선",
    preset: "VIP 빠른 견적",
  },
] as const;

function OptionGroup({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: readonly { value: string; note: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const active = selected === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelect(item.value)}
              className={[
                "rounded-2xl border px-3 py-3 text-left transition",
                active
                  ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-50"
                  : "border-white/10 bg-black/20 text-white/75 hover:border-white/20 hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold">{item.value}</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{item.note}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function KeyringWorkbenchPage() {
  const [systemMode, setSystemMode] = useState<(typeof SYSTEM_MODES)[number]>("작업대 바로가기");
  const [activeZone, setActiveZone] = useState<(typeof ZONES)[number]["key"]>("workbench");
  const [material, setMaterial] = useState<string>("투명");
  const [thickness, setThickness] = useState<string>("3T");
  const [shape, setShape] = useState<string>("자유형");
  const [hole, setHole] = useState<string>("상단 중앙");
  const [printType, setPrintType] = useState<string>("단면");
  const [hardware, setHardware] = useState<string>("D고리 실버");
  const [packageType, setPackageType] = useState<string>("OPP 8x10");
  const [sizePreset, setSizePreset] = useState<string>("40 x 40");
  const [quantity, setQuantity] = useState<number>(10);

  const activeZoneInfo = ZONES.find((zone) => zone.key === activeZone) ?? ZONES[1];
  const sizeInfo = SIZE_PRESETS.find((item) => item.value === sizePreset) ?? SIZE_PRESETS[0];

  const applyPreset = (presetName: string) => {
    const preset = QUICK_PRESETS.find((item) => item.name === presetName);
    if (!preset) return;

    setMaterial(preset.material);
    setThickness(preset.thickness);
    setShape(preset.shape);
    setHole(preset.hole);
    setPrintType(preset.print);
    setHardware(preset.hardware);
    setPackageType(preset.packageType);
    setSizePreset(preset.sizePreset);
    setQuantity(preset.quantity);
    setActiveZone("workbench");
    setSystemMode("작업대 바로가기");
  };

  const pricing = useMemo(() => {
    const materialDelta = MATERIALS.find((item) => item.value === material)?.unitDelta ?? 0;
    const thicknessDelta = THICKNESS.find((item) => item.value === thickness)?.unitDelta ?? 0;
    const shapeDelta = SHAPES.find((item) => item.value === shape)?.unitDelta ?? 0;
    const holeDelta = HOLES.find((item) => item.value === hole)?.unitDelta ?? 0;
    const printDelta = PRINTS.find((item) => item.value === printType)?.unitDelta ?? 0;
    const hardwareDelta = HARDWARE.find((item) => item.value === hardware)?.unitDelta ?? 0;
    const packageDelta = PACKAGES.find((item) => item.value === packageType)?.unitDelta ?? 0;
    const sizeDelta = SIZE_PRESETS.find((item) => item.value === sizePreset)?.unitDelta ?? 0;

    const unitPrice = 2200 + materialDelta + thicknessDelta + shapeDelta + holeDelta + printDelta + hardwareDelta + packageDelta + sizeDelta;
    const subtotal = unitPrice * quantity;
    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;

    return {
      unitPrice,
      subtotal,
      vat,
      total,
      productCode: ["KEYRING", material, thickness, shape, hole.replace(/\s+/g, ""), hardware.replace(/\s+/g, ""), sizePreset.replace(/\s+/g, "")]
        .join("-")
        .replace(/[^\w가-힣-]/g, ""),
    };
  }, [material, thickness, shape, hole, printType, hardware, packageType, sizePreset, quantity]);

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO KEYRING WORKBENCH</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                작업대 중심으로 만들고,
                <br />
                보고 싶은 사람은 둘러보게 한다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                CB Mall의 키링 페이지는 일반 인쇄몰 상세페이지가 아니라 작업대 기반 주문 화면입니다.
                자재칸에서 아크릴을 가져오고, 부자재칸에서 고리와 포장을 가져와 완성합니다.
                처음 온 손님은 둘러보기로 흐름을 익히고, 자주 오는 손님은 바로 작업대에서 빠르게 끝낼 수 있습니다.
              </p>
              <div className="flex flex-wrap gap-3">
                {SYSTEM_MODES.map((mode) => {
                  const active = mode === systemMode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSystemMode(mode)}
                      className={[
                        "rounded-full border px-5 py-3 text-sm font-semibold transition",
                        active
                          ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                          : "border-white/15 text-white/75 hover:border-white/30 hover:bg-white/[0.05] hover:text-white",
                      ].join(" ")}
                    >
                      {mode}
                    </button>
                  );
                })}
                <Link href="/storage" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  서랍 열기
                </Link>
                <Link href="/orders" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  주문 확인
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">빠른 시작</p>
              <div className="mt-4 space-y-3">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.name)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    <p className="text-sm font-semibold text-white">{preset.name}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      {preset.material} {preset.thickness} · {preset.shape} · {preset.hardware} · {preset.packageType} · {preset.quantity}개
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">시간 손실 줄이기</p>
              <h2 className="mt-2 text-2xl font-bold text-white">손님 유형별 빠른 경로</h2>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
              지금 선택 조합: <span className="font-semibold">{pricing.productCode}</span>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-4">
            {CUSTOMER_PATHS.map((path) => (
              <button
                key={path.title}
                type="button"
                onClick={() => applyPreset(path.preset)}
                className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-semibold text-white">{path.title}</p>
                <p className="mt-2 text-xs leading-6 text-white/60">{path.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">{path.preset}</p>
              </button>
            ))}
          </div>
        </section>

        {systemMode === "둘러보기" ? (
          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">둘러보기 모드</p>
                <h2 className="mt-2 text-2xl font-bold text-white">시선을 돌려 공방의 흐름을 먼저 이해</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">
                  장면전환은 기본 강제가 아니라 선택형입니다. 처음 오는 손님은 공방 구조를 이해하고,
                  익숙해지면 언제든 작업대 바로가기로 전환할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSystemMode("작업대 바로가기")}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
              >
                바로 작업대로 전환
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {ZONES.map((zone, index) => {
                const active = zone.key === activeZone;
                return (
                  <button
                    key={zone.key}
                    type="button"
                    onClick={() => setActiveZone(zone.key)}
                    className={[
                      "rounded-[24px] border p-5 text-left transition",
                      active
                        ? "border-cyan-400/30 bg-cyan-400/12"
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Scene {index + 1}</p>
                    <p className="mt-3 text-lg font-bold text-white">{zone.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/60">{zone.description}</p>
                    <div className="mt-5 h-32 rounded-[20px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4">
                      <div className="flex h-full items-end justify-between gap-3">
                        <div className="flex flex-col gap-2">
                          <span className="h-4 w-20 rounded-full bg-white/10" />
                          <span className="h-4 w-14 rounded-full bg-white/10" />
                          <span className="h-4 w-24 rounded-full bg-white/10" />
                        </div>
                        <div className="h-20 w-20 rounded-[22px] border border-cyan-400/20 bg-cyan-400/10" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">현재 시선</p>
              <h3 className="mt-2 text-xl font-bold text-white">{activeZoneInfo.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/65">{activeZoneInfo.description}</p>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">자재칸</p>
                <h2 className="mt-2 text-xl font-bold text-white">아크릴 가져오기</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveZone("materials")}
                className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
              >
                포커스
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <OptionGroup title="자재" items={MATERIALS} selected={material} onSelect={setMaterial} />
              <OptionGroup title="두께" items={THICKNESS} selected={thickness} onSelect={setThickness} />
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">현재 자재 메모</p>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  {material} {thickness} 원판이 작업대에 올라갈 준비가 되어 있습니다.
                  현재 추천은 키링 표준인 3T 기준이며, {material === "오로라" ? "표면 포인트" : "생산 안정성"} 중심으로 계산됩니다.
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">작업대</p>
                <h2 className="mt-2 text-2xl font-bold text-white">자재 + 부자재를 조합해 제품 완성</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">
                  중앙 작업대는 실제 선택 상태를 보여주는 핵심 화면입니다.
                  자재칸에서 가져온 아크릴과 부자재칸에서 가져온 고리/포장이 같은 상태값을 공유합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveZone("workbench")}
                className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
              >
                작업대 포커스
              </button>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[26px] border border-white/10 bg-[#0b0f16] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Workbench Preview</p>
                    <p className="mt-2 text-sm text-white/60">실사 이미지를 붙이지 않고 선택 상태만 시그니처 형태로 표현</p>
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-50">
                    {shape} · {sizePreset}
                  </div>
                </div>

                <div className="mt-5 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6">
                  <div className="flex min-h-[260px] items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <div
                        className={[
                          "border-2 border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.15)]",
                          shape === "원형" ? "h-56 w-56 rounded-full" : "",
                          shape === "사각형" ? "h-56 w-56 rounded-[28px]" : "",
                          shape === "자유형" ? "h-60 w-56 rounded-[42px_56px_46px_48px]" : "",
                        ].join(" ")}
                      />
                      <div
                        className={[
                          "absolute h-7 w-7 rounded-full border-2 border-white/80 bg-[#090b10]",
                          hole === "상단 중앙" ? "-top-3 left-1/2 -translate-x-1/2" : "",
                          hole === "좌상단" ? "left-6 top-2" : "",
                          hole === "우상단" ? "right-6 top-2" : "",
                        ].join(" ")}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/75">{printType}</p>
                        <p className="text-2xl font-bold text-white">{material}</p>
                        <p className="text-sm text-white/65">{thickness} · {hardware}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/45">재단사이즈</p>
                      <p className="mt-2 text-base font-semibold text-white">{sizePreset}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/45">작업사이즈</p>
                      <p className="mt-2 text-base font-semibold text-white">{sizeInfo.work}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/45">포장</p>
                      <p className="mt-2 text-base font-semibold text-white">{packageType}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <OptionGroup title="형태" items={SHAPES} selected={shape} onSelect={setShape} />
                <OptionGroup title="홀 위치" items={HOLES} selected={hole} onSelect={setHole} />
                <OptionGroup title="인쇄" items={PRINTS} selected={printType} onSelect={setPrintType} />

                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">사이즈 프리셋</p>
                  <div className="mt-3 grid gap-2">
                    {SIZE_PRESETS.map((item) => {
                      const active = item.value === sizePreset;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setSizePreset(item.value)}
                          className={[
                            "rounded-2xl border px-4 py-3 text-left transition",
                            active
                              ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-50"
                              : "border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.08]",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">{item.value}</p>
                            <span className="text-xs text-white/45">{item.work}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-white/55">{item.note}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">부자재칸</p>
                <h2 className="mt-2 text-xl font-bold text-white">고리 / 포장 / 주문 요약</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveZone("hardware")}
                className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
              >
                포커스
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <OptionGroup title="고리" items={HARDWARE} selected={hardware} onSelect={setHardware} />
              <OptionGroup title="포장" items={PACKAGES} selected={packageType} onSelect={setPackageType} />

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">수량</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-white/75 transition hover:border-white/30 hover:text-white"
                  >
                    −
                  </button>
                  <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-lg font-semibold text-white">
                    {quantity}개
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-white/75 transition hover:border-white/30 hover:text-white"
                  >
                    +
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[10, 30, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuantity(count)}
                      className={[
                        "rounded-full border px-3 py-2 text-xs font-semibold transition",
                        quantity === count
                          ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-50"
                          : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
                      ].join(" ")}
                    >
                      {count}개
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">주문 요약</p>
                <div className="mt-4 space-y-3 text-sm text-cyan-50">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">제품 코드</p>
                    <p className="mt-2 break-all text-base font-semibold">{pricing.productCode}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">개당</p>
                      <p className="mt-2 font-semibold">{pricing.unitPrice.toLocaleString()}원</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">수량</p>
                      <p className="mt-2 font-semibold">{quantity.toLocaleString()}개</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">소계</p>
                      <p className="mt-2 font-semibold">{pricing.subtotal.toLocaleString()}원</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">부가세</p>
                      <p className="mt-2 font-semibold">{pricing.vat.toLocaleString()}원</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/20 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">총액</p>
                    <p className="mt-2 text-2xl font-bold">{pricing.total.toLocaleString()}원</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setActiveZone("finish")}
                  className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  서랍에 저장
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("지난번과 동일")}
                  className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  지난번과 동일 불러오기
                </button>
                <Link
                  href="/orders"
                  className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  주문으로 넘기기
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}