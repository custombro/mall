"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  b2bChecklist,
  b2bProjects,
  b2bStages,
  getRouteLabel,
  getStageClass,
  type B2BStage,
} from "./b2b-config";

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function B2BClient() {
  const [stageFilter, setStageFilter] = useState<B2BStage | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(b2bProjects[0]?.id ?? "");

  const filteredProjects = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return b2bProjects.filter((project) => {
      const stageMatch = stageFilter === "전체" || project.stage === stageFilter;
      const keywordMatch =
        normalizedKeyword.length === 0 ||
        [
          project.title,
          project.clientType,
          project.quantityBand,
          project.summary,
          project.note,
          project.dueWindow,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      return stageMatch && keywordMatch;
    });
  }, [keyword, stageFilter]);

  useEffect(() => {
    if (!filteredProjects.length) {
      setSelectedProjectId("");
      return;
    }

    if (!filteredProjects.find((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(filteredProjects[0].id);
    }
  }, [filteredProjects, selectedProjectId]);

  const selectedProject = useMemo(
    () => filteredProjects.find((project) => project.id === selectedProjectId) ?? filteredProjects[0] ?? null,
    [filteredProjects, selectedProjectId],
  );

  const stageCounts = useMemo(() => {
    return b2bProjects.reduce<Record<string, number>>((acc, project) => {
      acc[project.stage] = (acc[project.stage] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const quantityBandSummary = useMemo(() => {
    return selectedProject?.quantityBand ?? "-";
  }, [selectedProject]);

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">진행 단계</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStageFilter("전체")}
              className={
                stageFilter === "전체"
                  ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-left"
                  : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-left transition hover:bg-white/10"
              }
            >
              <p className="text-sm font-semibold text-white">전체</p>
              <p className="mt-1 text-xs text-slate-400">모든 대량 주문 프로젝트 보기</p>
            </button>

            {b2bStages.map((stage) => {
              const active = stageFilter === stage;

              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={
                    active
                      ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-left"
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{stage}</span>
                    <span className="text-[11px] text-slate-300">{stageCounts[stage] ?? 0}건</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">검색</p>
          <label className="space-y-2 block">
            <span className="text-xs text-slate-400">프로젝트 / 거래처 / 납기</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="거래처, 프로젝트, 납기"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </section>
      </aside>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                CENTER / 프로젝트 선택
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedProject?.title ?? "대량 주문 프로젝트"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                일반 소비자 주문이 아니라, 수량 · 납기 · 자재 · 반복 발주 가능성을 먼저 읽는 운영 화면입니다.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 단계</p>
              <p className="mt-1 font-semibold text-white">{selectedProject?.stage ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryChip label="진행 프로젝트" value={`${filteredProjects.length}건`} />
            <SummaryChip label="수량 구간" value={quantityBandSummary} />
            <SummaryChip label="납기 구간" value={selectedProject?.dueWindow ?? "-"} />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">프로젝트 목록</p>

          {filteredProjects.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              현재 조건에 맞는 B2B 프로젝트가 없습니다.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {filteredProjects.map((project) => {
                const active = selectedProject?.id === project.id;

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectId(project.id)}
                    className={
                      active
                        ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                        : "rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getStageClass(project.stage)}`}>
                        {project.stage}
                      </span>
                      <span className="text-[11px] text-slate-300">{project.quantityBand}</span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-white">{project.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{project.clientType}</p>
                    <p className="mt-3 text-xs leading-5 text-slate-300">{project.summary}</p>
                    <p className="mt-3 text-xs text-slate-300">{project.dueWindow}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">선택 프로젝트 상세</p>

          {selectedProject ? (
            <div className="mt-3 grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${getStageClass(selectedProject.stage)}`}>
                  {selectedProject.stage}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedProject.clientType}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {selectedProject.quantityBand}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white">{selectedProject.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedProject.note}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryChip label="거래처 유형" value={selectedProject.clientType} />
                <SummaryChip label="수량 구간" value={selectedProject.quantityBand} />
                <SummaryChip label="납기 구간" value={selectedProject.dueWindow} />
                <SummaryChip label="추천 작업 공간" value={getRouteLabel(selectedProject.recommendedRoute)} />
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              프로젝트를 선택하면 상세가 표시됩니다.
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
            RIGHT / 체크 · 이동
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">실행 카드</h2>
        </div>

        <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">운영 체크</p>
          <div className="mt-3 space-y-2">
            {b2bChecklist.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">상태 분포</p>
          <div className="mt-3 grid gap-2">
            {Object.entries(stageCounts).map(([stage, count]) => (
              <div
                key={stage}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-slate-300">{stage}</span>
                <span className="font-semibold text-white">{count}건</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-3">
          {selectedProject ? (
            <Link
              href={selectedProject.recommendedRoute}
              className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              추천 작업 공간으로 이동
            </Link>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 px-4 py-3 text-center text-sm text-slate-500">
              선택된 프로젝트 없음
            </div>
          )}

          <Link
            href="/storage"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            보관함 보기
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            홈 허브로 이동
          </Link>
        </div>
      </aside>
    </div>
  );
}