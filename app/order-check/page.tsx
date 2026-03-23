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

function toDate(dateText: string) {
  return new Date(`${dateText}T00:00:00+09:00`);
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

  const now = new Date("2026-03-23T14:00:00+09:00");
  const expected = toDate(order.expectedShipDate);

  if (order.cutDownloadedAt) {
    const diffDays = Math.ceil((expected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return "checking";
    return "assembling";
  }

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
  return (
    <div
      className={[
        "rounded-[22px] border p-4 transition",
        status === "done" ? "border-emerald-400/25 bg-emerald-400/10" : "",
        status === "current" ? "border-cyan-400/30 bg-cyan-400/12" : "",
        status === "upcoming" ? "border-white/10 bg-black/20" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span
          className={[
            "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            status === "done" ? "bg-emerald-400/15 text-emerald-200" : "",
            status === "current" ? "bg-cyan-400/15 text-cyan-100" : "",
            status === "upcoming" ? "bg-white/10 text-white/45" : "",
          ].join(" ")}
        >
          {status === "done" ? "done" : status === "current" ? "now" : "next"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
      {evidence ? <p className="mt-3 text-xs leading-5 text-cyan-200/75">{evidence}</p> : null}
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

  const selected = orders.find((item) => item.id === selectedId) ?? orders[0];
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
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO ORDER CHECK</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                실제 주문 큐를 선택해
                <br />
                고객 진행과 제작자 진행을 함께 읽는다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                이제 주문확인은 샘플 시나리오 버튼이 아니라 실제 주문 큐를 기준으로 움직입니다.
                왼쪽에서 주문을 선택하면, 오른쪽에서 고객 진행 / 제작자 진행 / 근거 이벤트를 바로 읽을 수 있습니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/orders" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  주문 허브 보기
                </Link>
                <Link href="/workbench/keyring" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  작업대로 이동
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">현재 선택 주문</p>
              <div className="mt-4 space-y-3 text-sm text-white/80">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">주문번호</p>
                  <p className="mt-2 break-all text-base font-semibold text-white">{selected?.id ?? "아직 없음"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">스펙</p>
                  <p className="mt-2 text-sm leading-6 text-white">{selected?.spec ?? "아직 없음"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">상품</p>
                    <p className="mt-2 font-semibold text-white">{selected?.product ?? "아직 없음"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">수량</p>
                    <p className="mt-2 font-semibold text-white">{selected ? `${selected.qty}개` : "아직 없음"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">총액</p>
                    <p className="mt-2 font-semibold text-white">{selected ? formatMoney(selected.total) : "아직 없음"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">출처</p>
                    <p className="mt-2 font-semibold text-white">{selected?.source ?? "아직 없음"}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">현재 제작 단계</p>
                  <p className="mt-2 text-sm font-medium text-cyan-50">
                    {MAKER_STEPS.find((step) => step.key === currentMakerStage)?.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_0.95fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">실제 주문 목록</p>
            <div className="mt-4 space-y-3">
              {orders.map((item) => {
                const active = item.id === selected?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={[
                      "w-full rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-cyan-400/30 bg-cyan-400/10"
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-300/80">{item.source}</p>
                    <p className="mt-3 text-xs leading-5 text-white/60">{item.spec}</p>
                    <p className="mt-3 text-xs text-white/45">{formatDate(item.updatedAt)}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">고객 진행</p>
                <h2 className="mt-2 text-2xl font-bold text-white">고객이 끝낸 단계</h2>
              </div>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/12 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                완료 기준 고정
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {CUSTOMER_STEPS.map((step, index) => (
                <StepCard
                  key={step.key}
                  title={step.title}
                  description={step.description}
                  status={getStepStatus(index, 1)}
                  evidence={
                    step.key === "received"
                      ? `주문 생성: ${formatDate(selected?.updatedAt)}`
                      : "고객 선택/업로드 종료 후 제작 큐 진입"
                  }
                />
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">제작자 진행</p>
                <h2 className="mt-2 text-2xl font-bold text-white">제작자의 실제 작업 흐름</h2>
              </div>
              <span className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                주문 큐 기준
              </span>
            </div>

            <div className="mt-5 space-y-4">
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
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">근거 이벤트</p>
            <div className="mt-4 space-y-3">
              {timeline.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">고객이 읽는 문장</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/70">
                <p>접수: 주문이 정상 등록되었습니다.</p>
                <p>제작대기: 제작 대기열에 들어갔습니다.</p>
                <p>출력중: 인쇄용 파일 확인 후 출력 단계에 들어갔습니다.</p>
                <p>가공중: 칼선 파일 확인 후 가공 단계에 들어갔습니다.</p>
                <p>조립중: 파츠 결합과 포장 준비가 진행 중입니다.</p>
                <p>검수: 출고 전 최종 검수 중입니다.</p>
                <p>출고완료: 송장 입력이 완료되어 배송이 시작되었습니다.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <Link href="/orders" className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                주문 허브로 이동
              </Link>
              <Link href="/workbench/keyring" className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                작업대로 돌아가기
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}