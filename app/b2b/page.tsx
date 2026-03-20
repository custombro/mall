import Link from "next/link";

export default function B2BPage() {
  return (
    <main className="app-shell workshop-surface">
      <header className="site-topbar">
        <div>
          <div className="eyebrow">B2B</div>
          <h1 className="page-title">B2B 대량 주문 허브</h1>
          <p className="muted">기업/기관 주문 상담, POP 세트, 대량 키링 패키지 진입 페이지.</p>
        </div>

        <div className="action-row">
          <Link className="ghost-btn" href="/seller">운영 허브</Link>
          <Link className="primary-btn" href="/mode-select">내 작업실</Link>
        </div>
      </header>

      <section className="page-grid page-grid-3">
        <article className="panel">
          <div className="eyebrow">PACKAGE</div>
          <h2 className="section-title">행사 세트</h2>
          <p className="muted">행사용 키링/POP 묶음 제작 흐름.</p>
        </article>
        <article className="panel">
          <div className="eyebrow">INSTITUTION</div>
          <h2 className="section-title">기관 주문</h2>
          <p className="muted">관공서/학교/기업 요청 대응.</p>
        </article>
        <article className="panel">
          <div className="eyebrow">QUOTE</div>
          <h2 className="section-title">견적/납기</h2>
          <p className="muted">재질, 수량, 포장, 납기 중심의 견적 구조.</p>
        </article>
      </section>
    </main>
  );
}