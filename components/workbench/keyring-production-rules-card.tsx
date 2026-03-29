import React from "react";

export type KeyringProductionRulesCardProps = React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;

export function KeyringProductionRulesCard({
  className = "",
  ...rest
}: KeyringProductionRulesCardProps) {
  return (
    <section
      {...rest}
      className={`rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">운영 요약</p>
          <h3 className="mt-1 text-sm font-semibold text-black">작업대 우선 규칙</h3>
        </div>
        <span className="rounded-full border border-black/10 bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium text-black/55">
          축소 표시
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-[13px] leading-5 text-black/68">
        <div className="rounded-xl border border-black/8 bg-black/[0.025] px-3 py-2">기본 포장 포함</div>
        <div className="rounded-xl border border-black/8 bg-black/[0.025] px-3 py-2">수량/규격에 따라 자동 반영</div>
        <div className="rounded-xl border border-black/8 bg-black/[0.025] px-3 py-2">작업대에서는 선택과 조립 흐름을 우선</div>
      </div>
    </section>
  );
}

export default KeyringProductionRulesCard;
