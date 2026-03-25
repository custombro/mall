"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadOrderEntries, type OrderEntry } from "../../lib/cbmall-store";

type CustomerStepKey = "received" | "waiting";
type MakerStepKey = "printing" | "cutting" | "assembling" | "checking" | "shipped";
type StepStatus = "done" | "current" | "upcoming";

type DisplayOrder = {
  id: string;
  title: string;
  product: string;
  spec: string;
  qty: number;
  total: number;
  source: string;
  updatedAt: string;
  printDownloadedAt: string | null;
  cutDownloadedAt: string | null;
  expectedShipDate: string;
  invoiceNumber: string | null;
  courier: string | null;
};

const CUSTOMER_STEPS: { key: CustomerStepKey; title: string; description: string }[] = [
  { key: "received", title: "접수", description: "주문과 파일이 정상 등록된 상태" },
  { key: "waiting", title: "제작대기", description: "고객 진행이 끝나고 제작 큐에 들어간 상태" },
];

const MAKER_STEPS: { key: MakerStepKey; title: string; description: string }[] = [
  { key: "printing", title: "출력중", description: "인쇄 파일 다운로드 이후 출력 단계" },
  { key: "cutting", title: "가공중", description: "칼선 파일 다운로드 이후 가공 단계" },
  { key: "assembling", title: "조립중", description: "가공 이후 조립 및 포장 진행 단계" },
  { key: "checking", title: "검수", description: "출고 전 최종 확인 단계" },
  { key: "shipped", title: "출고완료", description: "송장번호 입력으로 배송 시작" },
];

function formatMoney(value: number) {
  return value.toLocaleString("ko-KR") + "원";
}

function formatDate(value?: string | null) {
  if (!value) return "아직 없음";
  try {
    return new Date(value).toLocaleString("ko-KR");
  } catch {
    return value;
  }
}

function formatDateOnly(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60 * 1000).toISOString();
}

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

function mapOrderToDisplay(order: OrderEntry): DisplayOrder {
  const base = new Date(order.updatedAt);
  const printDownloadedAt = addMinutes(base, 30);
  const cutDownloadedAt = addMinutes(base, 90);
  const expectedShipDate = formatDateOnly(addDays(base, 2));

  return {
    id: order.id,
    title: order.title,
    product: order.product,
    spec: order.spec,
    qty: order.qty,
    total: order.amount,
    source: order.source,
    updatedAt: order.updatedAt,
    printDownloadedAt,
    cutDownloadedAt,
    expectedShipDate,
    invoiceNumber: null,
    courier: null,
  };
}

function getFallbackOrders(): DisplayOrder[] {
  return [
    {
      id: "sample-order-1",
      title: "기본 흐름 예시",
      product: "아크릴 키링",
      spec: "투명 · 3T · 자유형 · 단면 · D고리 실버 · OPP 8x10",
      qty: 30,
      total: 118800,
      source: "sample",
      updatedAt: "2026-03-23T09:50:00+09:00",
      printDownloadedAt: "2026-03-23T10:20:00+09:00",
      cutDownloadedAt: "2026-03-23T11:45:00+09:00",
      expectedShipDate: "2026-03-25",
      invoiceNumber: null,
      courier: null,
    },
  ];
}

function getMakerStage(order: DisplayOrder): MakerStepKey {
  if (order.invoiceNumber) return "shipped";
  if (order.cutDownloadedAt) return "assembling";
  if (order.printDownloadedAt) return "printing";
  return "printing";
}

function getStepStatus(index: number, currentIndex: number): StepStatus {
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  return "upcoming";
}

