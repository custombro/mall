"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  type DrawerBayId,
  type PieceId,
  getAssignedPiecesForBay,
  getPieceLabel,
  getPieceMini,
  getRecommendedBay,
  mergeIncomingPieces,
  pieceOrder,
  removeAssignedPiece,
} from "../../../lib/cb-workshop-stage-store";
import { useWorkshopStage } from "../../../hooks/use-workshop-stage";
import { drawerBays } from "./storage-config";

type WallMode = "overview" | "focus";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function StorageWallClient() {
  const { stageState, updateStageState } = useWorkshopStage();

  const [wallMode, setWallMode] = useState<WallMode>("overview");
  const [selectedBay, setSelectedBay] = useState<DrawerBayId | null>("bayB2");
  const [selectedIncoming, setSelectedIncoming] = useState<PieceId | null>(null);

  const incomingPieces = useMemo(() => stageState.incomingPieceIds, [stageState]);
  const assignedCount = useMemo(() => Object.keys(stageState.storageAssignments).length, [stageState]);
  const overallRate = useMemo(() => Math.round((assignedCount / pieceOrder.length) * 100), [assignedCount]);

  const selectedData = useMemo(
    () => drawerBays.find((item) => item.id === selectedBay) ?? null,
    [selectedBay],
  );

  const selectedBayPieces = useMemo(
    () => (selectedBay ? getAssignedPiecesForBay(stageState, selectedBay) : []),
    [stageState, selectedBay],
  );

  useEffect(() => {
    if (selectedIncoming && !incomingPieces.includes(selectedIncoming)) {
      setSelectedIncoming(null);
    }
  }, [incomingPieces, selectedIncoming]);

  const assignPieceToBay = (pieceId: PieceId, bayId: DrawerBayId) => {
    updateStageState((prev) => ({
      ...prev,
      incomingPieceIds: prev.incomingPieceIds.filter((id) => id !== pieceId),
      storageAssignments: {
        ...prev.storageAssignments,
        [pieceId]: bayId,
      },
    }));

    setSelectedBay(bayId);
    setSelectedIncoming(null);
  };

  const autoAssignAll = () => {
    if (incomingPieces.length === 0) return;

    updateStageState((prev) => {
      const nextAssignments = { ...prev.storageAssignments };

      for (const pieceId of prev.incomingPieceIds) {
        nextAssignments[pieceId] = getRecommendedBay(pieceId);
      }

      return {
        ...prev,
        incomingPieceIds: [],
        storageAssignments: nextAssignments,
      };
    });

    setSelectedIncoming(null);
  };

  const handleBayClick = (bayId: DrawerBayId) => {
    if (selectedIncoming) {
      assignPieceToBay(selectedIncoming, bayId);
      return;
    }
    setSelectedBay((prev) => (prev === bayId ? null : bayId));
  };

  const returnAssignedPieceToQueue = (pieceId: PieceId) => {
    updateStageState((prev) => ({
      ...prev,
      incomingPieceIds: mergeIncomingPieces(prev.incomingPieceIds, [pieceId]),
      storageAssignments: removeAssignedPiece(prev.storageAssignments, pieceId),
    }));

    setSelectedIncoming(pieceId);
  };

  const returnFocusedBayToQueue = () => {
    if (!selectedBay) return;
    const assignedPieces = getAssignedPiecesForBay(stageState, selectedBay);
    if (assignedPieces.length === 0) return;

    updateStageState((prev) => {
      let nextAssignments = { ...prev.storageAssignments };

      for (const pieceId of assignedPieces) {
        nextAssignments = removeAssignedPiece(nextAssignments, pieceId);
      }

      return {
        ...prev,
        incomingPieceIds: mergeIncomingPieces(prev.incomingPieceIds, assignedPieces),
        storageAssignments: nextAssignments,
      };
    });

    setSelectedIncoming(null);
  };

  return (
    <>
      <main className="sr7-page">
        <div className="sr7-shell">
          <section className="sr7-frame">
            <div className="sr7-hero">
              <div className="sr7-heroLeft">
                <div className="sr7-kicker">CUSTOMBRO WORKSHOP · STORAGE</div>
                <h1 className="sr7-title">밝은 보관벽 / 완료품 서랍</h1>
                <p className="sr7-desc">
                  중앙 작업대에서 넘어온 파트를 투명 보관함, 완료품 서랍, 출고 대기 통으로 정리하는 밝은 공방형 보관 화면입니다.
                </p>
                <div className="sr7-meta">
                  <span>투명 박스 벽</span>
                  <span>제작 완료 통</span>
                  <span>작업대 연동</span>
                  <span>포커스 강조</span>
                </div>
              </div>

              <div className="sr7-hud">
                <div className="sr7-hudItem">
                  <span>MODE</span>
                  <strong>{wallMode}</strong>
                </div>
                <div className="sr7-hudItem">
                  <span>FOCUS</span>
                  <strong>{selectedBay ? "ACTIVE" : "NONE"}</strong>
                </div>
                <div className="sr7-hudItem">
                  <span>QUEUE</span>
                  <strong>{incomingPieces.length} staged</strong>
                </div>
              </div>
            </div>

            <div className="sr7-toolbar">
              <button
                type="button"
                className={cx("sr7-pill", wallMode === "overview" && "is-active")}
                onClick={() => setWallMode("overview")}
              >
                OVERVIEW
              </button>
              <button
                type="button"
                className={cx("sr7-pill", wallMode === "focus" && "is-active")}
                onClick={() => setWallMode("focus")}
              >
                FOCUS
              </button>

              <div className="sr7-divider" />

              <div className="sr7-chip">SELECTED BAY: {selectedBay ?? "NONE"}</div>
              <div className="sr7-chip">SELECTED PIECE: {selectedIncoming ? getPieceLabel(selectedIncoming) : "NONE"}</div>

              <button
                type="button"
                onClick={autoAssignAll}
                disabled={incomingPieces.length === 0}
                className={cx("sr7-pill", "sr7-pillPrimary", incomingPieces.length === 0 && "is-disabled")}
              >
                AUTO SORT ALL ({incomingPieces.length})
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = "/workbench/keyring"; }}
                className="sr7-pill sr7-pillLink"
              >
                OPEN WORKBENCH
              </button>
            </div>

            <div className="sr7-main">
              <section className="sr7-panel sr7-wallPanel">
                <div className="sr7-panelHead sr7-panelHeadWide">
                  <div>
                    <div className="sr7-caption">보관 벽</div>
                    <h2>Transparent Box Wall</h2>
                    <p>queue에서 파트를 선택한 뒤 bay를 누르면 수동 배치, AUTO SORT ALL로 일괄 정리할 수 있습니다.</p>
                  </div>

                  <div className="sr7-miniHud">
                    <span>STORAGE HUD</span>
                    <strong>{wallMode === "focus" && selectedBay ? `${selectedBay} 집중 확인 중` : "전체 보관 벽 확인 중"}</strong>
                  </div>
                </div>

                <div className="sr7-wallArea">
                  <div className="sr7-bayGrid">
                    {drawerBays.map((bay) => {
                      const isSelected = selectedBay === bay.id;
                      const isMuted = wallMode === "focus" && !!selectedBay && !isSelected;
                      const isRecommended = selectedIncoming ? getRecommendedBay(selectedIncoming) === bay.id : false;
                      const assignedPieces = getAssignedPiecesForBay(stageState, bay.id);

                      return (
                        <button
                          key={bay.id}
                          type="button"
                          onClick={() => handleBayClick(bay.id)}
                          className={cx(
                            "sr7-bayCard",
                            isSelected && "is-selected",
                            isMuted && "is-muted",
                            isRecommended && "is-recommended",
                          )}
                        >
                          <div className="sr7-bayTop">
                            <div>
                              <div className="sr7-bayShelf">{bay.shelf}</div>
                              <h3>{bay.title}</h3>
                            </div>
                            <div className="sr7-bayBadges">
                              <span className="sr7-bayMode">{isSelected ? "FOCUS" : "BAY"}</span>
                              <span className="sr7-bayCount">{assignedPieces.length}/4</span>
                            </div>
                          </div>

                          <div className="sr7-boxFace">
                            {Array.from({ length: 4 }).map((_, idx) => {
                              const pieceId = assignedPieces[idx];
                              return (
                                <div key={idx} className={cx("sr7-boxCell", pieceId && "is-filled")}>
                                  {pieceId ? getPieceMini(pieceId) : ""}
                                </div>
                              );
                            })}
                          </div>

                          <strong className="sr7-capacity">{bay.capacity}</strong>

                          <div className="sr7-noteRow">
                            {bay.notes.map((note) => (
                              <span key={note} className="sr7-note">
                                {note}
                              </span>
                            ))}
                            {isRecommended && <span className="sr7-note sr7-noteRecommended">RECOMMENDED</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <aside className="sr7-panel sr7-sidePanel">
                <div className="sr7-panelHead">
                  <div>
                    <div className="sr7-caption">보관 상세 HUD</div>
                    <h2>Focused Drawer Bay</h2>
                  </div>
                </div>

                <div className="sr7-overallCard">
                  <div className="sr7-caption sr7-captionBlue">overall storage progress</div>
                  <strong>{overallRate}%</strong>
                  <p>{assignedCount} / {pieceOrder.length} 파트가 보관 배치되었습니다.</p>
                  <div className="sr7-progressBar">
                    <div className="sr7-progressFill" style={{ width: `${overallRate}%` }} />
                  </div>
                </div>

                <div className="sr7-detailCard">
                  {selectedData ? (
                    <>
                      <div className="sr7-bayShelf">{selectedData.shelf}</div>
                      <h3>{selectedData.title}</h3>
                      <p className="sr7-detailCapacity">{selectedData.capacity}</p>

                      <div className="sr7-detailNotes">
                        {selectedData.notes.map((note) => (
                          <div key={note} className="sr7-detailNote">
                            {note}
                          </div>
                        ))}
                        {selectedBayPieces.length > 0 ? (
                          <div className="sr7-assignedWrap">
                            {selectedBayPieces.map((pieceId) => (
                              <button
                                key={pieceId}
                                type="button"
                                onClick={() => returnAssignedPieceToQueue(pieceId)}
                                className="sr7-assignedChip"
                              >
                                {getPieceLabel(pieceId)} ↺
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="sr7-emptyNote">아직 배치된 파트 없음</div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={returnFocusedBayToQueue}
                        disabled={selectedBayPieces.length === 0}
                        className={cx("sr7-returnBtn", selectedBayPieces.length === 0 && "is-disabled")}
                      >
                        RETURN FOCUSED BAY TO QUEUE
                      </button>
                    </>
                  ) : (
                    <div className="sr7-empty">선택된 bay가 없습니다. 보관 박스를 눌러 강조 상태를 전환하세요.</div>
                  )}
                </div>

                <div className="sr7-selectedPieceCard">
                  <div className="sr7-caption sr7-captionBlue">selected incoming piece</div>
                  {selectedIncoming ? (
                    <>
                      <strong>{getPieceLabel(selectedIncoming)}</strong>
                      <p>추천 bay: {getRecommendedBay(selectedIncoming)}</p>
                      <button
                        type="button"
                        onClick={() => assignPieceToBay(selectedIncoming, getRecommendedBay(selectedIncoming))}
                        className="sr7-autoBtn"
                      >
                        AUTO ASSIGN TO RECOMMENDED BAY
                      </button>
                    </>
                  ) : (
                    <div className="sr7-empty">queue에서 파트를 선택하면 추천 bay와 자동 배치 버튼이 활성화됩니다.</div>
                  )}
                </div>

                <div className="sr7-finishedCard">
                  <div className="sr7-caption sr7-captionBrown">제작 완료 서랍</div>
                  <div className="sr7-finishedBins">
                    <div className="sr7-finishedBin">
                      <strong>제작 완료</strong>
                      <span>{assignedCount}건 보관중</span>
                    </div>
                    <div className="sr7-finishedBin">
                      <strong>출고 대기</strong>
                      <span>{incomingPieces.length}건 대기</span>
                    </div>
                  </div>
                </div>

                <div className="sr7-queueCard">
                  <div className="sr7-caption sr7-captionAmber">incoming from workbench</div>
                  <div className="sr7-queueList">
                    {incomingPieces.length > 0 ? (
                      incomingPieces.map((pieceId) => (
                        <div
                          key={pieceId}
                          className={cx("sr7-queueItem", selectedIncoming === pieceId && "is-selected")}
                        >
                          <div className="sr7-queueText">
                            <strong>{getPieceLabel(pieceId)}</strong>
                            <span>추천 bay {getRecommendedBay(pieceId)}</span>
                          </div>
                          <div className="sr7-queueActions">
                            <button
                              type="button"
                              onClick={() => setSelectedIncoming((prev) => (prev === pieceId ? null : pieceId))}
                              className="sr7-queueBtn"
                            >
                              {selectedIncoming === pieceId ? "UNSELECT" : "SELECT"}
                            </button>
                            <button
                              type="button"
                              onClick={() => assignPieceToBay(pieceId, getRecommendedBay(pieceId))}
                              className="sr7-queueBtn sr7-queueBtnPrimary"
                            >
                              AUTO
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="sr7-empty">현재 작업대에서 넘어온 대기 파트가 없습니다.</div>
                    )}
                  </div>
                </div>

                <div className="sr7-helper">
                  queue에서 SELECT 후 bay를 누르면 수동 배치, AUTO 또는 AUTO SORT ALL로 추천 위치에 즉시 정리됩니다.
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        .sr7-page { min-height: 100vh; background: linear-gradient(180deg, #f6f5f1 0%, #eef2f6 100%); color: #122034; }
        .sr7-shell { max-width: 1680px; margin: 0 auto; padding: 18px; }
        .sr7-frame { background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(249,250,252,0.98)); border: 1px solid rgba(148,163,184,0.22); border-radius: 30px; box-shadow: 0 18px 46px rgba(30,41,59,0.08); overflow: hidden; }
        .sr7-hero { display: flex; justify-content: space-between; gap: 22px; padding: 22px 24px 18px; background: linear-gradient(90deg, rgba(252,253,250,0.95), rgba(244,248,252,0.96)), #fff; border-bottom: 1px solid rgba(148,163,184,0.18); }
        .sr7-heroLeft { min-width: 0; }
        .sr7-kicker { font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: #42607f; font-weight: 800; margin-bottom: 10px; }
        .sr7-title { margin: 0; font-size: 54px; line-height: 1.02; letter-spacing: -0.04em; color: #18263c; }
        .sr7-desc { margin: 14px 0 0; max-width: 900px; color: #526273; font-size: 15px; line-height: 1.75; }
        .sr7-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
        .sr7-meta span { padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.78); border: 1px solid rgba(148,163,184,0.18); color: #475569; font-size: 12px; font-weight: 700; }
        .sr7-hud { display: grid; grid-template-columns: repeat(3, minmax(124px, 1fr)); gap: 10px; min-width: 420px; padding: 12px; border-radius: 22px; border: 1px solid rgba(49,113,173,0.14); background: linear-gradient(180deg, rgba(240,248,247,0.92), rgba(246,250,251,0.96)); }
        .sr7-hudItem { padding: 10px 12px; border-radius: 16px; background: rgba(255,255,255,0.78); border: 1px solid rgba(148,163,184,0.12); }
        .sr7-hudItem span { display: block; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #58728a; font-weight: 800; }
        .sr7-hudItem strong { display: block; margin-top: 6px; font-size: 22px; color: #132238; }
        .sr7-toolbar { display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 24px; align-items: center; background: rgba(255,255,255,0.78); border-bottom: 1px solid rgba(148,163,184,0.16); }
        .sr7-pill { appearance: none; border: 1px solid rgba(148,163,184,0.2); background: #ffffff; color: #425466; border-radius: 999px; padding: 10px 14px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 800; cursor: pointer; }
        .sr7-pill:hover { background: #f8fbff; border-color: rgba(59,130,246,0.26); color: #24456c; }
        .sr7-pill.is-active { background: #e8f5ff; border-color: rgba(45,108,223,0.3); color: #255aac; }
        .sr7-pillPrimary { background: #eef6ff; border-color: rgba(45,108,223,0.24); color: #255aac; }
        .sr7-pillLink { background: #f4f8ff; border-color: rgba(59,130,246,0.2); color: #2d5ea5; }
        .sr7-pill.is-disabled { opacity: 0.45; cursor: not-allowed; }
        .sr7-divider { width: 1px; height: 28px; background: rgba(148,163,184,0.22); margin: 0 2px; }
        .sr7-chip { padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.82); border: 1px solid rgba(148,163,184,0.18); color: #44576b; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 800; }
        .sr7-main { display: grid; grid-template-columns: minmax(0,1fr) 380px; gap: 18px; padding: 18px 24px 24px; }
        .sr7-panel { border-radius: 28px; border: 1px solid rgba(148,163,184,0.18); background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(245,247,250,0.96)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5); padding: 16px; }
        .sr7-wallPanel { background: linear-gradient(180deg, rgba(247,251,255,0.96), rgba(245,248,252,0.98)); }
        .sr7-sidePanel { background: linear-gradient(180deg, rgba(252,250,246,0.95), rgba(248,246,242,0.98)); }
        .sr7-panelHead { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .sr7-panelHeadWide { align-items: end; padding-bottom: 14px; border-bottom: 1px solid rgba(148,163,184,0.16); }
        .sr7-caption { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #6a7d91; font-weight: 800; margin-bottom: 8px; }
        .sr7-captionAmber { color: #9a7216; }
        .sr7-captionBrown { color: #7a5a33; }
        .sr7-captionBlue { color: #2d5ea5; }
        .sr7-panel h2 { margin: 0; font-size: 24px; line-height: 1.12; color: #16243a; }
        .sr7-panelHead p { margin: 10px 0 0; color: #5f6e7f; font-size: 14px; line-height: 1.68; }
        .sr7-miniHud { min-width: 220px; padding: 12px 14px; border-radius: 20px; border: 1px solid rgba(148,163,184,0.16); background: rgba(255,255,255,0.82); }
        .sr7-miniHud span { display: block; color: #6a7d91; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 800; }
        .sr7-miniHud strong { display: block; margin-top: 6px; color: #16253a; font-size: 18px; }
        .sr7-wallArea { margin-top: 16px; border-radius: 26px; border: 1px solid rgba(176,190,204,0.22); background: linear-gradient(180deg, rgba(239,246,252,0.66), rgba(248,250,252,0.92)); padding: 16px; }
        .sr7-bayGrid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; }
        .sr7-bayCard { appearance: none; text-align: left; border-radius: 24px; border: 1px solid rgba(148,163,184,0.18); background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(245,248,251,0.98)); padding: 14px; cursor: pointer; color: inherit; }
        .sr7-bayCard:hover { transform: translateY(-1px); box-shadow: 0 12px 24px rgba(36,69,108,0.06); }
        .sr7-bayCard.is-selected { border-color: rgba(45,108,223,0.32); background: linear-gradient(180deg, rgba(238,247,255,0.96), rgba(232,243,253,0.98)); box-shadow: 0 12px 28px rgba(45,108,223,0.08); }
        .sr7-bayCard.is-muted { opacity: 0.46; }
        .sr7-bayCard.is-recommended { border-color: rgba(200,138,17,0.34); box-shadow: 0 0 0 1px rgba(200,138,17,0.12) inset; }
        .sr7-bayTop { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
        .sr7-bayShelf { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #73869b; font-weight: 800; }
        .sr7-bayTop h3 { margin: 6px 0 0; font-size: 19px; color: #17253a; }
        .sr7-bayBadges { display: grid; gap: 6px; }
        .sr7-bayMode, .sr7-bayCount { padding: 6px 9px; border-radius: 999px; border: 1px solid rgba(148,163,184,0.18); background: rgba(255,255,255,0.88); color: #4d6176; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 800; text-align: center; }
        .sr7-boxFace { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; margin-top: 14px; padding: 12px; border-radius: 20px; border: 1px solid rgba(188,201,214,0.22); background: rgba(255,255,255,0.66); }
        .sr7-boxCell { height: 56px; border-radius: 16px; border: 1px solid rgba(188,201,214,0.28); background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(219,227,236,0.26)); display: flex; align-items: center; justify-content: center; color: #526273; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; }
        .sr7-boxCell.is-filled { background: linear-gradient(180deg, rgba(232,243,253,0.96), rgba(255,255,255,0.88)); border-color: rgba(45,108,223,0.18); }
        .sr7-capacity { display: block; margin-top: 14px; font-size: 15px; color: #17253a; }
        .sr7-noteRow { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .sr7-note { padding: 7px 10px; border-radius: 999px; background: rgba(255,255,255,0.88); border: 1px solid rgba(148,163,184,0.16); color: #536578; font-size: 12px; font-weight: 700; }
        .sr7-noteRecommended { background: #fff6df; border-color: rgba(200,138,17,0.24); color: #8a5e07; }
        .sr7-overallCard, .sr7-detailCard, .sr7-selectedPieceCard, .sr7-finishedCard, .sr7-queueCard, .sr7-helper { margin-top: 14px; border-radius: 22px; border: 1px solid rgba(148,163,184,0.16); background: rgba(255,255,255,0.84); padding: 14px; }
        .sr7-overallCard strong { display: block; font-size: 30px; color: #17253a; }
        .sr7-overallCard p { margin: 8px 0 0; color: #5f6f80; font-size: 14px; }
        .sr7-progressBar { height: 12px; border-radius: 999px; background: #edf2f7; overflow: hidden; margin-top: 12px; }
        .sr7-progressFill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #2d6cdf, #8a5cff); }
        .sr7-detailCard h3 { margin: 8px 0 0; font-size: 28px; color: #17253a; }
        .sr7-detailCapacity { margin: 12px 0 0; color: #5f6f80; font-size: 15px; line-height: 1.62; }
        .sr7-detailNotes { display: grid; gap: 10px; margin-top: 14px; }
        .sr7-detailNote { border-radius: 16px; border: 1px solid rgba(148,163,184,0.14); background: rgba(245,248,251,0.98); padding: 12px 14px; color: #45586b; font-weight: 700; }
        .sr7-assignedWrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .sr7-assignedChip { appearance: none; padding: 8px 10px; border-radius: 999px; background: #eef6ff; border: 1px solid rgba(45,108,223,0.18); color: #2d5ea5; font-size: 12px; font-weight: 800; cursor: pointer; }
        .sr7-emptyNote { color: #6b7280; font-size: 13px; }
        .sr7-returnBtn, .sr7-autoBtn { appearance: none; margin-top: 12px; width: 100%; border-radius: 14px; border: 1px solid rgba(45,108,223,0.18); background: #eef6ff; color: #255aac; padding: 12px 14px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 800; cursor: pointer; }
        .sr7-returnBtn.is-disabled { opacity: 0.45; cursor: not-allowed; }
        .sr7-selectedPieceCard strong { display: block; font-size: 18px; color: #17253a; }
        .sr7-selectedPieceCard p { margin: 8px 0 0; color: #5f6f80; font-size: 14px; }
        .sr7-finishedBins { display: grid; gap: 10px; margin-top: 10px; }
        .sr7-finishedBin { border-radius: 16px; border: 1px solid rgba(122,90,51,0.16); background: linear-gradient(180deg, rgba(253,248,239,0.95), rgba(245,238,228,0.98)); padding: 12px 14px; }
        .sr7-finishedBin strong { display: block; color: #5d4323; font-size: 16px; }
        .sr7-finishedBin span { display: block; margin-top: 6px; color: #8a6c47; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 800; }
        .sr7-queueList { display: grid; gap: 10px; margin-top: 10px; }
        .sr7-queueItem { border-radius: 16px; border: 1px solid rgba(148,163,184,0.16); background: rgba(248,250,252,0.98); padding: 12px; }
        .sr7-queueItem.is-selected { border-color: rgba(45,108,223,0.28); background: #eef6ff; box-shadow: 0 0 0 1px rgba(45,108,223,0.10) inset; }
        .sr7-queueText strong { display: block; color: #17253a; font-size: 15px; }
        .sr7-queueText span { display: block; margin-top: 6px; color: #64748b; font-size: 12px; letter-spacing: 0.10em; text-transform: uppercase; font-weight: 800; }
        .sr7-queueActions { display: flex; gap: 8px; margin-top: 10px; }
        .sr7-queueBtn { appearance: none; flex: 1; border-radius: 12px; border: 1px solid rgba(148,163,184,0.18); background: #fff; color: #425466; padding: 10px 12px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 800; cursor: pointer; }
        .sr7-queueBtnPrimary { background: #eef6ff; border-color: rgba(45,108,223,0.18); color: #255aac; }
        .sr7-empty, .sr7-helper { color: #5f6f80; font-size: 14px; line-height: 1.65; }
        @media (max-width: 1360px) {
          .sr7-main { grid-template-columns: 1fr; }
        }
        @media (max-width: 980px) {
          .sr7-hero { flex-direction: column; }
          .sr7-hud, .sr7-miniHud { min-width: 0; width: 100%; }
          .sr7-title { font-size: 38px; }
          .sr7-bayGrid { grid-template-columns: 1fr; }
          .sr7-queueActions { flex-direction: column; }
        }
      `}</style>
    </>
  );
}