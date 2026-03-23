"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CustomerStepKey = "received" | "waiting";
type MakerStepKey = "printing" | "cutting" | "assembling" | "checking" | "shipped";

type StepStatus = "done" | "current" | "upcoming";

type OrderScenario = {
  key: string;
  title: string;
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

const ORDER_SCENARIOS: OrderScenario[] = [
  {
    key: "basic",
    title: "기본 흐름",
    printDownloadedAt: "2026-03-23 10:20",
    cutDownloadedAt: "2026-03-23 11:45",
    expectedShipDate: "2026-03-25",
    invoiceNumber: null,
    courier: null,
  },
  {
    key: "checking",
    title: "검수 직전",
    printDownloadedAt: "2026-03-21 09:10",
    cutDownloadedAt: "2026-03-21 10:00",
    expectedShipDate: "2026-03-23",
    invoiceNumber: null,
    courier: null,
  },
  {
    key: "shipped",
    title: "출고완료 예시",
    printDownloadedAt: "2026-03-19 08:40",
    cutDownloadedAt: "2026-03-19 09:30",
    expectedShipDate: "2026-03-21",
    invoiceNumber: "5784-1122-8899",
    courier: "CJ대한통운",
  },
];

function formatMoney(value: number) {
  return value.toLocaleString("ko-KR") + "원";
}

function toDate(dateText: string) {
  return new Date(`${dateText}T00:00:00+09:00`);
}

function getMakerStage(scenario: OrderScenario): MakerStepKey {
  if (scenario.invoiceNumber) return "shipped";

  const now = new Date("2026-03-23T14:00:00+09:00");
  const expected = toDate(scenario.expectedShipDate);

  if (scenario.cutDownloadedAt) {
    const diffDays = Math.ceil((expected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "checking";
    if (diffDays === 1) return "checking";
    return "assembling";
  }

  if (scenario.printDownloadedAt) return "printing";
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
  const [scenarioKey, setScenarioKey] = useState<string>("basic");
  const scenario = ORDER_SCENARIOS.find((item) => item.key === scenarioKey) ?? ORDER_SCENARIOS[0];

  const currentMakerStage = getMakerStage(scenario);
  const makerIndex = MAKER_STEPS.findIndex((step) => step.key === currentMakerStage);

  const timeline = useMemo(() => {
    return [
      { label: "인쇄 파일 다운로드", value: scenario.printDownloadedAt ?? "아직 없음" },
      { label: "칼선 파일 다운로드", value: scenario.cutDownloadedAt ?? "아직 없음" },
      { label: "출고예상일", value: scenario.expectedShipDate },
      { label: "송장번호", value: scenario.invoiceNumber ?? "아직 입력 전" },
    ];
  }, [scenario]);

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO ORDER CHECK</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                고객 진행과 제작자 진행을
                <br />
                한 화면에서 분리해 보여준다
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                접수와 제작대기까지는 고객 기준으로, 출력중 이후는 제작자 기준으로 흐릅니다.
                고객은 단순 상태명만 보는 것이 아니라 어떤 이벤트 때문에 현재 단계가 되었는지 함께 읽을 수 있어야 합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                {ORDER_SCENARIOS.map((item) => {
                  const active = item.key === scenarioKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setScenarioKey(item.key)}
                      className={[
                        "rounded-full border px-5 py-3 text-sm font-semibold transition",
                        active
                          ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                          : "border-white/15 text-white/75 hover:border-white/30 hover:bg-white/[0.05] hover:text-white",
                      ].join(" ")}
                    >
                      {item.title}
                    </button>
                  );
                })}
                <Link href="/workbench/keyring" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  작업대로 이동
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">주문 요약</p>
              <div className="mt-4 space-y-3 text-sm text-white/80">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">주문번호</p>
                  <p className="mt-2 text-base font-semibold text-white">CB-20260323-KEYRING-0142</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">상품</p>
                    <p className="mt-2 font-semibold text-white">아크릴 키링</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">수량</p>
                    <p className="mt-2 font-semibold text-white">30개</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">총액</p>
                    <p className="mt-2 font-semibold text-white">{formatMoney(118800)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">출고예상일</p>
                    <p className="mt-2 font-semibold text-white">{scenario.expectedShipDate}</p>
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_340px]">
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
                      ? "주문 생성 및 파일 업로드 완료"
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
                이벤트 기반 판정
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {MAKER_STEPS.map((step, index) => {
                const evidence =
                  step.key === "printing"
                    ? scenario.printDownloadedAt
                      ? `인쇄 파일 다운로드: ${scenario.printDownloadedAt}`
                      : "인쇄 파일 다운로드 대기"
                    : step.key === "cutting"
                    ? scenario.cutDownloadedAt
                      ? `칼선 파일 다운로드: ${scenario.cutDownloadedAt}`
                      : "칼선 파일 다운로드 전"
                    : step.key === "assembling"
                    ? `가공 이후 조립 / 포장 진행, 출고예상일 ${scenario.expectedShipDate} 기준`
                    : step.key === "checking"
                    ? "출고 직전 최종 검수 단계"
                    : scenario.invoiceNumber
                    ? `${scenario.courier} · ${scenario.invoiceNumber}`
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
                주문 목록으로 이동
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