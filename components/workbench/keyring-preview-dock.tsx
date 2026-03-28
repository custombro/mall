"use client";

import { useEffect } from "react";

const MARKER = "CB_KEYRING_PREVIEW_DOCK_V4";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function findBlocks() {
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

function pickPreviewPanel(blocks: HTMLElement[]) {
  for (const el of blocks) {
    const text = normalizeText(el.textContent);
    if (text.includes("미리보기 1칸 토글 확인") && (text.includes("뒷면 보기") || text.includes("앞면 보기"))) {
      return el;
    }
  }

  for (const el of blocks) {
    const text = normalizeText(el.textContent);
    if (text.includes("완성 미리보기") && text.includes("뒷면 보기")) {
      return el;
    }
  }

  return null;
}

function pickPreviewBlock(blocks: HTMLElement[]) {
  const hits: HTMLElement[] = [];

  for (const el of blocks) {
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

  hits.sort((a, b) => areaOf(b) - areaOf(a));
  return hits[0] ?? null;
}

function ensureHost(panel: HTMLElement) {
  let host = panel.querySelector<HTMLElement>('[data-cb-preview-dock-host="1"]');
  if (!host) {
    host = document.createElement("div");
    host.setAttribute("data-cb-preview-dock-host", "1");
    host.style.position = "absolute";
    host.style.top = "18px";
    host.style.right = "18px";
    host.style.width = "172px";
    host.style.minWidth = "172px";
    host.style.maxWidth = "172px";
    host.style.zIndex = "60";
    panel.appendChild(host);
  }
  return host;
}

function shrinkInner(preview: HTMLElement) {
  preview.querySelectorAll<HTMLElement>("svg, canvas, img").forEach((el) => {
    el.style.width = "100%";
    el.style.height = "auto";
    el.style.maxWidth = "100%";
  });
}

function dockPreview() {
  const blocks = findBlocks();
  const panel = pickPreviewPanel(blocks);
  const preview = pickPreviewBlock(blocks);

  if (!panel || !preview) return;

  const sourceParent = preview.parentElement as HTMLElement | null;

  panel.style.position = "relative";
  panel.style.overflow = "visible";
  panel.style.paddingRight = "220px";
  panel.style.minHeight = "240px";

  const host = ensureHost(panel);

  if (preview.parentElement !== host) {
    host.appendChild(preview);
  }

  preview.dataset.cbPreviewDocked = "1";
  preview.style.width = "172px";
  preview.style.minWidth = "172px";
  preview.style.maxWidth = "172px";
  preview.style.margin = "0";
  preview.style.transform = "scale(0.78)";
  preview.style.transformOrigin = "top right";
  preview.style.boxShadow = "0 16px 28px rgba(0,0,0,.34)";
  preview.style.borderRadius = "18px";
  preview.style.background = "rgba(15,23,42,.96)";

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
