"use client";

import React, { useEffect, useRef, useState } from "react";

export type KeyringPreviewDockProps = {
  anchorSelector?: string;
  title?: string;
  className?: string;
  emptyMessage?: string;
};

function copyCanvasBitmaps(sourceRoot: HTMLElement, clonedRoot: HTMLElement) {
  const sourceCanvases = Array.from(sourceRoot.querySelectorAll("canvas"));
  const clonedCanvases = Array.from(clonedRoot.querySelectorAll("canvas"));

  for (let i = 0; i < Math.min(sourceCanvases.length, clonedCanvases.length); i += 1) {
    const sourceCanvas = sourceCanvases[i];
    const clonedCanvas = clonedCanvases[i];

    try {
      clonedCanvas.width = sourceCanvas.width;
      clonedCanvas.height = sourceCanvas.height;
      const ctx = clonedCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, clonedCanvas.width, clonedCanvas.height);
        ctx.drawImage(sourceCanvas, 0, 0);
      }
    } catch {
      // ignore canvas copy failures and keep the rest of the clone alive
    }
  }
}

export function KeyringPreviewDock({
  anchorSelector = "[data-keyring-main-preview]",
  title = "보조 미리보기",
  className = "",
  emptyMessage = "미리보기를 불러오는 중입니다.",
}: KeyringPreviewDockProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    let observer: MutationObserver | null = null;

    const sync = () => {
      const host = hostRef.current;
      if (!host) return;

      const source = document.querySelector(anchorSelector) as HTMLElement | null;
      if (!source) {
        host.innerHTML = "";
        setReady(false);
        return;
      }

      const clone = source.cloneNode(true) as HTMLElement;
      clone.removeAttribute("data-keyring-main-preview");
      clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      clone.querySelectorAll("[data-keyring-main-preview]").forEach((node) => node.removeAttribute("data-keyring-main-preview"));
      clone.style.pointerEvents = "none";

      copyCanvasBitmaps(source, clone);

      host.innerHTML = "";
      host.appendChild(clone);
      setReady(true);
    };

    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(sync);
    };

    schedule();

    observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });

    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
    };
  }, [anchorSelector]);

  return (
    <aside className={`cb-keyring-preview-dock hidden xl:block ${className}`.trim()} aria-label={title}>
      <div className="cb-keyring-preview-dock__card">
        <div className="cb-keyring-preview-dock__head">
          <span>{title}</span>
          <span className="cb-keyring-preview-dock__badge">LIVE</span>
        </div>
        <div className="cb-keyring-preview-dock__viewportWrap">
          <div ref={hostRef} className="cb-keyring-preview-dock__viewport" />
          {!ready ? <div className="cb-keyring-preview-dock__empty">{emptyMessage}</div> : null}
        </div>
      </div>
    </aside>
  );
}

export default KeyringPreviewDock;
