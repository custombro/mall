"use client";

import { useEffect } from "react";

const MARKER = "CB_KEYRING_PREVIEW_DOCK_V5";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function nodes(selector: string, root?: ParentNode) {
  return Array.from((root ?? document).querySelectorAll<HTMLElement>(selector));
}

function areaOf(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return Math.max(0, rect.width * rect.height);
}

function isVisible(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

function pickPanel() {
  const list = nodes("div, section, article, aside");

  for (const el of list) {
    const text = normalizeText(el.textContent);
    if (text.includes("미리보기 1칸 토글 확인")) return el;
  }

  for (const el of list) {
    const text = normalizeText(el.textContent);
    if (text.includes("완성 미리보기") && (text.includes("뒷면 보기") || text.includes("앞면 보기"))) {
      return el;
    }
  }

  return null;
}

function pickPreview(panel: HTMLElement) {
  const hits: HTMLElement[] = [];

  for (const el of nodes("div, section, article, aside", panel)) {
    const text = normalizeText(el.textContent);
    if (
      isVisible(el) &&
      (text.includes("정면 완성 미리보기") ||
        text.includes("업로드 1개 기준 기본 양면 인쇄") ||
        text.includes("뒷면 기준으로"))
    ) {
      hits.push(el);
    }
  }

  if (!hits.length) {
    for (const el of nodes("div, section, article, aside")) {
      const text = normalizeText(el.textContent);
      if (
        isVisible(el) &&
        (text.includes("정면 완성 미리보기") ||
          text.includes("업로드 1개 기준 기본 양면 인쇄") ||
          text.includes("뒷면 기준으로"))
      ) {
        hits.push(el);
      }
    }
  }

  hits.sort((a, b) => areaOf(b) - areaOf(a));
  return hits[0] ?? null;
}

function ensureHost(panel: HTMLElement) {
  let host = panel.querySelector<HTMLElement>('[data-cb-mini-preview-host="1"]');
  if (!host) {
    host = document.createElement("div");
    host.setAttribute("data-cb-mini-preview-host", "1");
    host.style.position = "absolute";
    host.style.top = "16px";
    host.style.right = "16px";
    host.style.width = "176px";
    host.style.minWidth = "176px";
    host.style.maxWidth = "176px";
    host.style.zIndex = "80";
    host.style.borderRadius = "18px";
    host.style.background = "rgba(8,15,30,.94)";
    host.style.border = "1px solid rgba(125,211,252,.28)";
    host.style.boxShadow = "0 16px 28px rgba(0,0,0,.34)";
    host.style.overflow = "hidden";

    const badge = document.createElement("div");
    badge.setAttribute("data-cb-mini-preview-badge", "1");
    badge.textContent = "소형 미리보기";
    badge.style.display = "block";
    badge.style.padding = "8px 10px";
    badge.style.fontSize = "11px";
    badge.style.fontWeight = "800";
    badge.style.letterSpacing = ".08em";
    badge.style.color = "#7dd3fc";
    badge.style.borderBottom = "1px solid rgba(125,211,252,.16)";

    host.appendChild(badge);
    panel.appendChild(host);
  }
  return host;
}

function shrinkInner(preview: HTMLElement) {
  nodes("svg, canvas, img", preview).forEach((el) => {
    el.style.width = "100%";
    el.style.height = "auto";
    el.style.maxWidth = "100%";
  });
}

function dockPreview() {
  const panel = pickPanel();
  if (!panel) return;

  const preview = pickPreview(panel);
  if (!preview) return;

  const sourceParent = preview.parentElement as HTMLElement | null;

  panel.style.position = "relative";
  panel.style.overflow = "visible";
  panel.style.paddingRight = "230px";
  panel.style.minHeight = "250px";

  const host = ensureHost(panel);

  if (preview.parentElement !== host) {
    host.appendChild(preview);
  }

  preview.dataset.cbPreviewDocked = "1";
  preview.style.width = "176px";
  preview.style.minWidth = "176px";
  preview.style.maxWidth = "176px";
  preview.style.margin = "0";
  preview.style.transform = "scale(0.72)";
  preview.style.transformOrigin = "top right";
  preview.style.background = "transparent";
  preview.style.boxShadow = "none";
  preview.style.borderRadius = "0";

  shrinkInner(preview);

  if (sourceParent && sourceParent !== host && sourceParent !== panel) {
    const parentText = normalizeText(sourceParent.textContent);
    if (
      parentText.includes("정면 완성 미리보기") ||
      parentText.includes("업로드 1개 기준 기본 양면 인쇄") ||
      parentText.includes("뒷면 기준으로")
    ) {
      sourceParent.style.display = "none";
    }
  }
}

export function KeyringPreviewDock() {
  useEffect(() => {
    dockPreview();
    const t1 = window.setTimeout(dockPreview, 60);
    const t2 = window.setTimeout(dockPreview, 300);
    const t3 = window.setTimeout(dockPreview, 900);
    const interval = window.setInterval(dockPreview, 1200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearInterval(interval);
    };
  }, []);

  return <span style={{ display: "none" }}>{MARKER}</span>;
}
