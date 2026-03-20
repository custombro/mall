"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  PARTS_CATALOG,
  PART_CATEGORY_LABEL,
  loadSelectedParts,
  persistSelectedZone,
  removePartSelection,
  syncWorkbenchFromSelection,
  upsertPartSelection,
  type SelectedPart,
} from "../../lib/cbmall-store";

const PART_CATEGORIES: Array<SelectedPart["partType"]> = ["d_ring", "o_ring", "opp_bag"];

export default function OptionStorePage() {
  const [selectedPartCategory, setSelectedPartCategory] = useState<SelectedPart["partType"]>("d_ring");
  const [selectedPartSpec, setSelectedPartSpec] = useState<string>("");
  const [selectedPartQty, setSelectedPartQty] = useState<number>(1);
  const [currentSelections, setCurrentSelections] = useState<SelectedPart[]>([]);

  useEffect(() => {
    persistSelectedZone("parts");
    const savedParts = loadSelectedParts();
    setCurrentSelections(savedParts);
    if (savedParts[0]) {
      setSelectedPartCategory(savedParts[0].partType);
      setSelectedPartSpec(savedParts[0].id);
      setSelectedPartQty(savedParts[0].qty);
    }
  }, []);

  const visibleOptions = useMemo(() => {
    return PARTS_CATALOG.filter((item) => item.partType === selectedPartCategory);
  }, [selectedPartCategory]);

  const activePart = useMemo(() => {
    return PARTS_CATALOG.find((item) => item.id === selectedPartSpec) ?? null;
  }, [selectedPartSpec]);

  function applyPart(itemId: string) {
    const item = PARTS_CATALOG.find((entry) => entry.id === itemId);
    if (!item) return;

    const nextPart: SelectedPart = {
      id: item.id,
      kind: "part",
      partType: item.partType,
      spec: item.spec,
      qty: selectedPartQty,
    };

    const nextSelections = upsertPartSelection(nextPart);
    syncWorkbenchFromSelection();
    setSelectedPartSpec(item.id);
    setCurrentSelections(nextSelections);
  }

  function handleClearCategory(partType: SelectedPart["partType"]) {
    const nextSelections = removePartSelection(partType);
    syncWorkbenchFromSelection();
    setCurrentSelections(nextSelections);

    if (partType === selectedPartCategory) {
      setSelectedPartSpec("");
    }
  }

  return (
    <main className="app-shell workshop-surface">
      <header className="site-topbar">
        <div>
          <div className="eyebrow">PARTS ROOM</div>
          <h1 className="page-title">부자재 트레이 존</h1>
          <p className="muted">
            첨부 이미지의 책상 위 트레이/서랍형 컨셉을 기준으로 D고리, O링, OPP를 고르고 바로 작업대에 보낸다.
          </p>
        </div>

        <div className="action-row">
          <Link className="ghost-btn" href="/mode-select">내 작업실</Link>
          <Link className="ghost-btn" href="/materials-room">자재 랙</Link>
          <Link className="primary-btn" href="/workbench/keyring">작업대로 이동</Link>
        </div>
      </header>

      <section className="page-grid page-grid-3">
        <aside className="panel">
          <div className="eyebrow">CATEGORY</div>
          <h2 className="section-title">부자재 종류</h2>

          <div className="chip-row">
            {PART_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedPartCategory === category ? "chip chip-active" : "chip"}
                onClick={() => {
                  setSelectedPartCategory(category);
                  setSelectedPartSpec("");
                }}
              >
                {PART_CATEGORY_LABEL[category]}
              </button>
            ))}
          </div>

          <div className="filter-block">
            <div className="panel-label">수량</div>
            <input
              className="field-input"
              type="number"
              min={1}
              max={999}
              value={selectedPartQty}
              onChange={(event) => setSelectedPartQty(Math.max(1, Number(event.target.value || 1)))}
            />
          </div>

          <div className="metric-card soft">
            <span>현재 선택 종류</span>
            <strong>{PART_CATEGORY_LABEL[selectedPartCategory]}</strong>
          </div>
        </aside>

        <section className="panel page-grid-span-2">
          <div className="eyebrow">PART TRAY STAGE</div>
          <h2 className="section-title">작업대 앞 부자재 트레이</h2>

          <div className="parts-stage-grid">
            {visibleOptions.map((item) => {
              const active = item.id === selectedPartSpec;

              return (
                <article key={item.id} className={active ? "parts-card active" : "parts-card"}>
                  <div className="card-topline">
                    <span className="token cool">{PART_CATEGORY_LABEL[item.partType]}</span>
                    <span className="token warm">{item.spec}</span>
                  </div>

                  <h3>{item.name}</h3>
                  <p className="muted">{item.note}</p>

                  <div className="parts-visual">
                    <div className="parts-tray-grid">
                      <div className={`tray-box ${item.partType === "opp_bag" ? "bag" : "ring"}`} />
                      <div className={`tray-box ${item.partType === "opp_bag" ? "bag" : "ring"}`} />
                      <div className={`tray-box ${item.partType === "opp_bag" ? "bag" : "ring"}`} />
                      <div className={`tray-box ${item.partType === "opp_bag" ? "bag" : "ring"}`} />
                    </div>
                    <div className="summary-row">
                      <span>보관 구조</span>
                      <b>트레이 / 소형 서랍</b>
                    </div>
                  </div>

                  <div className="selected-summary compact">
                    <div className="summary-row">
                      <span>규격</span>
                      <b>{item.spec}</b>
                    </div>
                    <div className="summary-row">
                      <span>수량</span>
                      <b>{selectedPartQty}</b>
                    </div>
                  </div>

                  <div className="action-row" style={{ marginTop: 12 }}>
                    <button className="primary-btn" type="button" onClick={() => applyPart(item.id)}>
                      선택 + 작업대 반영
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <section className="page-grid page-grid-2" style={{ marginTop: 18 }}>
        <section className="panel">
          <div className="eyebrow">PART PREVIEW HUD</div>
          <h2 className="section-title">현재 미리보기</h2>

          {activePart ? (
            <div className="parts-preview-hud">
              <div className={`parts-preview-shape ${activePart.partType}`} />
              <div className="list-stack">
                <div className="summary-row">
                  <span>품목</span>
                  <b>{activePart.name}</b>
                </div>
                <div className="summary-row">
                  <span>규격</span>
                  <b>{activePart.spec}</b>
                </div>
                <div className="summary-row">
                  <span>수량</span>
                  <b>{selectedPartQty}</b>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-box">선택된 부자재가 없다.</div>
          )}
        </section>

        <aside className="panel">
          <div className="eyebrow">SELECTED PARTS</div>
          <h2 className="section-title">작업대 전송 현황</h2>

          <div className="list-stack">
            {currentSelections.length > 0 ? (
              currentSelections.map((part) => (
                <div key={part.id} className="selected-summary compact">
                  <div className="summary-row">
                    <span>품목</span>
                    <b>{PART_CATEGORY_LABEL[part.partType]}</b>
                  </div>
                  <div className="summary-row">
                    <span>규격</span>
                    <b>{part.spec}</b>
                  </div>
                  <div className="summary-row">
                    <span>수량</span>
                    <b>{part.qty}</b>
                  </div>
                  <button className="secondary-btn full-width" type="button" onClick={() => handleClearCategory(part.partType)}>
                    해당 종류 제거
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-box">저장된 부자재 없음</div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}