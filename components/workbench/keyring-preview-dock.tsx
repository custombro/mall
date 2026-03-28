"use client";

import { useEffect } from "react";

const MARKER = "CB_KEYRING_PREVIEW_DOCK_V6";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function nodes(selector: string, root?: ParentNode) {
  return Array.from((root ?? document).querySelectorAll<HTMLElement>(selector));
}

function isVisible(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

function areaOf(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return Math.max(0, rect.width * rect.height);
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

function pickLargePreview() {
  const hits: HTMLElement[] = [];

  for (const el of nodes("div, section, article, aside")) {
    const text = normalizeText(el.textContent);
    if (
      isVisible(el) &&
      (text.includes("정면 완성 미리보기") || text.includes("업로드 1개 기준 기본 양면 인쇄"))
    ) {
      hits.push(el);
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
    host.style.width = "164px";
    host.style.minWidth = "164px";
    host.style.maxWidth = "164px";
    host.style.zIndex = "90";
    host.style.borderRadius = "18px";
    host.style.background = "rgba(8,15,30,.96)";
    host.style.border = "1px solid rgba(125,211,252,.24)";
    host.style.boxShadow = "0 16px 30px rgba(0,0,0,.34)";
    host.style.overflow = "hidden";

    const badge = document.createElement("div");
    badge.setAttribute("data-cb-mini-preview-badge", "1");
    badge.textContent = "소형 미리보기";
    badge.style.display = "block";
    badge.style.padding = "7px 10px";
    badge.style.fontSize = "10px";
    badge.style.fontWeight = "800";
    badge.style.letterSpacing = ".08em";
    badge.style.color = "#7dd3fc";
    badge.style.borderBottom = "1px solid rgba(125,211,252,.16)";

    host.appendChild(badge);
    panel.appendChild(host);
  }
  return host;
}

function shrinkInner(root: HTMLElement) {
  nodes("svg, canvas, img", root).forEach((el) => {
    el.style.width = "100%";
    el.style.height = "auto";
    el.style.maxWidth = "100%";
  });
}

function clonePreview() {
  const panel = pickPanel();
  const original = pickLargePreview();

  if (!panel || !original) return;

  panel.style.position = "relative";
  panel.style.overflow = "visible";
  panel.style.paddingRight = "220px";
  panel.style.minHeight = "240px";

  const host = ensureHost(panel);
  if (host.querySelector('[data-cb-mini-preview-clone="1"]')) return;

  const clone = original.cloneNode(true) as HTMLElement;
  clone.setAttribute("data-cb-mini-preview-clone", "1");
  clone.style.width = "164px";
  clone.style.minWidth = "164px";
  clone.style.maxWidth = "164px";
  clone.style.margin = "0";
  clone.style.transform = "scale(0.64)";
  clone.style.transformOrigin = "top right";
  clone.style.background = "transparent";
  clone.style.boxShadow = "none";
  clone.style.borderRadius = "0";

  host.appendChild(clone);
  shrinkInner(clone);

  original.style.display = "none";

  const parent = original.parentElement as HTMLElement | null;
  if (parent && parent !== panel) {
    const parentText = normalizeText(parent.textContent);
    if (parentText.includes("정면 완성 미리보기") || parentText.includes("업로드 1개 기준 기본 양면 인쇄")) {
      parent.style.display = "none";
    }
  }
}

export function KeyringPreviewDock() {
  useEffect(() => {
    clonePreview();
    const t1 = window.setTimeout(clonePreview, 60);
    const t2 = window.setTimeout(clonePreview, 300);
    const t3 = window.setTimeout(clonePreview, 900);
    const interval = window.setInterval(clonePreview, 1200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearInterval(interval);
    };
  }, []);

  return <span style={{ display: "none" }}>{MARKER}</span>;
}
