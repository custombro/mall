import type { ReactNode } from "react";

type Point = { title: string; body: string };
type Faq = { question: string; answer: string };
type RelatedLink = { label: string; href: string };
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
  faqs?: Faq[];
  relatedLinks?: RelatedLink[];
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
  faqs,
  relatedLinks,
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

        {faqs?.length ? (
          <section aria-labelledby="sales-faq-heading" className="mt-12">
            <h2 id="sales-faq-heading" className="text-2xl font-semibold">자주 묻는 질문</h2>
            <div className="mt-5 space-y-3">
              {faqs.map(({ question, answer }) => (
                <details key={question} className="rounded-xl border border-black/10 bg-white p-5">
                  <summary className="cursor-pointer font-semibold">{question}</summary>
                  <p className="mt-3 text-sm leading-7 text-[#657462]">{answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {relatedLinks?.length ? (
          <nav aria-label="관련 아크릴 상품" className="mt-10 border-t border-black/10 pt-7">
            <h2 className="text-base font-semibold">함께 살펴보기</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedLinks.map(({ href, label }) => (
                <a key={href} href={href} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold">{label} →</a>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </main>
  );
}
