"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Zone = {
  key: "overview" | "materials" | "workbench" | "hardware" | "completed" | "production";
  title: string;
  description: string;
};

type ChoiceRowProps = {
  title: string;
  items: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
};

type RackItem = {
  label: string;
  stock: string;
  note: string;
};

type BinItem = {
  label: string;
  count: number;
};

const ZONES: Zone[] = [
  { key: "overview", title: "전체 흐름", description: "홈에서 제작으로 들어온 뒤 자재·작업대·부자재·제작완료까지 끊기지 않게 보는 허브" },
  { key: "materials", title: "자재 존", description: "아크릴 원판, 두께, 색상, 인쇄 전 준비 상태를 선택하는 구역" },
  { key: "workbench", title: "작업대", description: "실사 이미지 대신 실제 선택 상태가 바뀌는 핵심 조립 인터랙션" },
  { key: "hardware", title: "부자재 존", description: "D고리, O링, 군번줄, OPP 규격을 고르는 결합/포장 구역" },
  { key: "completed", title: "제작완료", description: "완료품 보관함과 재고 상태를 확인하는 구역" },
  { key: "production", title: "생산라인", description: "제작대기 → 작업중 → 검수 → 제작완료 흐름을 추적하는 구역" },
];

const MATERIAL_TYPES = ["투명", "백색"] as const;
const THICKNESS = ["2T", "3T", "5T", "6T"] as const;
const PRODUCT_TYPES = ["키링", "아크릴 스탠드", "POP"] as const;
const HARDWARE_TYPES = ["D고리", "O링", "군번줄"] as const;
const PACKAGE_TYPES = ["OPP 6x8", "OPP 8x10", "OPP 10x15"] as const;
const PRODUCTION_STATES = ["제작대기", "작업중", "검수", "제작완료"] as const;

const MATERIAL_RACK: RackItem[] = [
  { label: "2T", stock: "충분", note: "얇은 키링/참 장식용" },
  { label: "3T", stock: "핵심", note: "현재 기본 키링 메인 자재" },
  { label: "5T", stock: "보통", note: "두꺼운 스탠드/POP용" },
  { label: "백색", stock: "보통", note: "불투명 인쇄/배경용" },
];

const HARDWARE_DRAWERS: RackItem[] = [
  { label: "D고리", stock: "1,200개", note: "기본 선택" },
  { label: "O링", stock: "2,800개", note: "연결 부자재" },
  { label: "군번줄", stock: "430개", note: "대체 부자재" },
  { label: "OPP 6x8", stock: "900매", note: "소형 포장" },
  { label: "OPP 8x10", stock: "1,400매", note: "기본 포장" },
  { label: "OPP 10x15", stock: "600매", note: "대형 포장" },
];

const COMPLETED_BINS: BinItem[] = [
  { label: "제작대기", count: 14 },
  { label: "작업중", count: 9 },
  { label: "검수", count: 6 },
  { label: "제작완료", count: 22 },
];

const CHECKLIST = [
  "자재와 두께를 먼저 선택한다",
  "작업대에서 제품 유형을 정한다",
  "부자재와 포장 규격을 결합한다",
  "생산 상태를 업데이트한다",
] as const;

