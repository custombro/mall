"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  loadActivePreset,
  loadSelectedZone,
  persistActivePreset,
  persistLastVisitedZone,
  persistSelectedZone,
  type PresetId,
  type ZoneId,
} from "../../lib/cbmall-store";

type Zone = {
  id: Exclude<ZoneId, "workroom">;
  label: string;
  shortLabel: string;
  title: string;
  desc: string;
  href: string;
  actionText: string;
  x: string;
  y: string;
  related: Array<Exclude<ZoneId, "workroom">>;
};

type Preset = {
  id: PresetId;
  label: string;
  defaultZone: Exclude<ZoneId, "workroom">;
  recommended: Array<Exclude<ZoneId, "workroom">>;
};

const ZONES: Zone[] = [
  {
    id: "materials",
    label: "자재 랙",
    shortLabel: "자재",
    title: "금속 랙 자재 존",
    desc: "밝고 정돈된 작업실 전체 톤 안에서 아크릴 원장을 금속 랙 구조로 적재해 둔 원자재 구역이다.",
    href: "/materials-room",
    actionText: "자재 랙 열기",
    x: "17%",
    y: "45%",
    related: ["workbench", "parts", "storage"],
  },
  {
    id: "pop",
    label: "POP 스튜디오",
    shortLabel: "POP",
    title: "POP 구조 설계 존",
    desc: "1/2/3/4판 조합, quick/custom 모드, 구조 경고와 인쇄 여백 검증을 다루는 설계 구역이다.",
    href: "/pop-studio",
    actionText: "POP 스튜디오 열기",
    x: "34%",
    y: "30%",
    related: ["materials", "workbench"],
  },
  {
    id: "workbench",
    label: "중앙 작업대",
    shortLabel: "작업대",
    title: "공방 중심 작업대",
    desc: "선택한 자재와 부자재가 실제 슬롯으로 들어오고 이후 저장, 복원, POP 연동으로 이어지는 중심 작업 공간이다.",
    href: "/workbench/keyring",
    actionText: "작업대로 이동",
    x: "49%",
    y: "70%",
    related: ["materials", "parts", "storage", "pop"],
  },
  {
    id: "parts",
    label: "부자재 트레이",
    shortLabel: "부자재",
    title: "소형 부자재 존",
    desc: "D고리, O링, OPP 봉투를 서랍/트레이 단위로 고르고 수량까지 정하는 부자재 구역이다.",
    href: "/option-store",
    actionText: "부자재 존 열기",
    x: "84%",
    y: "45%",
    related: ["materials", "workbench", "storage"],
  },
  {
    id: "storage",
    label: "보관 서랍",
    shortLabel: "보관",
    title: "저장본 / 완료본 서랍",
    desc: "작업 완료물, 최근 저장본, 재주문용 조합을 서랍 카드로 보관하고 다시 꺼내 복원하는 구역이다.",
    href: "/storage",
    actionText: "보관 서랍 열기",
    x: "16%",
    y: "81%",
    related: ["materials", "workbench"],
  },
  {
    id: "operate",
    label: "운영 허브",
    shortLabel: "운영",
    title: "판매 / B2B / 땡처리 운영 허브",
    desc: "제작 이후 판매, B2B 대량 주문, 땡처리 탭으로 넘어가는 운영 흐름 허브다.",
    href: "/seller",
    actionText: "운영 허브로 이동",
    x: "84%",
    y: "80%",
    related: ["workbench", "storage"],
  },
];

const PRESETS: Preset[] = [
  {
    id: "maker",
    label: "제작 흐름",
    defaultZone: "workbench",
    recommended: ["materials", "workbench", "parts", "storage"],
  },
  {
    id: "materials",
    label: "자재 중심",
    defaultZone: "materials",
    recommended: ["materials", "parts", "workbench"],
  },
  {
    id: "operate",
    label: "운영 흐름",
    defaultZone: "operate",
    recommended: ["workbench", "storage", "operate"],
  },
];

function getZone(id: Exclude<ZoneId, "workroom"> | null | undefined) {
  return ZONES.find((zone) => zone.id === id) ?? ZONES[2];
}

function getPreset(id: PresetId | null | undefined) {
  return PRESETS.find((preset) => preset.id === id) ?? PRESETS[0];
}

