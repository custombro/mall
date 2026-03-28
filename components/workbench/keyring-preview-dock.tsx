"use client";

import { useEffect } from "react";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function findBlocks() {
  return Array.from(document.querySelectorAll<HTMLElement>("div, section, article, aside"));
}

function findPreviewBlock(blocks: HTMLElement[]) {
  for (const el of blocks) {
    const text = normalizeText(el.textContent);
    if (text.includes("PREVIEW") && (text.includes("작업 요약") || text.includes("양면") || text.includes("현재 포커스"))) {
      return el;
    }
  }

  for (const el of blocks) {
    const text = normalizeText(el.textContent);
    if (text.includes("PREVIEW")) return el;
  }

  return null;
}

function findWorkbenchCard(blocks: HTMLElement[]) {
  for (const el of blocks) {
    const text = normalizeText(el.textContent);
    if (text.includes("작업테이블") && text.includes("앞면") && text.includes("뒷면")) {
      return el;
    }
  }
  return null;
}

function dockPreview() {
  const blocks = findBlocks();
  const preview = findPreviewBlock(blocks);
  const workbench = findWorkbenchCard(blocks);

  if (!preview || !workbench) return;
  if (preview.dataset.cbPreviewDocked === "1") return;

  const computed = window.getComputedStyle(workbench);
  if (computed.position === "static") {
    workbench.style.position = "relative";
  }

  workbench.style.overflow = "visible";

  if (preview.parentElement !== workbench) {
    workbench.appendChild(preview);
  }

  preview.dataset.cbPreviewDocked = "1";
  preview.style.position = "absolute";
  preview.style.top = "16px";
  preview.style.right = "16px";
  preview.style.width = "168px";
  preview.style.minWidth = "168px";
  preview.style.maxWidth = "168px";
  preview.style.margin = "0";
  preview.style.zIndex = "40";
  preview.style.transform = "scale(0.82)";
  preview.style.transformOrigin = "top right";
  preview.style.boxShadow = "0 16px 28px rgba(0,0,0,.34)";
  preview.style.borderRadius = "18px";
  preview.style.background = "rgba(15,23,42,.96)";
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

  return <span style={{ display: "none" }}>CB_KEYRING_PREVIEW_DOCK_V3</span>;
}