function ChoiceRow({ title, items, selected, onSelect }: ChoiceRowProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = item === selected;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={[
                "rounded-full border px-3 py-2 text-sm transition",
                active
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-100"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function WorkshopFlowPage() {
  const [activeZone, setActiveZone] = useState<Zone["key"]>("workbench");
  const [productType, setProductType] = useState<string>("키링");
  const [materialType, setMaterialType] = useState<string>("투명");
  const [thickness, setThickness] = useState<string>("3T");
  const [hardwareType, setHardwareType] = useState<string>("D고리");
  const [packageType, setPackageType] = useState<string>("OPP 8x10");
  const [productionState, setProductionState] = useState<string>("제작대기");

  const activeZoneInfo = ZONES.find((zone) => zone.key === activeZone) ?? ZONES[0];

  const summary = useMemo(() => {
    const productCode = [productType, materialType, thickness, hardwareType.replace(/\s+/g, ""), packageType.replace(/\s+/g, "")]
      .join("-")
      .replace(/[^\w가-힣-]/g, "");

    const nextActionMap: Record<Zone["key"], string> = {
      overview: "각 구역을 눌러 실제 제작 흐름을 단계별로 점검하세요.",
      materials: "원판과 두께를 먼저 확정한 뒤 작업대로 이동하세요.",
      workbench: "제품 유형과 자재 조합이 맞는지 확인하고 부자재를 결합하세요.",
      hardware: "고리와 포장 규격을 확정한 뒤 생산 상태를 올리세요.",
      completed: "완료 서랍과 재주문 보관 상태를 확인하세요.",
      production: "제작대기 → 작업중 → 검수 → 제작완료 흐름을 갱신하세요.",
    };

    return {
      productCode,
      nextAction: nextActionMap[activeZone],
    };
  }, [activeZone, productType, materialType, thickness, hardwareType, packageType]);

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO WORKSHOP</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                공방 사진을 붙이는 대신
                <br />
                작업 흐름을 직접 누르는 허브로 바꾼다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                참고 이미지는 톤과 동선 참고용으로만 두고, 실제 화면은 자재 → 작업대 → 부자재 → 제작완료를
                클릭 가능한 상태로 연결합니다. 이 페이지는 장식용 갤러리가 아니라 실제 선택값이 바뀌는 인터랙션 허브입니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/workbench/keyring" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  제작으로 이동
                </Link>
                <Link href="/storage" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
                  서랍 열기
                </Link>
                <Link href="/orders" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
                  주문 보기
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">현재 조합</p>
              <div className="mt-4 space-y-3 text-sm text-white/80">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">제품 코드</p>
                  <p className="mt-2 text-base font-semibold text-white">{summary.productCode}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">제품</p>
                    <p className="mt-2 font-semibold text-white">{productType}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">자재</p>
                    <p className="mt-2 font-semibold text-white">{materialType} {thickness}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">부자재</p>
                    <p className="mt-2 font-semibold text-white">{hardwareType}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">포장</p>
                    <p className="mt-2 font-semibold text-white">{packageType}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">다음 액션</p>
                  <p className="mt-2 text-sm font-medium text-cyan-50">{summary.nextAction}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">구역 선택</p>
            <div className="mt-4 space-y-3">
              {ZONES.map((zone) => {
                const active = zone.key === activeZone;
                return (
                  <button
                    key={zone.key}
                    type="button"
                    onClick={() => setActiveZone(zone.key)}
                    className={[
                      "w-full rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-cyan-400/30 bg-cyan-400/12"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold text-white">{zone.title}</p>
                    <p className="mt-2 text-xs leading-6 text-white/60">{zone.description}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">활성 구역</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{activeZoneInfo.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">{activeZoneInfo.description}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                생산 상태 <span className="ml-2 font-semibold text-white">{productionState}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[24px] border border-white/10 bg-[#0d1018] p-5">
                <div className="grid gap-5 xl:grid-cols-2">
                  <ChoiceRow title="제품 유형" items={PRODUCT_TYPES} selected={productType} onSelect={setProductType} />
                  <ChoiceRow title="자재 색상" items={MATERIAL_TYPES} selected={materialType} onSelect={setMaterialType} />
                  <ChoiceRow title="두께" items={THICKNESS} selected={thickness} onSelect={setThickness} />
                  <ChoiceRow title="부자재" items={HARDWARE_TYPES} selected={hardwareType} onSelect={setHardwareType} />
                  <ChoiceRow title="포장 규격" items={PACKAGE_TYPES} selected={packageType} onSelect={setPackageType} />
                  <ChoiceRow title="생산 상태" items={PRODUCTION_STATES} selected={productionState} onSelect={setProductionState} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">자재 랙</p>
                  <div className="mt-4 space-y-3">
                    {MATERIAL_RACK.map((item) => {
                      const active = item.label === thickness || item.label === materialType;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setActiveZone("materials");
                            if ((THICKNESS as readonly string[]).includes(item.label)) setThickness(item.label);
                            if ((MATERIAL_TYPES as readonly string[]).includes(item.label)) setMaterialType(item.label);
                          }}
                          className={[
                            "w-full rounded-2xl border p-3 text-left transition",
                            active
                              ? "border-cyan-400/30 bg-cyan-400/10"
                              : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-white">{item.label}</p>
                            <span className="text-xs text-white/45">{item.stock}</span>
                          </div>
                          <p className="mt-2 text-xs leading-6 text-white/60">{item.note}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">부자재 서랍</p>
                  <div className="mt-4 space-y-3">
                    {HARDWARE_DRAWERS.map((item) => {
                      const active = item.label === hardwareType || item.label === packageType;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setActiveZone("hardware");
                            if ((HARDWARE_TYPES as readonly string[]).includes(item.label)) setHardwareType(item.label);
                            if ((PACKAGE_TYPES as readonly string[]).includes(item.label)) setPackageType(item.label);
                          }}
                          className={[
                            "w-full rounded-2xl border p-3 text-left transition",
                            active
                              ? "border-cyan-400/30 bg-cyan-400/10"
                              : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-white">{item.label}</p>
                            <span className="text-xs text-white/45">{item.stock}</span>
                          </div>
                          <p className="mt-2 text-xs leading-6 text-white/60">{item.note}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">제작 체크리스트</p>
                  <div className="mt-4 space-y-3">
                    {CHECKLIST.map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (index === 0) setActiveZone("materials");
                          if (index === 1) setActiveZone("workbench");
                          if (index === 2) setActiveZone("hardware");
                          if (index === 3) setActiveZone("production");
                        }}
                        className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200">
                          {index + 1}
                        </span>
                        <span className="text-sm leading-6 text-white/75">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">보관 / 생산 큐</p>
            <div className="mt-4 space-y-3">
              {COMPLETED_BINS.map((bin) => {
                const active = bin.label === productionState;
                return (
                  <button
                    key={bin.label}
                    type="button"
                    onClick={() => {
                      setActiveZone(bin.label === "제작완료" ? "completed" : "production");
                      setProductionState(bin.label);
                    }}
                    className={[
                      "w-full rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-cyan-400/30 bg-cyan-400/12"
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{bin.label}</p>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">{bin.count}건</span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-white/55">
                      {bin.label === "제작완료" ? "완료 보관함 / 재주문 연동 대기" : "현재 생산 흐름에서 확인해야 할 상태"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">즉시 이동</p>
              <div className="mt-4 space-y-3">
                <Link href="/workbench/keyring" className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 transition hover:border-white/20 hover:bg-white/[0.05]">
                  <span>키링 작업대로 이동</span>
                  <span className="text-cyan-200">열기</span>
                </Link>
                <Link href="/storage" className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 transition hover:border-white/20 hover:bg-white/[0.05]">
                  <span>보관함 / 서랍 열기</span>
                  <span className="text-cyan-200">열기</span>
                </Link>
                <Link href="/orders" className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 transition hover:border-white/20 hover:bg-white/[0.05]">
                  <span>주문 / 생산 큐 확인</span>
                  <span className="text-cyan-200">열기</span>
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}