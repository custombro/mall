"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_POP_DRAFT,
  loadPopDraft,
  persistPopDraft,
  persistPopWarnings,
  persistSelectedZone,
  validatePopDraft,
  type AcrylicColor,
  type PopDraft,
  type PopPanelConfig,
} from "../../lib/cbmall-store";

const QUICK_MODES: Array<NonNullable<PopDraft["quickCombo"]>> = ["1+2", "1+2+3", "1+2+3+4", "2+4", "2+3+4"];
const COLOR_OPTIONS: AcrylicColor[] = ["투명", "진백", "반투명", "유백색"];
const THICKNESS_OPTIONS: Array<3 | 5 | 8 | 10> = [3, 5, 8, 10];

function getPanelsForQuickMode(mode: NonNullable<PopDraft["quickCombo"]>): number[] {
  if (mode === "1+2") return [1, 2];
  if (mode === "1+2+3") return [1, 2, 3];
  if (mode === "1+2+3+4") return [1, 2, 3, 4];
  if (mode === "2+4") return [2, 4];
  return [2, 3, 4];
}

export default function PopStudioPage() {
  const [draft, setDraft] = useState<PopDraft>(DEFAULT_POP_DRAFT);

  useEffect(() => {
    persistSelectedZone("pop");
    const storedDraft = loadPopDraft();
    setDraft(storedDraft);
  }, []);

  const result = useMemo(() => validatePopDraft(draft), [draft]);

  useEffect(() => {
    persistPopDraft(draft);
    persistPopWarnings(result.warnings);
  }, [draft, result.warnings]);

  function updatePanelConfig(panelNo: number, field: keyof PopPanelConfig, value: string | number) {
    setDraft((current) => ({
      ...current,
      panelConfigs: {
        ...current.panelConfigs,
        [String(panelNo)]: {
          ...current.panelConfigs[String(panelNo)],
          [field]: value,
        },
      },
    }));
  }

  function togglePanel(panelNo: number) {
    setDraft((current) => {
      const exists = current.enabledPanels.includes(panelNo);
      const nextPanels = exists
        ? current.enabledPanels.filter((value) => value !== panelNo)
        : [...current.enabledPanels, panelNo].sort((a, b) => a - b);

      return {
        ...current,
        mode: "custom",
        enabledPanels: nextPanels,
      };
    });
  }

  function applyQuickMode(mode: NonNullable<PopDraft["quickCombo"]>) {
    setDraft((current) => ({
      ...current,
      mode: "quick",
      quickCombo: mode,
      enabledPanels: getPanelsForQuickMode(mode),
    }));
  }

  function resetDraft() {
    setDraft(DEFAULT_POP_DRAFT);
  }

  return (
    <main className="app-shell workshop-surface">
      <header className="site-topbar">
        <div>
          <div className="eyebrow">POP STUDIO</div>
          <h1 className="page-title">POP 구조 설계 스튜디오</h1>
          <p className="muted">
            quick mode와 custom mode를 모두 시작하고, 실시간 규칙 검증 결과를 바로 확인한다.
          </p>
        </div>

        <div className="action-row">
          <Link className="ghost-btn" href="/mode-select">내 작업실</Link>
          <Link className="ghost-btn" href="/materials-room">자재 랙</Link>
          <button className="secondary-btn" type="button" onClick={resetDraft}>초안 초기화</button>
        </div>
      </header>

      <section className="page-grid page-grid-3">
        <aside className="panel">
          <div className="eyebrow">MODE</div>
          <h2 className="section-title">quick / custom</h2>

          <div className="chip-row">
            <button type="button" className={draft.mode === "quick" ? "chip chip-active" : "chip"} onClick={() => setDraft((current) => ({ ...current, mode: "quick" }))}>
              quick
            </button>
            <button type="button" className={draft.mode === "custom" ? "chip chip-active" : "chip"} onClick={() => setDraft((current) => ({ ...current, mode: "custom" }))}>
              custom
            </button>
          </div>

          <div className="filter-block">
            <div className="panel-label">quick combo</div>
            <div className="chip-row">
              {QUICK_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={draft.quickCombo === mode ? "chip chip-active" : "chip"}
                  onClick={() => applyQuickMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <div className="panel-label">enabled panels</div>
            <div className="chip-row">
              {[1, 2, 3, 4].map((panelNo) => (
                <button
                  key={panelNo}
                  type="button"
                  className={draft.enabledPanels.includes(panelNo) ? "chip chip-active" : "chip"}
                  onClick={() => togglePanel(panelNo)}
                >
                  {panelNo}번판
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="panel page-grid-span-2">
          <div className="eyebrow">PANEL CONFIG</div>
          <h2 className="section-title">판별 치수/자재 설정</h2>

          <div className="panel-config-grid">
            {[1, 2, 3, 4].map((panelNo) => {
              const config = draft.panelConfigs[String(panelNo)];
              return (
                <article key={panelNo} className={draft.enabledPanels.includes(panelNo) ? "config-card active" : "config-card"}>
                  <div className="config-head">
                    <strong>{panelNo}번판</strong>
                    <span className="token cool">{draft.enabledPanels.includes(panelNo) ? "활성" : "비활성"}</span>
                  </div>

                  <div className="form-grid">
                    <label>
                      <span>width</span>
                      <input
                        className="field-input"
                        type="number"
                        value={config?.width ?? ""}
                        onChange={(event) => updatePanelConfig(panelNo, "width", Number(event.target.value || 0))}
                      />
                    </label>

                    <label>
                      <span>height</span>
                      <input
                        className="field-input"
                        type="number"
                        value={config?.height ?? ""}
                        onChange={(event) => updatePanelConfig(panelNo, "height", Number(event.target.value || 0))}
                      />
                    </label>

                    <label>
                      <span>depth</span>
                      <input
                        className="field-input"
                        type="number"
                        value={config?.depth ?? ""}
                        onChange={(event) => updatePanelConfig(panelNo, "depth", Number(event.target.value || 0))}
                      />
                    </label>

                    <label>
                      <span>thickness</span>
                      <select
                        className="field-input"
                        value={config?.thickness ?? 5}
                        onChange={(event) => updatePanelConfig(panelNo, "thickness", Number(event.target.value) as 3 | 5 | 8 | 10)}
                      >
                        {THICKNESS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}T
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>color</span>
                      <select
                        className="field-input"
                        value={config?.color ?? "투명"}
                        onChange={(event) => updatePanelConfig(panelNo, "color", event.target.value as AcrylicColor)}
                      >
                        {COLOR_OPTIONS.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>shape</span>
                      <select
                        className="field-input"
                        value={config?.shape ?? "square"}
                        onChange={(event) => updatePanelConfig(panelNo, "shape", event.currentTarget.value as NonNullable<PopPanelConfig["shape"]>)}
                      >
                        <option value="square">square</option>
                        <option value="top_round">top_round</option>
                        <option value="custom">custom</option>
                      </select>
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <section className="page-grid page-grid-3" style={{ marginTop: 18 }}>
        <section className="panel">
          <div className="eyebrow">ERRORS</div>
          <h2 className="section-title">에러</h2>
          {result.errors.length > 0 ? (
            <ul className="message-list error">
              {result.errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : (
            <div className="empty-box">현재 치명적 에러 없음</div>
          )}
        </section>

        <section className="panel">
          <div className="eyebrow">WARNINGS</div>
          <h2 className="section-title">경고</h2>
          {result.warnings.length > 0 ? (
            <ul className="message-list warning">
              {result.warnings.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : (
            <div className="empty-box">현재 경고 없음</div>
          )}
        </section>

        <section className="panel">
          <div className="eyebrow">RECOMMENDATIONS</div>
          <h2 className="section-title">권장</h2>
          {result.recommendations.length > 0 ? (
            <ul className="message-list success">
              {result.recommendations.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : (
            <div className="empty-box">현재 권장 없음</div>
          )}
        </section>
      </section>
    </main>
  );
}