export default function ModeSelectPage() {
  const [activeZoneId, setActiveZoneId] = useState<Exclude<ZoneId, "workroom">>("workbench");
  const [activePresetId, setActivePresetId] = useState<PresetId>("maker");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedZone = loadSelectedZone();
    const savedPreset = loadActivePreset();

    if (savedPreset && PRESETS.some((item) => item.id === savedPreset)) {
      setActivePresetId(savedPreset);
    }

    if (savedZone && savedZone !== "workroom" && ZONES.some((item) => item.id === savedZone)) {
      setActiveZoneId(savedZone);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistSelectedZone(activeZoneId);
    persistLastVisitedZone(activeZoneId);
  }, [activeZoneId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    persistActivePreset(activePresetId);
  }, [activePresetId, hydrated]);

  const activeZone = useMemo(() => getZone(activeZoneId), [activeZoneId]);
  const activePreset = useMemo(() => getPreset(activePresetId), [activePresetId]);
  const relatedZones = activeZone.related.map((zoneId) => getZone(zoneId));

  const focusStyle = useMemo(
    () =>
      ({
        ["--focus-x" as string]: activeZone.x,
        ["--focus-y" as string]: activeZone.y,
      }) as CSSProperties,
    [activeZone.x, activeZone.y],
  );

  function handleZoneClick(zoneId: Exclude<ZoneId, "workroom">) {
    setActiveZoneId(zoneId);
  }

  function handlePresetClick(nextPresetId: PresetId) {
    const nextPreset = getPreset(nextPresetId);
    setActivePresetId(nextPreset.id);

    if (!nextPreset.recommended.includes(activeZoneId)) {
      setActiveZoneId(nextPreset.defaultZone);
    }
  }

  return (
    <main className="workroom-page">
      <header className="workroom-topbar">
        <div className="workroom-brand">
          <span>CustomBro Workshop</span>
          <small>Responsive Workroom Hub</small>
        </div>

        <nav className="workroom-nav" aria-label="주요 이동">
          <Link href="/mode-select" className="active">내 작업실</Link>
          <Link href="/materials-room">자재 랙</Link>
          <Link href="/option-store">부자재</Link>
          <Link href="/workbench/keyring">작업대</Link>
          <Link href="/storage">보관함</Link>
          <Link href="/pop-studio">POP</Link>
          <Link href="/seller">운영</Link>
        </nav>
      </header>

      <section className="workroom-stage" style={focusStyle}>
        <div className="lamp lamp-a" />
        <div className="lamp lamp-b" />
        <div className="lamp lamp-c" />
        <div className="window-glow" />

        <div className="zone-shape rack-left" />
        <div className="zone-shape pop-desk" />
        <div className="zone-shape work-table" />
        <div className="zone-shape parts-right" />
        <div className="zone-shape drawer-left" />
        <div className="zone-shape operate-right" />

        <div className="stage-head">
          <section className="hero-card">
            <div className="eyebrow">WORKROOM HUB</div>
            <h1>밝은 공방형 반응형 허브</h1>
            <p>
              첨부 이미지처럼 정돈된 밝은 작업실 톤을 유지하되, 이미지를 통째로 클릭하는 방식이 아니라
              자재 랙 · 부자재 트레이 · 작업대 · 보관 서랍 · POP · 운영 구역을
              각각 상호작용 가능한 오브젝트 존으로 분리한 시작 허브다.
            </p>
          </section>

          <section className="preset-card">
            <div className="eyebrow">PRESET</div>
            <div className="preset-row">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={preset.id === activePresetId ? "active" : ""}
                  onClick={() => handlePresetClick(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="rule-card">
          <div className="eyebrow">CONCEPT RULE</div>
          <p>
            원자재는 금속 랙, 소형 부자재는 트레이/서랍, 완성품은 보관 서랍으로 분리한다.
            허브는 공간 진입만 담당하고 실제 작업은 각 전용 페이지에서 진행한다.
          </p>
        </aside>

        <div className="hotspot-layer" aria-label="구역 선택">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`hotspot ${zone.id === activeZoneId ? "active" : ""}`}
              style={
                {
                  ["--zone-x" as string]: zone.x,
                  ["--zone-y" as string]: zone.y,
                } as CSSProperties
              }
              onClick={() => handleZoneClick(zone.id)}
              aria-pressed={zone.id === activeZoneId}
            >
              <span className="hotspot-dot">{zone.shortLabel}</span>
              <span className="hotspot-label">{zone.label}</span>
            </button>
          ))}
        </div>

        <aside className="detail-panel">
          <div className="eyebrow">CURRENT ZONE</div>
          <h2>{activeZone.title}</h2>
          <p>{activeZone.desc}</p>

          <div className="meta-grid">
            <div className="meta-row">
              <span>현재 선택</span>
              <b>{activeZone.label}</b>
            </div>
            <div className="meta-row">
              <span>프리셋</span>
              <b>{activePreset.label}</b>
            </div>
            <div className="meta-row">
              <span>상태</span>
              <b>{hydrated ? `saved:${activeZone.id}` : "loading"}</b>
            </div>
          </div>

          <div className="eyebrow">RELATED FLOW</div>
          <div className="related-row">
            {relatedZones.map((zone) => (
              <button key={zone.id} type="button" onClick={() => handleZoneClick(zone.id)}>
                {zone.label}
              </button>
            ))}
          </div>

          <div className="action-grid">
            <Link className="primary-action" href={activeZone.href}>
              <span>{activeZone.actionText}</span>
              <span>→</span>
            </Link>
            <Link className="secondary-action" href="/workbench/keyring">
              <span>작업대 바로가기</span>
              <span>→</span>
            </Link>
          </div>
        </aside>

        <div className="chip-rail" aria-label="빠른 구역 선택">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={zone.id === activeZoneId ? "active" : ""}
              onClick={() => handleZoneClick(zone.id)}
            >
              {zone.label}
            </button>
          ))}
        </div>
      </section>

      <style jsx>{`
        .workroom-page {
          min-height: 100vh;
          color: #1f2937;
          background:
            radial-gradient(circle at 14% 0%, rgba(255, 179, 110, 0.28), transparent 26%),
            radial-gradient(circle at 86% 8%, rgba(120, 193, 255, 0.24), transparent 22%),
            linear-gradient(180deg, #f8fbfd 0%, #eef3f7 100%);
        }

        .workroom-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 14px 18px;
          border-bottom: 1px solid #dde6ef;
          background: rgba(248, 251, 253, 0.9);
          backdrop-filter: blur(10px);
        }

        .workroom-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid #d6dde6;
          background: #ffffff;
          box-shadow: 0 14px 40px rgba(31, 41, 55, 0.08);
          font-weight: 900;
        }

        .workroom-brand small {
          color: #f28b3d;
          font-weight: 800;
        }

        .workroom-nav {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .workroom-nav a {
          padding: 10px 13px;
          border-radius: 999px;
          border: 1px solid #d6dde6;
          background: #ffffff;
          color: #425061;
          font-weight: 800;
        }

        .workroom-nav a.active {
          background: #111827;
          color: #ffffff;
          border-color: #111827;
        }

        .workroom-stage {
          --focus-x: 49%;
          --focus-y: 70%;
          position: relative;
          overflow: hidden;
          min-height: calc(100vh - 92px);
          margin: 16px;
          border: 1px solid #dce4ec;
          border-radius: 34px;
          box-shadow: 0 18px 48px rgba(31, 41, 55, 0.1);
          background:
            radial-gradient(circle at var(--focus-x) var(--focus-y), rgba(255, 194, 140, 0.36), transparent 18%),
            linear-gradient(180deg, #fafcfd 0%, #eef3f7 58%, #e7edf3 100%);
        }

        .window-glow {
          position: absolute;
          top: 14%;
          left: 34%;
          right: 28%;
          height: 28%;
          border-radius: 24px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.96), rgba(233,243,249,0.9));
          box-shadow:
            inset 0 0 0 1px rgba(210, 221, 230, 0.9),
            0 0 80px rgba(255,255,255,0.65);
        }

        .window-glow::before,
        .window-glow::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(180, 194, 206, 0.55);
        }

        .window-glow::before {
          left: 33%;
        }

        .window-glow::after {
          right: 33%;
        }

        .lamp {
          position: absolute;
          top: 8%;
          width: 58px;
          height: 58px;
          border-radius: 999px 999px 26px 26px;
          background: linear-gradient(180deg, #fafcfd, #dfe5ea);
          box-shadow: 0 22px 38px rgba(255, 213, 159, 0.34);
          z-index: 3;
        }

        .lamp::after {
          content: "";
          position: absolute;
          top: -70px;
          left: 50%;
          width: 2px;
          height: 70px;
          transform: translateX(-50%);
          background: rgba(150, 160, 170, 0.6);
        }

        .lamp-a { left: 14%; }
        .lamp-b { left: 46%; }
        .lamp-c { right: 18%; }

        .zone-shape {
          position: absolute;
          z-index: 2;
          border: 1px solid #d1dae2;
          box-shadow: 0 10px 24px rgba(31, 41, 55, 0.06);
        }

        .rack-left,
        .parts-right {
          top: 22%;
          width: 22%;
          height: 40%;
          border-radius: 24px;
          background:
            linear-gradient(180deg, rgba(246,249,252,0.96), rgba(233,239,245,0.94));
        }

        .rack-left { left: 5%; }
        .parts-right { right: 5%; }

        .rack-left::before,
        .parts-right::before {
          content: "";
          position: absolute;
          inset: 14% 10%;
          border-radius: 14px;
          background:
            repeating-linear-gradient(180deg, rgba(110, 130, 145, 0.18) 0 3px, transparent 3px 25%),
            repeating-linear-gradient(90deg, rgba(110, 130, 145, 0.13) 0 3px, transparent 3px 20%);
        }

        .pop-desk {
          left: 30%;
          top: 30%;
          width: 15%;
          height: 16%;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,245,249,0.94));
        }

        .pop-desk::before {
          content: "";
          position: absolute;
          inset: 18% 14%;
          border-radius: 14px;
          border: 1px solid #d7e0e8;
          background: linear-gradient(180deg, rgba(250,252,253,0.98), rgba(241,246,250,0.95));
        }

        .work-table {
          left: 29%;
          right: 29%;
          bottom: 16%;
          height: 22%;
          border-radius: 30px;
          border-color: #d8cfbf;
          background: linear-gradient(180deg, #e9dcc8, #d8cab2);
        }

        .work-table::before {
          content: "";
          position: absolute;
          left: 12%;
          right: 12%;
          top: 16%;
          height: 46%;
          border-radius: 18px;
          border: 1px solid #c7d2dc;
          background:
            repeating-linear-gradient(90deg, rgba(136,153,168,0.12) 0 1px, transparent 1px 24px),
            repeating-linear-gradient(180deg, rgba(136,153,168,0.12) 0 1px, transparent 1px 24px),
            linear-gradient(180deg, rgba(245,248,251,0.96), rgba(236,242,247,0.94));
        }

        .drawer-left,
        .operate-right {
          bottom: 16%;
          width: 18%;
          height: 16%;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,245,249,0.94));
        }

        .drawer-left { left: 7%; }
        .operate-right { right: 8%; }

        .drawer-left::before,
        .operate-right::before {
          content: "";
          position: absolute;
          inset: 20% 10%;
          border-radius: 12px;
          background:
            repeating-linear-gradient(180deg, rgba(149, 164, 177, 0.14) 0 1px, transparent 1px 33%);
        }

        .stage-head {
          position: absolute;
          left: 18px;
          right: 18px;
          top: 18px;
          z-index: 6;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          flex-wrap: wrap;
        }

        .hero-card,
        .preset-card,
        .rule-card,
        .detail-panel,
        .chip-rail {
          border: 1px solid #d6dde6;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 14px 40px rgba(31, 41, 55, 0.08);
          backdrop-filter: blur(8px);
        }

        .hero-card {
          max-width: 640px;
          padding: 18px 20px;
          border-radius: 24px;
        }

        .hero-card h1 {
          margin: 8px 0 10px;
          font-size: clamp(34px, 5vw, 56px);
          line-height: 1.02;
          letter-spacing: -0.05em;
        }

        .hero-card p,
        .rule-card p,
        .detail-panel p {
          margin: 0;
          color: #5e6b7a;
          font-size: 15px;
          line-height: 1.78;
        }

        .preset-card {
          min-width: 320px;
          padding: 14px;
          border-radius: 20px;
          display: grid;
          gap: 10px;
        }

        .preset-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .preset-row button,
        .related-row button,
        .chip-rail button,
        .hotspot {
          appearance: none;
          border: 0;
          background: none;
          padding: 0;
          margin: 0;
          font: inherit;
        }

        .preset-row button {
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid #d6dde6;
          border-radius: 999px;
          background: #ffffff;
          color: #415061;
          font-weight: 900;
        }

        .preset-row button.active {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        .rule-card {
          position: absolute;
          left: 18px;
          bottom: 18px;
          z-index: 6;
          max-width: 470px;
          padding: 14px 16px;
          border-radius: 22px;
        }

        .hotspot-layer {
          position: absolute;
          inset: 0;
          z-index: 5;
        }

        .hotspot {
          position: absolute;
          left: var(--zone-x);
          top: var(--zone-y);
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .hotspot-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 82px;
          height: 82px;
          padding: 0 12px;
          border: 1px solid #d6dde6;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          color: #39485a;
          box-shadow: 0 10px 24px rgba(31, 41, 55, 0.12);
          font-size: 14px;
          font-weight: 900;
          transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
        }

        .hotspot-label {
          padding: 7px 12px;
          border: 1px solid #d6dde6;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          color: #425061;
          box-shadow: 0 8px 20px rgba(31, 41, 55, 0.08);
          white-space: nowrap;
          font-size: 12px;
          font-weight: 900;
        }

        .hotspot.active .hotspot-dot,
        .hotspot:hover .hotspot-dot {
          transform: scale(1.07);
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        .detail-panel {
          position: absolute;
          right: 18px;
          top: 126px;
          bottom: 18px;
          z-index: 6;
          width: 360px;
          padding: 18px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .detail-panel h2 {
          margin: 0;
          font-size: clamp(28px, 4vw, 38px);
          line-height: 1.02;
          letter-spacing: -0.04em;
        }

        .meta-grid {
          display: grid;
          gap: 10px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border: 1px solid #dde5ed;
          border-radius: 16px;
          background: #ffffff;
          font-size: 13px;
        }

        .meta-row b {
          padding: 6px 10px;
          border-radius: 999px;
          background: #eef3f7;
          font-size: 12px;
        }

        .related-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .related-row button {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #d6dde6;
          border-radius: 999px;
          background: #ffffff;
          color: #445264;
          font-weight: 900;
        }

        .action-grid {
          margin-top: auto;
          display: grid;
          gap: 10px;
        }

        .primary-action,
        .secondary-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 52px;
          padding: 0 16px;
          border-radius: 16px;
          font-weight: 900;
        }

        .primary-action {
          background: linear-gradient(135deg, #ff8b3d, #ffb067);
          color: #ffffff;
        }

        .secondary-action {
          border: 1px solid #d6dde6;
          background: #ffffff;
          color: #445264;
        }

        .chip-rail {
          position: absolute;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          z-index: 6;
          min-width: min(840px, calc(100% - 470px));
          padding: 10px;
          border-radius: 999px;
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chip-rail button {
          min-height: 40px;
          padding: 0 12px;
          border: 1px solid #d6dde6;
          border-radius: 999px;
          background: #ffffff;
          color: #445264;
          font-weight: 900;
        }

        .chip-rail button.active {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        @media (max-width: 1380px) {
          .workroom-stage {
            min-height: auto;
            padding-bottom: 24px;
          }

          .detail-panel {
            position: static;
            width: auto;
            margin: 18px;
          }

          .chip-rail {
            position: static;
            transform: none;
            min-width: 0;
            width: auto;
            margin: 0 18px 18px;
          }

          .rule-card {
            position: static;
            max-width: none;
            margin: 0 18px 18px;
          }

          .hotspot-layer {
            min-height: 520px;
            position: relative;
            display: block;
          }
        }

        @media (max-width: 980px) {
          .workroom-stage {
            margin: 12px;
            border-radius: 24px;
          }

          .stage-head {
            position: static;
            padding: 18px 18px 0;
          }

          .window-glow {
            top: 220px;
            left: 8%;
            right: 8%;
            height: 24%;
          }

          .rack-left,
          .parts-right {
            width: 24%;
            height: 210px;
            top: 31%;
          }

          .work-table {
            left: 22%;
            right: 22%;
            bottom: 24%;
          }

          .drawer-left,
          .operate-right {
            bottom: 19%;
          }
        }

        @media (max-width: 720px) {
          .workroom-topbar {
            padding: 12px;
          }

          .workroom-stage {
            margin: 8px;
            border-radius: 22px;
          }

          .workroom-nav {
            width: 100%;
          }

          .workroom-nav a {
            flex: 1 1 calc(50% - 8px);
            text-align: center;
          }

          .window-glow,
          .zone-shape,
          .lamp {
            display: none;
          }

          .hotspot-layer {
            position: static;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            padding: 18px;
          }

          .hotspot {
            position: static;
            transform: none;
            align-items: stretch;
          }

          .hotspot-dot {
            width: 100%;
            height: 72px;
            border-radius: 22px;
          }

          .hotspot-label {
            text-align: center;
          }

          .detail-panel,
          .rule-card,
          .chip-rail {
            margin: 0 18px 18px;
          }

          .hero-card {
            padding: 16px;
          }
        }

        @media (max-width: 520px) {
          .hotspot-layer {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}