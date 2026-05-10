"use client";

import Link from "next/link";
import KeyringBrushAssistLabPage from "./brush-assist-lab/page";

const deployMarker = "DEPLOY_KEYRING_MAIN_BRUSH_ENTRY_20260415";

export default function KeyringWorkbenchPage() {
  return (
    <>
      <div className="fixed inset-x-0 top-3 z-[80] flex justify-center px-3">
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-cyan-300/20 bg-[#08172f]/92 px-3 py-2 text-[11px] font-semibold text-cyan-100 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <span className="rounded-full bg-cyan-400/[0.14] px-2 py-1 text-cyan-100">본편 브러시 연결</span>
          <span className="text-white/55">{deployMarker}</span>
          <Link href="/workbench/keyring/brush-assist-lab" className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-white/78 hover:bg-white/[0.1]">
            실험실
          </Link>
          <Link href="/workbench/keyring/brush-assist-demo" className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-white/78 hover:bg-white/[0.1]">
            단일 데모
          </Link>
        </div>
      </div>
      <KeyringBrushAssistLabPage />
    </>
  );
}
