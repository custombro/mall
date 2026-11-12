import type { ReactNode } from "react";

type Point = { title: string; body: string };
type Props = {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  points: Point[];
  note?: string;
};

export default function SalesLanding({
  eyebrow,
  title,
  lead,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  points,
  note,
}: Props) {
  return (
    <main className="min-h-screen bg-[#f7f7f2] px-5 py-10 text-[#253c30]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#64785f]">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#5d6e5b]">{lead}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={primaryHref} className="rounded-xl bg-[#42634b] px-6 py-4 font-semibold text-white">
            {primaryLabel} →
          </a>
          <a href={secondaryHref} className="rounded-xl border border-black/10 bg-white px-6 py-4 font-semibold">
            {secondaryLabel}
          </a>
        </div>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          {points.map((point) => (
            <article key={point.title} className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="text-lg font-semibold">{point.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#657462]">{point.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 rounded-3xl bg-[#e7ecdf] p-7 sm:p-10">
          <h2 className="text-2xl font-semibold">도면이 없어도 시작할 수 있습니다.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5f705b]">
            제품 크기, 필요한 수량, 인쇄할 이미지와 사용 목적을 알려주면 제작 검토에 필요한 정보를 정리합니다.
            화면의 예상 금액은 부가세 별도 계획용 금액이며 실제 제작 전 사양과 납기를 확인합니다.
          </p>
          {note ? <p className="mt-4 text-xs leading-6 text-[#6b7867]">{note}</p> : null}
        </section>
      </div>
    </main>
  );
}
