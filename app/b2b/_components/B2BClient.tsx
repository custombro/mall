"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  b2bChecklist,
  b2bProjects,
  b2bStages,
  getRouteLabel,
  getStageClass,
  type B2BStage,
} from "./b2b-config";

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

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_1.1fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            B2B Workflow
          </p>
          <h2 className="text-2xl font-semibold text-white">대량 주문 운영 기준</h2>
          <p className="text-sm leading-6 text-slate-300">
            일반 소비자 흐름과 분리된 대량 주문/기관 주문 허브입니다. 수량, 납기, 자재, 반복 발주 여부를 먼저 판정합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {b2bChecklist.map((item) => (
            <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Project Queue
          </p>
          <h2 className="text-2xl font-semibold text-white">B2B 프로젝트 큐</h2>
          <p className="text-sm leading-6 text-slate-300">
            문의접수부터 납기관리까지 현재 대량 주문 상태를 분리해서 확인합니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">상태</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as B2BStage | "전체")}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="전체">전체</option>
              {b2bStages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">검색</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="거래처, 프로젝트, 납기"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="grid gap-3">
          {filteredProjects.map((project) => {
            const active = selectedProject?.id === project.id;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                className={
                  active
                    ? "rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left"
                    : "rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                }
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs ${getStageClass(project.stage)}`}>
                        {project.stage}
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                        {project.quantityBand}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-white">{project.title}</div>
                    <div className="text-sm text-slate-300">{project.summary}</div>
                  </div>

                  <div className="text-sm text-cyan-100">{project.dueWindow}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Detail / Route
          </p>
          <h2 className="text-2xl font-semibold text-white">선택 프로젝트 상세</h2>
          <p className="text-sm leading-6 text-slate-300">
            대량 주문은 현재 상태와 연결 자재/작업 공간을 즉시 판단할 수 있어야 합니다.
          </p>
        </div>

        {selectedProject ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs ${getStageClass(selectedProject.stage)}`}>
                  {selectedProject.stage}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">{selectedProject.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedProject.note}</p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">거래처 유형</div>
                <div className="mt-1 text-slate-100">{selectedProject.clientType}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">수량 구간</div>
                <div className="mt-1 text-slate-100">{selectedProject.quantityBand}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">납기 구간</div>
                <div className="mt-1 text-slate-100">{selectedProject.dueWindow}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">추천 작업 공간</div>
                <div className="mt-1 text-cyan-100">{getRouteLabel(selectedProject.recommendedRoute)}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-semibold text-emerald-50">상태 분포</p>
              <div className="mt-3 grid gap-2">
                {Object.entries(stageCounts).map(([stage, count]) => (
                  <div key={stage} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-100">
                    {stage} · {count}건
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                href={selectedProject.recommendedRoute}
                className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                추천 작업 공간으로 이동
              </Link>
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
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
            프로젝트를 선택하면 상세가 표시됩니다.
          </div>
        )}
      </aside>
    </div>
  );
}