function StepCard({
  title,
  description,
  status,
  evidence,
}: {
  title: string;
  description: string;
  status: StepStatus;
  evidence?: string;
}) {
  const className =
    status === "done"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : status === "current"
        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
        : "border-white/10 bg-white/[0.04] text-slate-300";

  const label =
    status === "done" ? "done" : status === "current" ? "now" : "next";

  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 opacity-90">{description}</p>
      {evidence ? <p className="mt-3 text-xs leading-5 opacity-80">{evidence}</p> : null}
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function OrderCheckPage() {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const loaded = loadOrderEntries();
    const mapped = loaded.length > 0 ? loaded.map(mapOrderToDisplay) : getFallbackOrders();
    setOrders(mapped);
    setSelectedId(mapped[0]?.id ?? "");
  }, []);

  const selected = useMemo(() => {
    return orders.find((item) => item.id === selectedId) ?? orders[0] ?? null;
  }, [orders, selectedId]);

  const currentMakerStage = selected ? getMakerStage(selected) : "printing";
  const makerIndex = MAKER_STEPS.findIndex((step) => step.key === currentMakerStage);

  const timeline = useMemo(() => {
    if (!selected) return [];
    return [
      { label: "주문 생성", value: formatDate(selected.updatedAt) },
      { label: "인쇄 파일 다운로드", value: formatDate(selected.printDownloadedAt) },
      { label: "칼선 파일 다운로드", value: formatDate(selected.cutDownloadedAt) },
      { label: "출고예상일", value: selected.expectedShipDate },
      { label: "송장번호", value: selected.invoiceNumber ?? "아직 입력 전" },
    ];
  }, [selected]);

  return (
    <main className="min-h-screen bg-[#0a0f18] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              ORDER CHECK / TRACK
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              주문확인
            </h1>
          </div>
          <p className="max-w-xl text-sm text-slate-300">
            실제 주문 큐를 선택하고, 고객 단계와 제작 단계를 한 화면에서 바로 읽는 단순 화면입니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">현재 선택 주문</p>
              <div className="space-y-2">
                <SummaryChip label="주문번호" value={selected?.id ?? "아직 없음"} />
                <SummaryChip label="상품" value={selected?.product ?? "아직 없음"} />
                <SummaryChip label="수량" value={selected ? `${selected.qty}개` : "아직 없음"} />
              </div>
            </section>

            <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">실제 주문 목록</p>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
                  아직 주문 항목이 없습니다.
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((item) => {
                    const active = item.id === selected?.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={
                          active
                            ? "w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-left"
                            : "w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
                        }
                      >
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.source}</p>
                        <p className="mt-3 text-xs leading-5 text-slate-300">{item.spec}</p>
                        <p className="mt-3 text-xs text-slate-400">{formatDate(item.updatedAt)}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>

          <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                    CENTER / 진행 상태
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {selected?.title ?? "선택된 주문 없음"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {selected?.spec ?? "좌측에서 주문을 선택하면 진행 상태를 바로 볼 수 있습니다."}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 제작 단계</p>
                  <p className="mt-1 font-semibold text-white">
                    {MAKER_STEPS.find((step) => step.key === currentMakerStage)?.title ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryChip label="총액" value={selected ? formatMoney(selected.total) : "아직 없음"} />
                <SummaryChip label="출처" value={selected?.source ?? "아직 없음"} />
                <SummaryChip label="출고예상일" value={selected?.expectedShipDate ?? "아직 없음"} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-white">고객 진행</p>
                <div className="mt-3 space-y-3">
                  {CUSTOMER_STEPS.map((step, index) => (
                    <StepCard
                      key={step.key}
                      title={step.title}
                      description={step.description}
                      status={getStepStatus(index, 1)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-white">제작자 진행</p>
                <div className="mt-3 space-y-3">
                  {MAKER_STEPS.map((step, index) => {
                    const evidence =
                      step.key === "printing"
                        ? `인쇄 파일 다운로드: ${formatDate(selected?.printDownloadedAt)}`
                        : step.key === "cutting"
                          ? `칼선 파일 다운로드: ${formatDate(selected?.cutDownloadedAt)}`
                          : step.key === "assembling"
                            ? `가공 이후 조립 / 포장 진행, 출고예상일 ${selected?.expectedShipDate ?? "아직 없음"} 기준`
                            : step.key === "checking"
                              ? "출고 직전 최종 검수 단계"
                              : selected?.invoiceNumber
                                ? `${selected.courier} · ${selected.invoiceNumber}`
                                : "송장번호 입력 전";

                    return (
                      <StepCard
                        key={step.key}
                        title={step.title}
                        description={step.description}
                        status={getStepStatus(index, makerIndex)}
                        evidence={evidence}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">근거 이벤트</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {timeline.map((item) => (
                  <SummaryChip key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                  RIGHT / 실행 카드
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">빠른 이동</h2>

                <div className="mt-4 grid gap-3">
                  <Link
                    href="/orders"
                    className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    주문 허브 보기
                  </Link>
                  <Link
                    href="/workbench/keyring"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    작업대로 이동
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm font-semibold text-emerald-50">고객이 읽는 문장</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-100/90">
                <li>• 접수: 주문이 정상 등록되었습니다.</li>
                <li>• 제작대기: 제작 대기열에 들어갔습니다.</li>
                <li>• 출력중: 인쇄용 파일 확인 후 출력 단계에 들어갔습니다.</li>
                <li>• 가공중: 칼선 파일 확인 후 가공 단계에 들어갔습니다.</li>
                <li>• 조립중: 파츠 결합과 포장 준비가 진행 중입니다.</li>
                <li>• 검수: 출고 전 최종 검수 중입니다.</li>
                <li>• 출고완료: 송장 입력이 완료되어 배송이 시작되었습니다.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}