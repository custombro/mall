"use client";

import React, { useMemo, useState } from "react";
import {
  type BenchSlotId,
  type PieceId,
  getPlacedPieceIds,
  initialPlacedPieces,
  mergeIncomingPieces,
  pieceOrder,
  removeAssignedPiece,
} from "../../../../lib/cb-workshop-stage-store";
import { useWorkshopStage } from "../../../../hooks/use-workshop-stage";
import {
  type FocusZone,
  type ViewMode,
  benchSlots,
  materialRack,
  partsDrawers,
  piecePalette,
  preferredSlotForPiece,
  sceneAnchorPosition,
  slotRules,
} from "./keyring-config";

import { KeyringProductionPipelinePanel } from "./KeyringProductionPipelinePanel";
import { KeyringSharedDraftPreviewCard } from "./KeyringSharedDraftPreviewCard";
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function KeyringWorkbenchClient() {
  const { stageState, updateStageState } = useWorkshopStage();

  const [viewMode, setViewMode] = useState<ViewMode>("layout");
  const [focusZone, setFocusZone] = useState<FocusZone>("preview");
  const [draggingPiece, setDraggingPiece] = useState<PieceId | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<PieceId | null>("frontPlate");
  const [hoveredSlot, setHoveredSlot] = useState<BenchSlotId | null>(null);
  const [sentPulse, setSentPulse] = useState(false);

  const placedPieces = stageState.placedPieces;
  const incomingCount = stageState.incomingPieceIds.length;
  const activePiece = draggingPiece ?? selectedPiece;

  const stagedCount = useMemo(
    () => Object.values(placedPieces).filter(Boolean).length,
    [placedPieces],
  );

  const stagedPieceIds = useMemo(
    () => getPlacedPieceIds(placedPieces),
    [placedPieces],
  );

  const completionRate = useMemo(
    () => Math.round((stagedCount / pieceOrder.length) * 100),
    [stagedCount],
  );

  const preferredSlot = activePiece ? preferredSlotForPiece[activePiece] : null;

  const snapReady = useMemo(() => {
    if (!activePiece || !hoveredSlot) return false;
    return slotRules[hoveredSlot].includes(activePiece);
  }, [activePiece, hoveredSlot]);

  const ghostPieceId = useMemo(() => {
    if (!activePiece) return null;
    if (stagedPieceIds.includes(activePiece)) return null;
    return activePiece;
  }, [activePiece, stagedPieceIds]);

  const ghostSlot = useMemo(() => {
    if (!ghostPieceId) return null;
    if (hoveredSlot && slotRules[hoveredSlot].includes(ghostPieceId)) return hoveredSlot;
    return preferredSlotForPiece[ghostPieceId];
  }, [ghostPieceId, hoveredSlot]);

  const hudStatus = snapReady
    ? "SNAP READY"
    : activePiece && hoveredSlot
      ? "ALIGNING"
      : stagedCount > 0
        ? "PLACED"
        : "IDLE";

  const hintText = snapReady
    ? "결합 가능 범위 진입 · 스냅 위치 확인"
    : activePiece
      ? "부품을 작업대 결합 포인트로 가져가세요"
      : "부품 서랍에서 조립 후보를 선택하세요";

  const placePiece = (slotId: BenchSlotId, piece: PieceId) => {
    if (!slotRules[slotId].includes(piece)) return;

    updateStageState((prev) => ({
      ...prev,
      placedPieces: {
        ...prev.placedPieces,
        [slotId]: piece,
      },
    }));

    setViewMode("assembly");
    setFocusZone("preview");
  };

  const clearSlot = (slotId: BenchSlotId) => {
    updateStageState((prev) => ({
      ...prev,
      placedPieces: {
        ...prev.placedPieces,
        [slotId]: null,
      },
    }));
  };

  const sendToStorage = () => {
    if (stagedPieceIds.length === 0) return;

    updateStageState((prev) => {
      let nextAssignments = { ...prev.storageAssignments };

      for (const pieceId of stagedPieceIds) {
        nextAssignments = removeAssignedPiece(nextAssignments, pieceId);
      }

      return {
        placedPieces: initialPlacedPieces,
        incomingPieceIds: mergeIncomingPieces(prev.incomingPieceIds, stagedPieceIds),
        storageAssignments: nextAssignments,
      };
    });

    setHoveredSlot(null);
    setDraggingPiece(null);
    setViewMode("storage");
    setFocusZone("optional");
    setSentPulse(true);
    window.setTimeout(() => setSentPulse(false), 700);
  };

  const resetWorkbench = () => {
    updateStageState((prev) => ({
      ...prev,
      placedPieces: initialPlacedPieces,
    }));

    setHoveredSlot(null);
    setDraggingPiece(null);
    setSelectedPiece("frontPlate");
    setViewMode("layout");
    setFocusZone("preview");
  };

  const handleSlotKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    slotId: BenchSlotId,
  ) => {
    if ((event.key === "Enter" || event.key === " ") && activePiece) {
      event.preventDefault();
      placePiece(slotId, activePiece);
    }
  };

  return (
    <>
      <main className="kw7-page">
        <div className="kw7-shell">
          <section className="kw7-frame">
            <div className="kw7-hero">
              <div className="kw7-heroLeft">
                <div className="kw7-kicker">CUSTOMBRO WORKSHOP · KEYRING</div>
                <h1 className="kw7-title">밝은 작업대 키링 공정</h1>
                <p className="kw7-desc">
                  파란 금속 랙의 아크릴 원장, 투명 부자재함, 중앙 나무 작업대, 하부 완료품 보관통까지
                  실제 공방형 흐름으로 정리한 키링 작업 화면입니다.
                </p>
                <div className="kw7-meta">
                  <span>파란 랙</span>
                  <span>두랭 3T</span>
                  <span>투명 부자재함</span>
                  <span>완료품 보관통</span>
                </div>
              </div>

              <div className="kw7-hud">
                <div className="kw7-hudItem">
                  <span>HUD</span>
                  <strong>{hudStatus}</strong>
                </div>
                <div className="kw7-hudItem">
                  <span>VIEW</span>
                  <strong>{viewMode}</strong>
                </div>
                <div className="kw7-hudItem">
                  <span>STAGED</span>
                  <strong>{stagedCount} / 4</strong>
                </div>
              </div>
            </div>

            <div className="kw7-toolbar">
              {([
                ["material", "원자재 랙"],
                ["parts", "부자재 서랍"],
                ["preview", "중앙 작업대"],
                ["optional", "하부 보관통"],
              ] as [FocusZone, string][]).map(([zone, label]) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setFocusZone(zone)}
                  className={cx("kw7-pill", focusZone === zone && "is-active")}
                >
                  {label}
                </button>
              ))}

              <div className="kw7-divider" />

              {([
                ["layout", "LAYOUT"],
                ["assembly", "ASSEMBLY"],
                ["storage", "STORAGE"],
              ] as [ViewMode, string][]).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cx("kw7-pill", viewMode === mode && "is-active")}
                >
                  {label}
                </button>
              ))}

              <button
                type="button"
                onClick={sendToStorage}
                disabled={stagedCount === 0}
                className={cx("kw7-pill", "kw7-pillPrimary", stagedCount === 0 && "is-disabled", sentPulse && "is-sent")}
              >
                TO STORAGE ({stagedCount})
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = "/storage"; }}
                className="kw7-pill kw7-pillLink"
              >
                OPEN STORAGE
              </button>

              <button type="button" onClick={resetWorkbench} className="kw7-pill kw7-pillReset">
                RESET
              </button>
            </div>

            <div className="kw7-grid">
              <aside className={cx("kw7-panel", "kw7-rackPanel", focusZone === "material" && "is-focus")}>
                <div className="kw7-panelHead">
                  <div>
                    <div className="kw7-caption">원자재 존</div>
                    <h2>금속 랙</h2>
                  </div>
                  <span className="kw7-chip">INDUSTRIAL RACK</span>
                </div>

                <div className="kw7-rackBody">
                  {materialRack.map((item) => (
                    <div key={item.id} className="kw7-rackCard">
                      <div className="kw7-rackRail" />
                      <div className="kw7-rackTop">
                        <span className="kw7-rackShelf">{item.shelf}</span>
                        <span className="kw7-rackCount">{item.stack}</span>
                      </div>
                      <div className="kw7-sheetStack">
                        <i />
                        <i />
                        <i />
                      </div>
                      <strong>{item.label}</strong>
                      <p>{item.note}</p>
                    </div>
                  ))}
                </div>
              </aside>

              <section className={cx("kw7-panel", "kw7-benchPanel", focusZone === "preview" && "is-focus")}>
                <div className="kw7-panelHead kw7-panelHeadWide">
                  <div>
                    <div className="kw7-caption">중앙 작업대</div>
                    <h2>Assembly Preview Bench</h2>
                    <p>{hintText}</p>
                  </div>

                  <div className="kw7-miniHud">
                    <div>
                      <span>ACTIVE PIECE</span>
                      <strong>{activePiece ? piecePalette[activePiece].label : "없음"}</strong>
                    </div>
                    <div>
                      <span>COMPLETE</span>
                      <strong>{completionRate}%</strong>
                    </div>
                  </div>
                </div>

                <div className="kw7-recipeRow">
                  {pieceOrder.map((pieceId) => {
                    const item = piecePalette[pieceId];
                    const isPlaced = stagedPieceIds.includes(pieceId);
                    const isSelected = activePiece === pieceId;

                    return (
                      <button
                        key={pieceId}
                        type="button"
                        onClick={() => {
                          setSelectedPiece(pieceId);
                          setFocusZone("parts");
                          setViewMode("assembly");
                        }}
                        className={cx("kw7-recipeChip", isSelected && "is-selected", isPlaced && "is-done")}
                        style={isSelected ? { borderColor: `${item.accent}88`, boxShadow: `0 0 0 1px ${item.accent}22 inset` } : undefined}
                      >
                        <span>{item.mini}</span>
                        <strong>{item.label}</strong>
                        <i>{isPlaced ? "DONE" : "READY"}</i>
                      </button>
                    );
                  })}
                </div>

                <div className="kw7-progressStrip">
                  {benchSlots.map((slot) => {
                    const isCurrent = preferredSlot === slot.id;
                    const hasPiece = Boolean(placedPieces[slot.id]);
                    return (
                      <div key={slot.id} className={cx("kw7-progressStep", isCurrent && "is-current", hasPiece && "is-done")}>
                        <span>{slot.id}</span>
                        <strong>{slot.label}</strong>
                        <i>{hasPiece ? "PLACED" : isCurrent ? "TARGET" : "WAIT"}</i>
                      </div>
                    );
                  })}
                </div>

                <div className="kw7-supplyRow">
                  <div className="kw7-supplyBin"><strong>D고리</strong><span>소형 투명함</span></div>
                  <div className="kw7-supplyBin"><strong>O링</strong><span>소형 투명함</span></div>
                  <div className="kw7-supplyBin"><strong>OPP</strong><span>포장 준비</span></div>
                  <div className="kw7-supplyBin"><strong>두랭 3T</strong><span>중앙 원장</span></div>
                </div>

                <div className="kw7-tableSurface">
                  <div className="kw7-acrylicSheet">
                    <span>두랭 3T</span>
                  </div>

                  <div className="kw7-scenePanel">
                    <div className="kw7-sceneHead">
                      <div>
                        <strong>조립 스냅 프리뷰</strong>
                        <p>선택 부품은 고스트로, 배치 완료 부품은 실제 레이어로 표시됩니다.</p>
                      </div>
                      <span className="kw7-chip">LIVE SNAP</span>
                    </div>

                    <div className="kw7-sceneBoard">
                      {Object.entries(sceneAnchorPosition).map(([slotId, pos]) => {
                        const typedSlotId = slotId as BenchSlotId;
                        const isPlaced = Boolean(placedPieces[typedSlotId]);
                        const isGhost = ghostSlot === typedSlotId;
                        const isPreferred = preferredSlot === typedSlotId;

                        return (
                          <div
                            key={slotId}
                            className={cx(
                              "kw7-sceneAnchor",
                              isPlaced && "is-placed",
                              isGhost && "is-ghost",
                              isPreferred && "is-preferred",
                            )}
                            style={{ top: pos.top, left: pos.left }}
                          >
                            <span>{pos.label}</span>
                          </div>
                        );
                      })}

                      <div className="kw7-scenePiece is-backPlate is-placed" data-visible={stagedPieceIds.includes("backPlate")}>
                        <div className="kw7-pieceLabel">후면</div>
                      </div>
                      <div className="kw7-scenePiece is-frontPlate is-placed" data-visible={stagedPieceIds.includes("frontPlate")}>
                        <div className="kw7-pieceLabel">전면</div>
                      </div>
                      <div className="kw7-scenePiece is-ringHole is-placed" data-visible={stagedPieceIds.includes("ringHole")}>
                        <div className="kw7-pieceLabel">링</div>
                      </div>
                      <div className="kw7-scenePiece is-connector is-placed" data-visible={stagedPieceIds.includes("connector")}>
                        <div className="kw7-pieceLabel">연결</div>
                      </div>

                      {ghostPieceId && (
                        <div className={cx("kw7-scenePiece", `is-${ghostPieceId}`, "is-ghostPiece")}>
                          <div className="kw7-pieceLabel">ghost</div>
                        </div>
                      )}

                      <div className="kw7-sceneGuide is-vertical" />
                      <div className="kw7-sceneGuide is-horizontal" />
                    </div>
                  </div>

                  <div className="kw7-slotGrid">
                    {benchSlots.map((slot) => {
                      const placed = placedPieces[slot.id];
                      const isHot = hoveredSlot === slot.id;
                      const canSnap = Boolean(activePiece && slotRules[slot.id].includes(activePiece));
                      const accent = activePiece ? piecePalette[activePiece].accent : "#7b8aa3";
                      const isTarget = preferredSlot === slot.id;

                      return (
                        <div
                          key={slot.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`${slot.label} 슬롯`}
                          onKeyDown={(event) => handleSlotKeyDown(event, slot.id)}
                          onClick={() => {
                            if (activePiece) placePiece(slot.id, activePiece);
                          }}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setHoveredSlot(slot.id);
                            setViewMode("assembly");
                            setFocusZone("preview");
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (activePiece) {
                              placePiece(slot.id, activePiece);
                              setSelectedPiece(activePiece);
                            }
                            setDraggingPiece(null);
                            setHoveredSlot(null);
                          }}
                          onDragLeave={() => {
                            setHoveredSlot((prev) => (prev === slot.id ? null : prev));
                          }}
                          className={cx(
                            "kw7-slotCard",
                            isHot && "is-hot",
                            canSnap && "is-compatible",
                            isTarget && "is-target",
                          )}
                          style={
                            canSnap
                              ? {
                                  borderColor: isHot ? accent : `${accent}55`,
                                  boxShadow: isHot
                                    ? `0 0 0 1px ${accent} inset, 0 8px 20px ${accent}22`
                                    : `0 0 0 1px ${accent}22 inset`,
                                }
                              : undefined
                          }
                        >
                          <div className="kw7-slotHead">
                            <div>
                              <div className="kw7-slotId">{slot.id}</div>
                              <h3>{slot.label}</h3>
                              <p>{slot.note}</p>
                            </div>
                            <span
                              className="kw7-slotBadge"
                              style={canSnap ? { borderColor: `${accent}66`, color: accent } : undefined}
                            >
                              {placed ? "●" : canSnap ? "✓" : "+"}
                            </span>
                          </div>

                          <div className="kw7-slotBody">
                            {placed ? (
                              <div
                                className="kw7-placedCard"
                                style={{
                                  borderColor: `${piecePalette[placed].accent}55`,
                                  background: `linear-gradient(180deg, ${piecePalette[placed].accent}14, rgba(255,255,255,0.92))`,
                                }}
                              >
                                <div className="kw7-placedTop">
                                  <div className="kw7-placedTag">PLACED</div>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      clearSlot(slot.id);
                                    }}
                                    className="kw7-clearBtn"
                                  >
                                    REMOVE
                                  </button>
                                </div>
                                <strong>{piecePalette[placed].label}</strong>
                                <p>{piecePalette[placed].note}</p>
                              </div>
                            ) : (
                              <div className="kw7-guideBox">
                                <strong>결합 포인트 가이드</strong>
                                <div className="kw7-guideLine">
                                  <span />
                                  <i />
                                  <span />
                                </div>
                                <p>{canSnap ? "현재 선택 부품과 호환되는 위치" : "허용 부품을 드래그하거나 클릭해 배치"}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="kw7-benchFooter">
                    <div className="kw7-statusDot" />
                    <span>{snapReady ? "snap range detected" : "ghost placement skeleton"}</span>
                  </div>
                </div>
              </section>

              <aside className={cx("kw7-panel", "kw7-partsPanel", focusZone === "parts" && "is-focus")}>
                <div className="kw7-panelHead">
                  <div>
                    <div className="kw7-caption">부품 존</div>
                    <h2>부자재 서랍</h2>
                  </div>
                  <span className="kw7-chip">CLEAR DRAWER</span>
                </div>

                <div className="kw7-drawerColumn">
                  {partsDrawers.map((drawer) => (
                    <div key={drawer.id} className="kw7-drawerBlock">
                      <strong className="kw7-drawerTitle">{drawer.title}</strong>

                      <div className="kw7-pieceList">
                        {drawer.pieces.map((piece) => {
                          const item = piecePalette[piece];
                          const isSelected = activePiece === piece;

                          return (
                            <button
                              key={piece}
                              type="button"
                              draggable
                              onDragStart={() => {
                                setDraggingPiece(piece);
                                setSelectedPiece(piece);
                                setViewMode("assembly");
                                setFocusZone("parts");
                              }}
                              onDragEnd={() => setDraggingPiece(null)}
                              onClick={() => {
                                setSelectedPiece(piece);
                                setViewMode("assembly");
                                setFocusZone("parts");
                              }}
                              className={cx("kw7-pieceBtn", isSelected && "is-selected")}
                              style={
                                isSelected
                                  ? { borderColor: `${item.accent}99`, boxShadow: `0 0 0 1px ${item.accent}33 inset` }
                                  : undefined
                              }
                            >
                              <div className="kw7-pieceIcon" style={{ background: `${item.accent}20`, borderColor: `${item.accent}44` }}>
                                {item.mini}
                              </div>
                              <div className="kw7-pieceText">
                                <strong>{item.label}</strong>
                                <p>{item.note}</p>
                              </div>
                              <span className="kw7-pieceTag" style={{ color: item.accent, borderColor: `${item.accent}44` }}>
                                {draggingPiece === piece ? "DRAG" : "PICK"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>

            <div className={cx("kw7-bottomPanel", focusZone === "optional" && "is-focus")}>
              <div className="kw7-panelHead kw7-panelHeadWide">
                <div>
                  <div className="kw7-caption">하부 보관통</div>
                  <h2>Storage Bins</h2>
                  <p>작업 테이블 하부의 완료품/출고 대기 흐름입니다.</p>
                </div>
                <div className="kw7-chip">PLACED PIECES: {stagedCount} / 4 · INCOMING {incomingCount}</div>
              </div>

              <div className="kw7-binGrid">
                {benchSlots.map((slot) => {
                  const placed = placedPieces[slot.id];
                  return (
                    <div key={slot.id} className="kw7-binCard">
                      <div className="kw7-binLabel">제작 완료</div>
                      <strong>{slot.label}</strong>
                      <p>{placed ? `${piecePalette[placed].label} 보관 준비` : "비어 있음"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
            {/* STAGE18_STEPA_PIPELINE */}
      <KeyringProductionPipelinePanel />
      {/* STEPC_WORKBENCH_SHARED_PREVIEW */}
      <KeyringSharedDraftPreviewCard />
</main>

      <style jsx global>{`
        .kw7-page { min-height: 100vh; background: linear-gradient(180deg, #f6f5f1 0%, #eef2f6 100%); color: #122034; }
        .kw7-shell { max-width: 1680px; margin: 0 auto; padding: 18px; }
        .kw7-frame { background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(249,250,252,0.98)); border: 1px solid rgba(148,163,184,0.22); border-radius: 30px; box-shadow: 0 18px 46px rgba(30,41,59,0.08); overflow: hidden; }
        .kw7-hero { display: flex; justify-content: space-between; gap: 22px; padding: 22px 24px 18px; background: linear-gradient(90deg, rgba(254,251,244,0.95), rgba(244,248,252,0.96)), #fff; border-bottom: 1px solid rgba(148,163,184,0.18); }
        .kw7-heroLeft { min-width: 0; }
        .kw7-kicker { font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: #42607f; font-weight: 800; margin-bottom: 10px; }
        .kw7-title { margin: 0; font-size: 56px; line-height: 1.02; letter-spacing: -0.04em; color: #18263c; }
        .kw7-desc { margin: 14px 0 0; max-width: 900px; color: #526273; font-size: 15px; line-height: 1.75; }
        .kw7-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
        .kw7-meta span { padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.78); border: 1px solid rgba(148,163,184,0.18); color: #475569; font-size: 12px; font-weight: 700; }
        .kw7-hud { display: grid; grid-template-columns: repeat(3, minmax(124px, 1fr)); gap: 10px; min-width: 420px; padding: 12px; border-radius: 22px; border: 1px solid rgba(49,113,173,0.14); background: linear-gradient(180deg, rgba(240,248,247,0.92), rgba(246,250,251,0.96)); }
        .kw7-hudItem { padding: 10px 12px; border-radius: 16px; background: rgba(255,255,255,0.78); border: 1px solid rgba(148,163,184,0.12); }
        .kw7-hudItem span { display: block; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #58728a; font-weight: 800; }
        .kw7-hudItem strong { display: block; margin-top: 6px; font-size: 22px; color: #132238; }
        .kw7-toolbar { display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 24px; align-items: center; background: rgba(255,255,255,0.78); border-bottom: 1px solid rgba(148,163,184,0.16); }
        .kw7-pill { appearance: none; border: 1px solid rgba(148,163,184,0.2); background: #ffffff; color: #425466; border-radius: 999px; padding: 10px 14px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 800; cursor: pointer; }
        .kw7-pill:hover { background: #f8fbff; border-color: rgba(59,130,246,0.26); color: #24456c; }
        .kw7-pill.is-active { background: #fff4d6; border-color: rgba(200,138,17,0.35); color: #8a5e07; }
        .kw7-pillPrimary { background: #e8f5ff; border-color: rgba(45,108,223,0.28); color: #245bac; }
        .kw7-pillPrimary.is-sent { box-shadow: 0 0 0 6px rgba(45,108,223,0.10); }
        .kw7-pillLink { background: #f4f8ff; border-color: rgba(59,130,246,0.2); color: #2d5ea5; }
        .kw7-pill.is-disabled { opacity: 0.46; cursor: not-allowed; }
        .kw7-pillReset { background: #fff0f1; border-color: rgba(220,38,38,0.18); color: #9f2335; }
        .kw7-divider { width: 1px; height: 28px; background: rgba(148,163,184,0.22); margin: 0 2px; }
        .kw7-grid { display: grid; grid-template-columns: 300px minmax(0,1fr) 330px; gap: 18px; padding: 18px 24px; }
        .kw7-panel, .kw7-bottomPanel { border-radius: 28px; border: 1px solid rgba(148,163,184,0.18); background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(245,247,250,0.96)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5); }
        .kw7-panel { padding: 16px; }
        .kw7-bottomPanel { padding: 16px; margin: 0 24px 24px; }
        .kw7-panel.is-focus, .kw7-bottomPanel.is-focus { border-color: rgba(61,126,197,0.34); box-shadow: 0 10px 28px rgba(59,130,246,0.08), inset 0 0 0 1px rgba(255,255,255,0.7); }
        .kw7-rackPanel { background: linear-gradient(180deg, rgba(241,247,252,0.96), rgba(244,247,251,0.98)); }
        .kw7-benchPanel { background: linear-gradient(180deg, rgba(251,251,247,0.94), rgba(249,247,241,0.97)); min-width: 0; }
        .kw7-partsPanel { background: linear-gradient(180deg, rgba(252,250,246,0.95), rgba(248,246,242,0.98)); }
        .kw7-panelHead { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .kw7-panelHeadWide { align-items: end; padding-bottom: 14px; border-bottom: 1px solid rgba(148,163,184,0.16); }
        .kw7-caption { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #6a7d91; font-weight: 800; margin-bottom: 8px; }
        .kw7-panel h2, .kw7-bottomPanel h2 { margin: 0; font-size: 24px; line-height: 1.12; color: #16243a; }
        .kw7-panelHead p, .kw7-bottomPanel p { margin: 10px 0 0; color: #5f6e7f; font-size: 14px; line-height: 1.68; }
        .kw7-chip { padding: 8px 11px; border-radius: 999px; background: rgba(255,255,255,0.82); border: 1px solid rgba(148,163,184,0.18); color: #405366; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 800; white-space: nowrap; }
        .kw7-rackBody { display: grid; gap: 12px; margin-top: 16px; }
        .kw7-rackCard { position: relative; padding: 14px 14px 14px 22px; border-radius: 22px; border: 1px solid rgba(68,109,149,0.2); background: linear-gradient(180deg, rgba(220,231,241,0.96), rgba(246,248,251,0.98)); overflow: hidden; }
        .kw7-rackRail { position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: linear-gradient(180deg, #5f8fc1, #31587f); }
        .kw7-rackTop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .kw7-rackShelf, .kw7-rackCount { padding: 5px 9px; border-radius: 999px; background: rgba(255,255,255,0.84); border: 1px solid rgba(68,109,149,0.18); color: #41658d; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .kw7-sheetStack { position: relative; height: 74px; margin-bottom: 12px; }
        .kw7-sheetStack i { position: absolute; left: 12px; right: 12px; height: 42px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.7); background: linear-gradient(135deg, rgba(255,255,255,0.78), rgba(176,192,208,0.22)); }
        .kw7.sheetStack i:nth-child(1) { top: 22px; }
        .kw7-sheetStack i:nth-child(1) { top: 22px; }
        .kw7-sheetStack i:nth-child(2) { top: 11px; }
        .kw7-sheetStack i:nth-child(3) { top: 0; }
        .kw7-rackCard strong { display: block; font-size: 15px; color: #13253e; }
        .kw7-rackCard p { margin: 7px 0 0; font-size: 13px; color: #506274; line-height: 1.55; }
        .kw7-miniHud { display: grid; grid-template-columns: repeat(2, minmax(120px, 1fr)); gap: 10px; padding: 12px; border-radius: 20px; border: 1px solid rgba(148,163,184,0.16); background: rgba(255,255,255,0.8); min-width: 280px; }
        .kw7-miniHud span { display: block; color: #6a7d91; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 800; }
        .kw7-miniHud strong { display: block; margin-top: 6px; color: #16253a; font-size: 18px; }
        .kw7-recipeRow { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; margin-top: 16px; }
        .kw7-recipeChip { appearance: none; text-align: left; border-radius: 18px; border: 1px solid rgba(148,163,184,0.18); background: rgba(255,255,255,0.82); padding: 12px; color: inherit; cursor: pointer; }
        .kw7-recipeChip span { display: inline-flex; min-width: 38px; height: 24px; align-items: center; justify-content: center; border-radius: 999px; background: #edf2f7; color: #506274; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .kw7-recipeChip strong { display: block; margin-top: 10px; font-size: 14px; color: #17253a; }
        .kw7-recipeChip i { display: block; margin-top: 6px; font-style: normal; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; font-weight: 800; }
        .kw7-recipeChip.is-selected { background: #f7fbff; }
        .kw7-recipeChip.is-done { background: linear-gradient(180deg, rgba(237,248,240,0.95), rgba(255,255,255,0.92)); }
        .kw7-progressStrip { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; margin-top: 12px; }
        .kw7-progressStep { border-radius: 16px; border: 1px solid rgba(148,163,184,0.16); background: rgba(255,255,255,0.76); padding: 10px 12px; }
        .kw7-progressStep span { display: block; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; font-weight: 800; }
        .kw7-progressStep strong { display: block; margin-top: 5px; font-size: 13px; color: #17253a; }
        .kw7-progressStep i { display: block; margin-top: 5px; font-style: normal; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #748396; font-weight: 800; }
        .kw7-progressStep.is-current { border-color: rgba(45,108,223,0.24); background: #eef6ff; }
        .kw7-progressStep.is-done { border-color: rgba(15,155,111,0.24); background: #edf9f3; }
        .kw7-supplyRow { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
        .kw7-supplyBin { border-radius: 18px; border: 1px solid rgba(148,163,184,0.18); background: rgba(255,255,255,0.82); padding: 12px; }
        .kw7-supplyBin strong { display: block; font-size: 14px; color: #18263c; }
        .kw7-supplyBin span { display: block; margin-top: 6px; font-size: 12px; color: #64748b; font-weight: 700; }
        .kw7-tableSurface { margin-top: 14px; border-radius: 26px; border: 1px solid rgba(181,146,83,0.22); background: linear-gradient(180deg, rgba(243,230,199,0.94), rgba(224,200,157,0.98)); padding: 18px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.35); }
        .kw7-acrylicSheet { height: 54px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.68); background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(198,216,234,0.16)); display: flex; align-items: center; justify-content: center; color: #526273; font-size: 18px; font-weight: 800; letter-spacing: 0.06em; margin-bottom: 16px; }
        .kw7-scenePanel { border-radius: 22px; border: 1px solid rgba(126,96,46,0.16); background: rgba(255,255,255,0.38); padding: 14px; margin-bottom: 14px; }
        .kw7-sceneHead { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .kw7-sceneHead strong { display: block; font-size: 16px; color: #17253a; }
        .kw7-sceneHead p { margin: 8px 0 0; color: #6a7480; font-size: 13px; line-height: 1.55; }
        .kw7-sceneBoard { position: relative; height: 290px; margin-top: 14px; border-radius: 20px; border: 1px dashed rgba(126,96,46,0.18); background: linear-gradient(180deg, rgba(255,255,255,0.58), rgba(246,241,229,0.82)); overflow: hidden; }
        .kw7-sceneGuide { position: absolute; background: rgba(120,106,86,0.18); }
        .kw7-sceneGuide.is-vertical { width: 1px; top: 18px; bottom: 18px; left: 50%; }
        .kw7-sceneGuide.is-horizontal { height: 1px; left: 18px; right: 18px; top: 58%; }
        .kw7-sceneAnchor { position: absolute; width: 34px; height: 34px; margin-left: -17px; margin-top: -17px; border-radius: 999px; border: 1px solid rgba(148,163,184,0.24); background: rgba(255,255,255,0.82); display: flex; align-items: center; justify-content: center; color: #6a7d91; font-size: 11px; font-weight: 800; box-shadow: 0 2px 6px rgba(15,23,42,0.06); }
        .kw7-sceneAnchor.is-preferred { border-color: rgba(45,108,223,0.35); color: #255aac; box-shadow: 0 0 0 6px rgba(45,108,223,0.08); }
        .kw7-sceneAnchor.is-ghost { border-color: rgba(200,138,17,0.32); color: #8a5e07; box-shadow: 0 0 0 8px rgba(200,138,17,0.10); }
        .kw7-sceneAnchor.is-placed { border-color: rgba(15,155,111,0.28); color: #0f9b6f; box-shadow: 0 0 0 8px rgba(15,155,111,0.08); }
        .kw7-scenePiece { position: absolute; opacity: 0; pointer-events: none; transition: 150ms ease; }
        .kw7-scenePiece[data-visible="true"] { opacity: 1; }
        .kw7-scenePiece.is-ghostPiece { opacity: 0.6; border-style: dashed !important; }
        .kw7-scenePiece.is-frontPlate {
          top: 82px; left: 50%; width: 174px; height: 116px; margin-left: -87px;
          border-radius: 24px; border: 2px solid rgba(45,108,223,0.32);
          background: linear-gradient(180deg, rgba(232,243,253,0.88), rgba(255,255,255,0.72));
        }
        .kw7-scenePiece.is-backPlate {
          top: 96px; left: 50%; width: 192px; height: 132px; margin-left: -96px;
          border-radius: 28px; border: 2px solid rgba(15,155,111,0.30);
          background: linear-gradient(180deg, rgba(231,249,241,0.82), rgba(255,255,255,0.66));
        }
        .kw7-scenePiece.is-ringHole {
          top: 44px; left: 50%; width: 54px; height: 54px; margin-left: -27px;
          border-radius: 999px; border: 2px solid rgba(200,138,17,0.36);
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.96) 18%, rgba(255,240,205,0.78) 55%, rgba(243,221,169,0.42) 100%);
        }
        .kw7-scenePiece.is-connector {
          top: 212px; left: 50%; width: 84px; height: 28px; margin-left: -42px;
          border-radius: 14px; border: 2px solid rgba(138,92,255,0.34);
          background: linear-gradient(180deg, rgba(240,234,255,0.88), rgba(255,255,255,0.72));
        }
        .kw7-pieceLabel {
          position: absolute; inset: auto 0 10px 0; text-align: center; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #5f6f80; font-weight: 800;
        }
        .kw7-slotGrid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
        .kw7-slotCard { border-radius: 24px; border: 1px solid rgba(126,96,46,0.22); background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.22)); padding: 14px; cursor: pointer; min-height: 220px; transition: 150ms ease; outline: none; }
        .kw7-slotCard:hover { transform: translateY(-1px); box-shadow: 0 12px 20px rgba(108,84,46,0.08); }
        .kw7-slotCard.is-hot { background: linear-gradient(180deg, rgba(255,250,236,0.86), rgba(255,255,255,0.32)); }
        .kw7-slotCard.is-compatible { outline: 2px solid rgba(59,130,246,0.06); }
        .kw7-slotCard.is-target { box-shadow: 0 0 0 1px rgba(45,108,223,0.08) inset; }
        .kw7-slotHead { display: flex; justify-content: space-between; gap: 12px; }
        .kw7-slotId { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #7b6f5f; font-weight: 800; }
        .kw7-slotHead h3 { margin: 6px 0 0; font-size: 22px; color: #16243a; }
        .kw7-slotHead p { margin: 7px 0 0; color: #675d50; font-size: 13px; line-height: 1.5; }
        .kw7-slotBadge { width: 38px; height: 38px; border-radius: 999px; border: 1px solid rgba(122,95,52,0.18); background: rgba(255,255,255,0.64); color: #81663a; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; flex: 0 0 auto; }
        .kw7-slotBody { margin-top: 16px; }
        .kw7-guideBox, .kw7-placedCard { border-radius: 20px; border: 1px dashed rgba(131,105,63,0.2); background: rgba(255,255,255,0.6); min-height: 126px; padding: 14px; }
        .kw7-guideBox strong, .kw7-placedCard strong { display: block; color: #18243a; font-size: 16px; }
        .kw7-guideBox p, .kw7-placedCard p { margin: 10px 0 0; color: #5f6c79; font-size: 13px; line-height: 1.55; }
        .kw7-placedTop { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
        .kw7-placedTag { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #567494; font-weight: 800; }
        .kw7-clearBtn { appearance: none; border: 1px solid rgba(220,38,38,0.14); background: #fff5f5; color: #9f2335; border-radius: 999px; padding: 6px 10px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 800; cursor: pointer; }
        .kw7-guideLine { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
        .kw7-guideLine span { width: 8px; height: 8px; border-radius: 999px; background: rgba(120,106,86,0.4); }
        .kw7-guideLine i { display: block; flex: 1; height: 1px; background: rgba(120,106,86,0.25); }
        .kw7-benchFooter { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
        .kw7-statusDot { width: 12px; height: 12px; border-radius: 999px; background: #6fb36a; box-shadow: 0 0 0 6px rgba(111,179,106,0.14); }
        .kw7-benchFooter span { color: #5b6a78; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 800; }
        .kw7-drawerColumn { display: grid; gap: 14px; margin-top: 16px; }
        .kw7-drawerBlock { border-radius: 22px; border: 1px solid rgba(148,163,184,0.18); background: rgba(255,255,255,0.78); padding: 14px; }
        .kw7-drawerTitle { display: block; font-size: 15px; color: #1a283d; }
        .kw7-pieceList { display: grid; gap: 10px; margin-top: 12px; }
        .kw7-pieceBtn { appearance: none; width: 100%; display: grid; grid-template-columns: 48px minmax(0,1fr) auto; gap: 10px; align-items: center; text-align: left; border-radius: 18px; border: 1px solid rgba(148,163,184,0.18); background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(246,248,250,0.96)); padding: 10px 12px; cursor: grab; color: inherit; }
        .kw7-pieceBtn:hover, .kw7-pieceBtn.is-selected { transform: translateY(-1px); box-shadow: 0 12px 18px rgba(59,130,246,0.06); }
        .kw7-pieceIcon { width: 48px; height: 48px; border-radius: 14px; border: 1px solid rgba(148,163,184,0.25); display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #35506d; }
        .kw7-pieceText strong { display: block; color: #16253a; font-size: 14px; }
        .kw7-pieceText p { margin: 5px 0 0; color: #627181; font-size: 12px; line-height: 1.45; }
        .kw7-pieceTag { padding: 6px 9px; border-radius: 999px; border: 1px solid rgba(148,163,184,0.22); background: rgba(255,255,255,0.88); font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
        .kw7-binGrid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin-top: 16px; }
        .kw7-binCard { position: relative; min-height: 126px; border-radius: 22px; border: 1px solid rgba(148,163,184,0.16); background: linear-gradient(180deg, rgba(248,251,254,0.94), rgba(238,243,248,0.98)); padding: 14px; }
        .kw7-binCard::before { content: ""; position: absolute; left: 14px; right: 14px; top: 14px; height: 30px; border-radius: 12px; background: rgba(255,255,255,0.58); border: 1px solid rgba(148,163,184,0.12); }
        .kw7-binLabel { position: relative; z-index: 1; color: #7a8b9a; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
        .kw7-binCard strong { position: relative; z-index: 1; display: block; margin-top: 26px; font-size: 16px; color: #17253a; }
        .kw7-binCard p { position: relative; z-index: 1; margin: 8px 0 0; color: #5f6f80; font-size: 13px; line-height: 1.5; }
        @media (max-width: 1360px) {
          .kw7-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 980px) {
          .kw7-hero { flex-direction: column; }
          .kw7-hud, .kw7-miniHud { min-width: 0; width: 100%; }
          .kw7-title { font-size: 40px; }
          .kw7-recipeRow, .kw7-progressStrip, .kw7-supplyRow, .kw7-slotGrid, .kw7-binGrid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}