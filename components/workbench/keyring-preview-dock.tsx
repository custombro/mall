"use client";

import { useEffect } from "react";

const MARKER = "CB_KEYRING_HOLE_PANEL_V8";

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

function pickPreviewPanel() {
  const hits: HTMLElement[] = [];

  for (const el of blocks()) {
    const text = normalizeText(el.textContent);
    if (!isVisible(el)) continue;

    if (
      text.includes("미리보기 1칸 토글 확인") ||
      text.includes("정면 완성 미리보기") ||
      (text.includes("완성 미리보기") && (text.includes("앞면 보기") || text.includes("뒷면 보기")))
    ) {
      hits.push(el);
    }
  }

  hits.sort((a, b) => areaOf(b) - areaOf(a));
  return hits[0] ?? null;
}

function ensureGuide(panel: HTMLElement) {
  let guide = panel.querySelector<HTMLElement>('[data-cb-hole-guide="1"]');
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
    guide.style.zIndex = "84";
    guide.style.pointerEvents = "none";
    panel.appendChild(guide);
  }
  return guide;
}

function setPreset(panel: HTMLElement, preset: "top-center" | "top-left" | "top-right") {
  const guide = ensureGuide(panel);
  const status = panel.querySelector<HTMLElement>('[data-cb-hole-status="1"]');
  const buttons = Array.from(panel.querySelectorAll<HTMLElement>('[data-cb-hole-btn="1"]'));

  buttons.forEach((button) => {
    const active = button.dataset.holePreset === preset;
    button.dataset.active = active ? "1" : "0";
    button.style.background = active ? "rgba(125,211,252,.14)" : "rgba(255,255,255,.04)";
    button.style.borderColor = active ? "rgba(125,211,252,.34)" : "rgba(125,211,252,.18)";
    button.style.color = active ? "#7dd3fc" : "#e2e8f0";
  });

  const map = {
    "top-center": { top: "92px", left: "50%", label: "상단 중앙" },
    "top-left": { top: "102px", left: "35%", label: "좌측 상단" },
    "top-right": { top: "102px", left: "65%", label: "우측 상단" },
  };

  const conf = map[preset];
  panel.style.position = "relative";
  panel.style.overflow = "visible";

  guide.style.top = conf.top;
  guide.style.left = conf.left;
  guide.style.transform = "translate(-50%, -50%)";

  if (status) {
    status.textContent = `현재 프리셋: ${conf.label}`;
  }
}

function ensurePanel(panel: HTMLElement) {
  if (panel.querySelector('[data-cb-hole-panel-host="1"]')) return;

  panel.style.position = "relative";
  panel.style.overflow = "visible";

  const host = document.createElement("div");
  host.setAttribute("data-cb-hole-panel-host", "1");
  host.style.position = "absolute";
  host.style.right = "18px";
  host.style.bottom = "18px";
  host.style.width = "196px";
  host.style.zIndex = "85";
  host.style.borderRadius = "16px";
  host.style.background = "rgba(8,15,30,.94)";
  host.style.border = "1px solid rgba(125,211,252,.22)";
  host.style.boxShadow = "0 16px 28px rgba(0,0,0,.34)";
  host.style.overflow = "hidden";
  host.style.padding = "12px";

  const title = document.createElement("div");
  title.setAttribute("data-cb-hole-title", "1");
  title.textContent = "구멍 위치 조정";
  title.style.fontSize = "12px";
  title.style.fontWeight = "800";
  title.style.letterSpacing = ".08em";
  title.style.color = "#7dd3fc";
  title.style.marginBottom = "8px";

  const help = document.createElement("div");
  help.setAttribute("data-cb-hole-help", "1");
  help.textContent = "중앙 작업대에서 바로 위치를 잡는 흐름이 맞습니다. 먼저 프리셋으로 시작하고, 다음 단계에서 드래그 미세조정으로 확장합니다.";
  help.style.fontSize = "11px";
  help.style.lineHeight = "1.45";
  help.style.color = "#cbd5e1";
  help.style.marginBottom = "10px";

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
    button.addEventListener("click", () => setPreset(panel, item.preset));
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
  panel.appendChild(host);

  setPreset(panel, "top-center");
}

function mountHolePanel() {
  const panel = pickPreviewPanel();
  if (!panel) return;
  ensurePanel(panel);
}

export function KeyringPreviewDock() {
  useEffect(() => {
    mountHolePanel();
    const t1 = window.setTimeout(mountHolePanel, 60);
    const t2 = window.setTimeout(mountHolePanel, 300);
    const t3 = window.setTimeout(mountHolePanel, 900);
    const interval = window.setInterval(mountHolePanel, 1200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearInterval(interval);
    };
  }, []);

  return <span style={{ display: "none" }}>{MARKER}</span>;
}
