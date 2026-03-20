"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDefaultAppState, loadSnapshots, persistSelectedZone, type SavedProjectSnapshot } from "../../lib/cbmall-store";

export default function SellerHubPage() {
  const [snapshots, setSnapshots] = useState<SavedProjectSnapshot[]>([]);
  const [state, setState] = useState(getDefaultAppState());

  useEffect(() => {
    persistSelectedZone("operate");
    setSnapshots(loadSnapshots());
    setState(getDefaultAppState());
  }, []);

  const materialLabel = useMemo(() => {
    return state.selection.material
      ? `${state.selection.material.color} ${state.selection.material.thickness}T`
      : "미선택";
  }, [state.selection.material]);

  const drawerSummary = useMemo(() => {
    return {
      recent: snapshots.filter((item) => item.drawerType === "recent_work").length,
      completed: snapshots.filter((item) => item.drawerType === "completed_work").length,
      reorder: snapshots.filter((item) => item.drawerType === "reorder_pack").length,
    };
  }, [snapshots]);

  return (
    <main className="app-shell workshop-surface">
      <header className="site-topbar">
        <div>
          <div className="eyebrow">OPERATION HUB</div>
          <h1 className="page-title">운영 허브</h1>
          <p className="muted">
            운영 페이지도 카드 나열이 아니라, 상담 데스크 · 재고 선반 · 상태 보드가 같이 있는 공방 운영 존으로 밀어붙이는 단계다.
          </p>
        </div>

        <div className="action-row">
          <Link className="ghost-btn" href="/mode-select">내 작업실</Link>
          <Link className="ghost-btn" href="/storage">보관함</Link>
          <Link className="primary-btn" href="/b2b">B2B</Link>
        </div>
      </header>

      <section className="ops-stage">
        <div className="ops-wall" />
        <div className="ops-floor" />

        <article className="ops-object desk-zone">
          <div className="zone-head">
            <div className="eyebrow">B2B DESK</div>
            <h2 className="section-title">대량 주문 / 기관 주문</h2>
            <p className="muted">상담용 카탈로그와 견적 응대가 이루어지는 운영 데스크.</p>
          </div>

          <div className="desk-scene">
            <div className="desk-table" />
            <div className="desk-monitor" />
            <div className="desk-catalog" />
            <div className="desk-board" />
          </div>

          <Link className="primary-btn full-width" href="/b2b">B2B 페이지 열기</Link>
        </article>

        <article className="ops-object rack-zone">
          <div className="zone-head">
            <div className="eyebrow">CLEARANCE RACK</div>
            <h2 className="section-title">땡처리 / 재고 정리</h2>
            <p className="muted">남는 재고, 샘플, 중복 생산분을 정리하는 선반 존.</p>
          </div>

          <div className="rack-scene">
            <div className="rack-grid">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <Link className="primary-btn full-width" href="/clearance">땡처리 페이지 열기</Link>
        </article>

        <article className="ops-object board-zone">
          <div className="zone-head">
            <div className="eyebrow">STATUS BOARD</div>
            <h2 className="section-title">최근 작업 현황</h2>
          </div>

          <div className="selected-summary">
            <div className="summary-row">
              <span>자재</span>
              <b>{materialLabel}</b>
            </div>
            <div className="summary-row">
              <span>부자재</span>
              <b>{state.selection.parts.length > 0 ? `${state.selection.parts.length}종` : "미선택"}</b>
            </div>
            <div className="summary-row">
              <span>최근 작업</span>
              <b>{drawerSummary.recent}</b>
            </div>
            <div className="summary-row">
              <span>제작 완료</span>
              <b>{drawerSummary.completed}</b>
            </div>
            <div className="summary-row">
              <span>재주문</span>
              <b>{drawerSummary.reorder}</b>
            </div>
          </div>
        </article>
      </section>

      <style jsx>{`
        .ops-stage {
          position: relative;
          overflow: hidden;
          min-height: 520px;
          border-radius: 34px;
          border: 1px solid #d9e1e8;
          background: linear-gradient(180deg, #fafcfd 0%, #eef3f7 58%, #e7edf3 100%);
          box-shadow: 0 18px 48px rgba(17,24,39,0.08);
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr 0.9fr;
          gap: 18px;
        }

        .ops-wall {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 68%;
          background:
            radial-gradient(circle at 50% 8%, rgba(255, 193, 140, 0.14), transparent 20%),
            linear-gradient(180deg, rgba(255,255,255,0.78), rgba(241,246,250,0.9));
        }

        .ops-floor {
          position: absolute;
          left: -4%;
          right: -4%;
          bottom: -10%;
          height: 34%;
          transform: perspective(1200px) rotateX(74deg);
          background:
            repeating-linear-gradient(90deg, rgba(137,153,167,0.1) 0 2px, transparent 2px 88px),
            repeating-linear-gradient(180deg, rgba(137,153,167,0.1) 0 2px, transparent 2px 88px),
            linear-gradient(180deg, #dfe7ee, #ced8e2);
          border-top: 1px solid #c9d3dc;
        }

        .ops-object {
          position: relative;
          z-index: 2;
          border: 1px solid #d7e0e8;
          border-radius: 30px;
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(242,247,251,0.92));
          box-shadow: 0 18px 44px rgba(17,24,39,0.06);
          padding: 18px;
        }

        .zone-head {
          margin-bottom: 14px;
        }

        .desk-scene,
        .rack-scene {
          min-height: 210px;
          border-radius: 24px;
          border: 1px solid #d5dee7;
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,244,248,0.92));
          position: relative;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .desk-table {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 20px;
          height: 58px;
          border-radius: 18px;
          border: 1px solid #d5c9b7;
          background: linear-gradient(180deg, #eadcc7, #d8c8af);
        }

        .desk-monitor {
          position: absolute;
          left: 34px;
          top: 28px;
          width: 120px;
          height: 78px;
          border-radius: 14px;
          border: 1px solid #cad4dd;
          background: linear-gradient(180deg, #fdfefe, #eef4f8);
        }

        .desk-catalog {
          position: absolute;
          left: 182px;
          top: 48px;
          width: 94px;
          height: 58px;
          border-radius: 12px;
          background: linear-gradient(180deg, #fff6ea, #ffe5c8);
          border: 1px solid #f2c28d;
          transform: rotate(-6deg);
        }

        .desk-board {
          position: absolute;
          right: 34px;
          top: 56px;
          width: 88px;
          height: 62px;
          border-radius: 12px;
          background: linear-gradient(180deg, #f8fafb, #edf3f7);
          border: 1px solid #d7e0e8;
          transform: rotate(7deg);
        }

        .rack-grid {
          position: absolute;
          inset: 22px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 12px;
          align-content: start;
        }

        .rack-grid span {
          min-height: 58px;
          border-radius: 14px;
          border: 1px solid #d7e0e8;
          background: rgba(255,255,255,0.95);
          position: relative;
        }

        .rack-grid span::after {
          content: "";
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 10px;
          height: 16px;
          border-radius: 10px;
          background: rgba(255, 188, 128, 0.22);
        }

        .board-zone {
          background:
            radial-gradient(circle at 50% 0%, rgba(255, 190, 136, 0.12), transparent 28%),
            linear-gradient(180deg, rgba(255,255,255,0.98), rgba(242,247,251,0.94));
        }

        @media (max-width: 1180px) {
          .ops-stage {
            grid-template-columns: 1fr;
            min-height: auto;
          }
        }
      `}</style>
    </main>
  );
}