"use client";

import { useEffect } from "react";

const MARKER = "CB_KEYRING_PREVIEW_DOCK_V7";

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

function pickPreviewCard() {
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

  hits.sort((a, b) => areaOf(a) - areaOf(b));

  for (const el of hits) {
    if (areaOf(el) > 12000) return el;
  }

  return hits[0] ?? null;
}

function floatPreviewCard() {
  const card = pickPreviewCard();
  if (!card) return;
  if (card.dataset.cbPreviewFloated === "1") return;

  const parent = card.parentElement as HTMLElement | null;
  if (!parent) return;

  const computed = window.getComputedStyle(parent);
  if (computed.position === "static") {
    parent.style.position = "relative";
  }

  parent.style.overflow = "visible";
  parent.style.paddingRight = "220px";
  parent.style.minHeight = "220px";

  card.dataset.cbPreviewFloated = "1";
  card.style.position = "absolute";
  card.style.top = "16px";
  card.style.right = "16px";
  card.style.width = "176px";
  card.style.minWidth = "176px";
  card.style.maxWidth = "176px";
  card.style.zIndex = "80";
  card.style.transform = "scale(0.72)";
  card.style.transformOrigin = "top right";
  card.style.borderRadius = "18px";
  card.style.overflow = "hidden";
  card.style.boxShadow = "0 16px 28px rgba(0,0,0,.34)";
  card.style.background = "rgba(8,15,30,.96)";
  card.style.border = "1px solid rgba(125,211,252,.22)";
  card.style.margin = "0";

  card.querySelectorAll<HTMLElement>("svg, canvas, img").forEach((el) => {
    el.style.width = "100%";
    el.style.height = "auto";
    el.style.maxWidth = "100%";
  });
}

export function KeyringPreviewDock() {
  useEffect(() => {
    floatPreviewCard();
    const t1 = window.setTimeout(floatPreviewCard, 60);
    const t2 = window.setTimeout(floatPreviewCard, 300);
    const t3 = window.setTimeout(floatPreviewCard, 900);
    const interval = window.setInterval(floatPreviewCard, 1200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearInterval(interval);
    };
  }, []);

  return <span style={{ display: "none" }}>{MARKER}</span>;
}
