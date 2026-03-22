import Link from "next/link";

export default function PersistentHomeLogo() {
  return (
    <Link
      href="/"
      aria-label="홈으로 이동"
      title="홈으로 이동"
      className="fixed left-4 top-4 z-[2147483647] flex items-center gap-3 rounded-2xl border border-cyan-300/70 bg-slate-950/96 px-3 py-2 text-white shadow-2xl shadow-slate-950/35 ring-2 ring-cyan-400/40 backdrop-blur transition hover:scale-[1.02] hover:bg-slate-900"
      style={{ pointerEvents: "auto" }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-sm font-black text-slate-950">
        CB
      </span>
      <span className="hidden min-w-0 flex-col leading-tight sm:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Home</span>
        <span className="text-sm font-semibold text-white">CustomBro Shop</span>
      </span>
    </Link>
  );
}
