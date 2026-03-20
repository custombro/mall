"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ACRYLIC_MATERIALS,
  loadSelectedMaterial,
  persistSelectedMaterial,
  persistSelectedZone,
  syncWorkbenchFromSelection,
  type AcrylicColor,
  type AcrylicThickness,
  type SelectedMaterial,
} from "../../lib/cbmall-store";

const THICKNESS_OPTIONS: Array<AcrylicThickness | 0> = [0, 2, 3, 5, 8, 10];
const COLOR_OPTIONS: Array<AcrylicColor | "all"> = ["all", "투명", "진백", "반투명", "유백색"];

function getSheetClass(color: AcrylicColor) {
  if (color === "진백") return "white";
  if (color === "반투명") return "frost";
  if (color === "유백색") return "milky";
  return "clear";
}

export default function MaterialsRoomPage() {
  const [selectedThickness, setSelectedThickness] = useState<AcrylicThickness | 0>(0);
  const [selectedColor, setSelectedColor] = useState<AcrylicColor | "all">("all");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [savedBadge, setSavedBadge] = useState("idle");

  useEffect(() => {
    persistSelectedZone("materials");
    const savedMaterial = loadSelectedMaterial();
    if (savedMaterial) {
      setSelectedThickness(savedMaterial.thickness);
      setSelectedColor(savedMaterial.color);
      setSelectedMaterialId(savedMaterial.id);
      setSavedBadge("saved");
    }
  }, []);

  const visibleMaterials = useMemo(() => {
    return ACRYLIC_MATERIALS.filter((item) => {
      const thicknessMatch = selectedThickness === 0 || item.thickness === selectedThickness;
      const colorMatch = selectedColor === "all" || item.color === selectedColor;
      return thicknessMatch && colorMatch;
    });
  }, [selectedThickness, selectedColor]);

  const currentMaterial = useMemo(() => {
    return ACRYLIC_MATERIALS.find((item) => item.id === selectedMaterialId) ?? null;
  }, [selectedMaterialId]);

  function applyMaterialSelection(itemId: string) {
    const material = ACRYLIC_MATERIALS.find((entry) => entry.id === itemId);
    if (!material) return;

    const selectedMaterial: SelectedMaterial = {
      id: material.id,
      kind: "acrylic",
      thickness: material.thickness,
      color: material.color,
    };

    persistSelectedMaterial(selectedMaterial);
    syncWorkbenchFromSelection();

    setSelectedMaterialId(material.id);
    setSelectedThickness(material.thickness);
    setSelectedColor(material.color);
    setSavedBadge("saved");
  }

  function clearSelection() {
    persistSelectedMaterial(null);
    syncWorkbenchFromSelection();
    setSelectedMaterialId("");
    setSavedBadge("cleared");
  }

  return (
    <main className="app-shell workshop-surface">
      <header className="site-topbar">
        <div>
          <div className="eyebrow">MATERIALS ROOM</div>
          <h1 className="page-title">금속 랙 자재 존</h1>
          <p className="muted">
            첨부 이미지의 금속 랙/원장 적재 컨셉으로 정리한 자재실이다.
            두께와 색상을 고른 뒤 바로 작업대 자재 슬롯으로 보낸다.
          </p>
        </div>

        <div className="action-row">
          <Link className="ghost-btn" href="/mode-select">내 작업실</Link>
          <Link className="ghost-btn" href="/option-store">부자재 존</Link>
          <Link className="primary-btn" href="/workbench/keyring">작업대로 이동</Link>
        </div>
      </header>

      <section className="page-grid page-grid-3">
        <aside className="panel">
          <div className="eyebrow">FILTER</div>
          <h2 className="section-title">두께 / 색상 선택</h2>

          <div className="filter-block">
            <div className="panel-label">두께</div>
            <div className="chip-row">
              {THICKNESS_OPTIONS.map((option) => (
                <button
                  key={String(option)}
                  type="button"
                  className={selectedThickness === option ? "chip chip-active" : "chip"}
                  onClick={() => setSelectedThickness(option)}
                >
                  {option === 0 ? "전체" : `${option}T`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <div className="panel-label">색상</div>
            <div className="chip-row">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={selectedColor === option ? "chip chip-active" : "chip"}
                  onClick={() => setSelectedColor(option)}
                >
                  {option === "all" ? "전체" : option}
                </button>
              ))}
            </div>
          </div>

          <div className="metric-card soft">
            <span>현재 상태</span>
            <strong>{savedBadge}</strong>
          </div>

          <div className="metric-card soft">
            <span>현재 필터 결과</span>
            <strong>{visibleMaterials.length}개</strong>
          </div>
        </aside>

        <section className="panel page-grid-span-2">
          <div className="eyebrow">ACRYLIC RACK</div>
          <h2 className="section-title">공방형 자재 랙</h2>

          <div className="materials-stage-grid">
            {visibleMaterials.map((item) => {
              const active = item.id === selectedMaterialId;
              const sheetClass = getSheetClass(item.color);

              return (
                <article key={item.id} className={active ? "material-rack-card active" : "material-rack-card"}>
                  <div className="card-topline">
                    <span className="token warm">{item.thickness}T</span>
                    <span className="token cool">{item.color}</span>
                  </div>

                  <h3>{item.name}</h3>
                  <p className="muted">{item.note}</p>

                  <div className="rack-visual">
                    <div className="sheet-stack">
                      <div className={`sheet-strip ${sheetClass}`} />
                      <div className={`sheet-strip ${sheetClass}`} />
                      <div className={`sheet-strip ${sheetClass}`} />
                      <div className={`sheet-strip ${sheetClass}`} />
                    </div>
                  </div>

                  <div className="selected-summary compact">
                    <div className="summary-row">
                      <span>코드</span>
                      <b>{item.id}</b>
                    </div>
                    <div className="summary-row">
                      <span>보관 구조</span>
                      <b>금속 랙 적재</b>
                    </div>
                  </div>

                  <div className="action-row" style={{ marginTop: 12 }}>
                    <button className="primary-btn" type="button" onClick={() => applyMaterialSelection(item.id)}>
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
          <div className="eyebrow">FLOATING HUD</div>
          <h2 className="section-title">선택 자재 미리보기</h2>

          {currentMaterial ? (
            <div className="material-preview-hud">
              <div className="preview-sheet-large" />
              <div className="list-stack">
                <div className="summary-row">
                  <span>자재명</span>
                  <b>{currentMaterial.name}</b>
                </div>
                <div className="summary-row">
                  <span>두께</span>
                  <b>{currentMaterial.thickness}T</b>
                </div>
                <div className="summary-row">
                  <span>색상</span>
                  <b>{currentMaterial.color}</b>
                </div>
                <div className="summary-row">
                  <span>상태</span>
                  <b>작업대 자재 슬롯 연동 준비</b>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-box">아직 선택된 자재가 없다.</div>
          )}
        </section>

        <aside className="panel">
          <div className="eyebrow">CURRENT MATERIAL</div>
          <h2 className="section-title">작업대 전송 패널</h2>

          {currentMaterial ? (
            <div className="selected-summary">
              <div className="summary-row">
                <span>자재명</span>
                <b>{currentMaterial.name}</b>
              </div>
              <div className="summary-row">
                <span>두께</span>
                <b>{currentMaterial.thickness}T</b>
              </div>
              <div className="summary-row">
                <span>색상</span>
                <b>{currentMaterial.color}</b>
              </div>
              <div className="summary-row">
                <span>반영</span>
                <b>material_primary</b>
              </div>
            </div>
          ) : (
            <div className="empty-box">선택된 자재 없음</div>
          )}

          <div className="action-row" style={{ marginTop: 14 }}>
            <Link className="primary-btn" href="/workbench/keyring">작업대 자재 슬롯 확인</Link>
            <button className="secondary-btn" type="button" onClick={clearSelection}>선택 해제</button>
          </div>
        </aside>
      </section>
    </main>
  );
}