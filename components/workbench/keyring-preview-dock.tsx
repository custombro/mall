"use client";

import { useEffect } from "react";

const MARKER = "CB_KEYRING_SAFE_OVERLAYS_V9";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function blocks() {
  return Array.from(document.querySelectorAll<HTMLElement>("div, section, article, aside"));
}

function isVisible(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

function areaOf(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return Math.max(0, rect.width * rect.height);
}

function cleanupBrokenArtifacts() {
  document.querySelectorAll<HTMLElement>('[data-cb-hole-guide="1"]').forEach((el) => {
    if (!el.closest('[data-cb-hole-canvas="1"]')) el.remove();
  });

  document.querySelectorAll<HTMLElement>('[data-cb-hole-panel-host="1"]').forEach((el) => {
    if (!el.closest('[data-cb-hole-canvas="1"]')) el.remove();
  });

  document.querySelectorAll<HTMLElement>('[data-cb-home-chip="1"]').forEach((el, idx) => {
    if (idx > 0) el.remove();
  });
}

function ensureHomeChip() {
  if (document.querySelector('[data-cb-home-chip="1"]')) return;

  const link = document.createElement("a");
  link.href = "/";
  link.setAttribute("data-cb-home-chip", "1");
  link.style.position = "fixed";
  link.style.top = "14px";
  link.style.left = "14px";
  link.style.zIndex = "120";
  link.style.display = "flex";
  link.style.alignItems = "center";
  link.style.gap = "8px";
  link.style.padding = "10px 14px";
  link.style.borderRadius = "999px";
  link.style.background = "rgba(6,12,24,.92)";
  link.style.border = "1px solid rgba(125,211,252,.24)";
  link.style.boxShadow = "0 12px 24px rgba(0,0,0,.28)";
  link.style.textDecoration = "none";
  link.style.color = "#e5eefc";
  link.style.fontWeight = "800";
  link.style.fontSize = "12px";
  link.style.letterSpacing = ".04em";

  const dot = document.createElement("span");
  dot.setAttribute("data-cb-home-dot", "1");
  dot.textContent = "CB";
  dot.style.width = "24px";
  dot.style.height = "24px";
  dot.style.borderRadius = "999px";
  dot.style.display = "inline-flex";
  dot.style.alignItems = "center";
  dot.style.justifyContent = "center";
  dot.style.background = "rgba(125,211,252,.16)";
  dot.style.color = "#7dd3fc";
  dot.style.fontSize = "11px";
  dot.style.fontWeight = "900";

  const text = document.createElement("span");
  text.textContent = "CUSTOMBRO HOME";

  link.appendChild(dot);
  link.appendChild(text);
  document.body.appendChild(link);
}

function pickCanvas() {
  const hits: HTMLElement[] = [];

  for (const el of blocks()) {
    const text = normalizeText(el.textContent);
    if (!isVisible(el)) continue;

    const a = areaOf(el);
    if (a < 70000 || a > 700000) continue;

    if (text.includes("정면 완성 미리보기") || text.includes("업로드 1개 기준 기본 양면 인쇄")) {
      hits.push(el);
    }
  }

  hits.sort((a, b) => areaOf(a) - areaOf(b));
  return hits[0] ?? null;
}

function ensureGuide(canvas: HTMLElement) {
  let guide = canvas.querySelector<HTMLElement>('[data-cb-hole-guide="1"]');
  if (!guide) {
    guide = document.createElement("div");
    guide.setAttribute("data-cb-hole-guide", "1");
    guide.style.position = "absolute";
    guide.style.width = "18px";
    guide.style.height = "18px";
    guide.style.borderRadius = "999px";
    guide.style.border = "3px solid #facc15";
    guide.style.background = "rgba(15,23,42,.96)";
    guide.style.boxShadow = "0 0 0 2px rgba(255,255,255,.16)";
    guide.style.zIndex = "86";
    guide.style.pointerEvents = "none";
    canvas.appendChild(guide);
  }
  return guide;
}

function setPreset(canvas: HTMLElement, preset: "top-center" | "top-left" | "top-right") {
  const guide = ensureGuide(canvas);
  const status = canvas.querySelector<HTMLElement>('[data-cb-hole-status="1"]');
  const buttons = Array.from(canvas.querySelectorAll<HTMLElement>('[data-cb-hole-btn="1"]'));

  buttons.forEach((button) => {
    button.dataset.active = button.dataset.holePreset === preset ? "1" : "0";
    const active = button.dataset.active === "1";
    button.style.background = active ? "rgba(125,211,252,.14)" : "rgba(255,255,255,.04)";
    button.style.borderColor = active ? "rgba(125,211,252,.34)" : "rgba(125,211,252,.18)";
    button.style.color = active ? "#7dd3fc" : "#e2e8f0";
  });

  const map = {
    "top-center": { top: "118px", left: "50%", label: "상단 중앙" },
    "top-left": { top: "132px", left: "38%", label: "좌측 상단" },
    "top-right": { top: "132px", left: "62%", label: "우측 상단" },
  };

  const conf = map[preset];
  canvas.setAttribute("data-cb-hole-canvas", "1");
  canvas.style.position = "relative";
  canvas.style.overflow = "hidden";

  guide.style.top = conf.top;
  guide.style.left = conf.left;
  guide.style.transform = "translate(-50%, -50%)";

  if (status) status.textContent = `현재 프리셋: ${conf.label}`;
}

function ensurePanel(canvas: HTMLElement) {
  if (canvas.querySelector('[data-cb-hole-panel-host="1"]')) return;

  canvas.setAttribute("data-cb-hole-canvas", "1");
  canvas.style.position = "relative";
  canvas.style.overflow = "hidden";

  const host = document.createElement("div");
  host.setAttribute("data-cb-hole-panel-host", "1");
  host.style.position = "absolute";
  host.style.right = "14px";
  host.style.bottom = "14px";
  host.style.width = "188px";
  host.style.zIndex = "87";
  host.style.borderRadius = "14px";
  host.style.background = "rgba(8,15,30,.94)";
  host.style.border = "1px solid rgba(125,211,252,.22)";
  host.style.boxShadow = "0 16px 28px rgba(0,0,0,.34)";
  host.style.overflow = "hidden";
  host.style.padding = "10px";

  const title = document.createElement("div");
  title.setAttribute("data-cb-hole-title", "1");
  title.textContent = "구멍 위치 조정";
  title.style.fontSize = "12px";
  title.style.fontWeight = "800";
  title.style.letterSpacing = ".08em";
  title.style.color = "#7dd3fc";
  title.style.marginBottom = "6px";

  const help = document.createElement("div");
  help.setAttribute("data-cb-hole-help", "1");
  help.textContent = "중앙 미리보기 안에서 바로 조정합니다. 우선 프리셋 3개로 시작하고 다음 단계에서 드래그 미세조정으로 확장합니다.";
  help.style.fontSize = "11px";
  help.style.lineHeight = "1.42";
  help.style.color = "#cbd5e1";
  help.style.marginBottom = "8px";

  const buttonWrap = document.createElement("div");
  buttonWrap.setAttribute("data-cb-hole-buttons", "1");
  buttonWrap.style.display = "grid";
  buttonWrap.style.gridTemplateColumns = "1fr";
  buttonWrap.style.gap = "6px";
  buttonWrap.style.marginBottom = "8px";

  const presets: Array<{ preset: "top-center" | "top-left" | "top-right"; label: string }> = [
    { preset: "top-center", label: "상단 중앙" },
    { preset: "top-left", label: "좌측 상단" },
    { preset: "top-right", label: "우측 상단" },
  ];

  presets.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-cb-hole-btn", "1");
    button.dataset.holePreset = item.preset;
    button.textContent = item.label;
    button.style.appearance = "none";
    button.style.border = "1px solid rgba(125,211,252,.18)";
    button.style.background = "rgba(255,255,255,.04)";
    button.style.color = "#e2e8f0";
    button.style.borderRadius = "10px";
    button.style.padding = "8px 10px";
    button.style.fontSize = "12px";
    button.style.fontWeight = "700";
    button.style.textAlign = "left";
    button.style.cursor = "pointer";
    button.addEventListener("click", () => setPreset(canvas, item.preset));
    buttonWrap.appendChild(button);
  });

  const status = document.createElement("div");
  status.setAttribute("data-cb-hole-status", "1");
  status.textContent = "현재 프리셋: 상단 중앙";
  status.style.fontSize = "11px";
  status.style.color = "#94a3b8";

  host.appendChild(title);
  host.appendChild(help);
  host.appendChild(buttonWrap);
  host.appendChild(status);
  canvas.appendChild(host);

  setPreset(canvas, "top-center");
}

function mountSafeOverlays() {
  cleanupBrokenArtifacts();
  ensureHomeChip();
  const canvas = pickCanvas();
  if (!canvas) return;
  ensurePanel(canvas);
}

export function KeyringPreviewDock() {
  useEffect(() => {
    mountSafeOverlays();
    const t1 = window.setTimeout(mountSafeOverlays, 60);
    const t2 = window.setTimeout(mountSafeOverlays, 300);
    const t3 = window.setTimeout(mountSafeOverlays, 900);
    const interval = window.setInterval(mountSafeOverlays, 1200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearInterval(interval);
    };
  }, []);

  return <span style={{ display: "none" }}>{MARKER}</span>;
}
