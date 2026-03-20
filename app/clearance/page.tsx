import Link from "next/link";

export default function ClearancePage() {
  return (
    <main className="app-shell workshop-surface">
      <header className="site-topbar">
        <div>
          <div className="eyebrow">CLEARANCE</div>
          <h1 className="page-title">땡처리 / 재고 정리</h1>
          <p className="muted">남는 재고, 테스트 샘플, 시즌 종료분을 정리하는 운영 페이지.</p>
        </div>

        <div className="action-row">
          <Link className="ghost-btn" href="/seller">운영 허브</Link>
          <Link className="primary-btn" href="/mode-select">내 작업실</Link>
        </div>
      </header>

      <section className="page-grid page-grid-3">
        <article className="panel">
          <div className="eyebrow">STOCK</div>
          <h2 className="section-title">남는 재고</h2>
          <p className="muted">과잉 생산분 / 샘플 / 이벤트 종료 재고 정리.</p>
        </article>
        <article className="panel">
          <div className="eyebrow">BUNDLES</div>
          <h2 className="section-title">묶음 판매</h2>
          <p className="muted">세트 구성으로 빠르게 처리하는 카드형 구조.</p>
        </article>
        <article className="panel">
          <div className="eyebrow">RECOVERY</div>
          <h2 className="section-title">재고 회수</h2>
          <p className="muted">원가/보관 부담을 줄이는 정리 페이지.</p>
        </article>
      </section>
    </main>
  );
}