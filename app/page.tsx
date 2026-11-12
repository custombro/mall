import Link from "next/link";
import { STUDIO_LINKS } from "../lib/studio-links";

const featured = [
  {
    eyebrow: "BRAND GOODS",
    title: "커스텀 아크릴 키링",
    description: "원형·사각·자유도형부터 구멍 위치, 앞뒤 인쇄, 라미아크릴까지 직접 설계하세요.",
    href: STUDIO_LINKS.keyring,
    action: "키링 만들기",
    kind: "keyring",
    tags: ["자유도형", "1.5T + 1.5T 라미", "3D 미리보기"],
  },
  {
    eyebrow: "DISPLAY STUDIO",
    title: "화장품 · 브랜드 진열대",
    description: "제품 치수와 배치를 정하면 구조를 3D로 확인하고 예상 제작비까지 바로 볼 수 있습니다.",
    href: STUDIO_LINKS.display,
    action: "진열대 만들기",
    kind: "display",
    tags: ["구조 자동완성", "소재·인쇄 선택", "실시간 예상가"],
  },
] as const;

const useCases = [
  { title: "박람회 · 팝업", body: "행사에 맞춘 소형 진열대와 브랜드 POP", href: "/exhibition-display" },
  { title: "화장품 매장", body: "앰플·세럼·튜브 등 제품 치수 기반 진열", href: "/cosmetic-display" },
  { title: "브랜드 굿즈", body: "키링·스탠디·마그넷 등 아크릴 굿즈", href: STUDIO_LINKS.products },
];

export default function HomePage() {
  return (
    <main className="cb-home">
      <section className="cb-home-hero">
        <div className="cb-home-hero__copy">
          <p className="cb-kicker">CUSTOMBRO ACRYLIC STUDIO</p>
          <h1>
            만들고 싶은 아크릴을
            <br />
            화면에서 먼저 완성하세요.
          </h1>
          <p className="cb-home-hero__lead">
            키링부터 화장품 진열대까지. 크기·모양·소재·인쇄를 직접 정하고
            3D로 확인한 뒤 제작 상담까지 한 흐름으로 이어집니다.
          </p>
          <div className="cb-home-hero__actions">
            <a href={STUDIO_LINKS.products} className="cb-btn cb-btn--primary">상품 보기</a>
            <a href={STUDIO_LINKS.consultation} className="cb-btn cb-btn--ghost">GPT에게 제작 상담 맡기기</a>
          </div>
          <div className="cb-home-hero__trust">
            <span>부가세 별도 예상가 실시간 확인</span>
            <span>제작 전 사양 검토</span>
            <span>일반 고객 제작도면 비공개</span>
          </div>
        </div>

        <div className="cb-home-hero__visual" aria-label="커스텀브로 아크릴 제품 예시">
          <div className="cb-hero-stage">
            <div className="cb-hero-backboard"><span>CUSTOMBRO</span></div>
            <div className="cb-hero-base"></div>
            <div className="cb-hero-product cb-hero-product--one"></div>
            <div className="cb-hero-product cb-hero-product--two"></div>
            <div className="cb-hero-keyring">
              <div className="cb-hero-keyring__hole"></div>
              <span>CB</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cb-home-products">
        <div className="cb-section-heading">
          <div>
            <p className="cb-kicker">OPEN NOW</p>
            <h2>지금 바로 만들 수 있는 제품</h2>
          </div>
          <a href={STUDIO_LINKS.products}>전체 상품 보기 →</a>
        </div>

        <div className="cb-product-grid">
          {featured.map((item) => (
            <article key={item.title} className="cb-product-card">
              <div className="cb-product-card__preview">
                {item.kind === "keyring" ? (
                  <div className="cb-card-keyring"><i></i><span>YOUR<br/>DESIGN</span></div>
                ) : (
                  <div className="cb-card-display">
                    <div className="cb-card-display__back"></div>
                    <div className="cb-card-display__base"></div>
                    <div className="cb-card-display__bottle"></div>
                  </div>
                )}
              </div>
              <div className="cb-product-card__body">
                <p className="cb-kicker">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="cb-tag-row">
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <a href={item.href} className="cb-product-card__cta">{item.action}<span>→</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cb-home-flow">
        <div className="cb-section-heading">
          <div>
            <p className="cb-kicker">HOW IT WORKS</p>
            <h2>디자인부터 제작 요청까지</h2>
          </div>
        </div>
        <ol className="cb-flow-grid">
          <li><b>01</b><strong>제품 선택</strong><span>키링 또는 진열대에서 시작합니다.</span></li>
          <li><b>02</b><strong>직접 설계</strong><span>치수·모양·소재·인쇄를 화면에서 조정합니다.</span></li>
          <li><b>03</b><strong>3D · 예상가 확인</strong><span>완성 형태와 수량별 예상 공급가를 확인합니다.</span></li>
          <li><b>04</b><strong>제작 검토 요청</strong><span>저장된 사양을 기준으로 실제 제작 가능 여부를 확인합니다.</span></li>
        </ol>
      </section>

      <section className="cb-home-usecases">
        <div className="cb-section-heading">
          <div>
            <p className="cb-kicker">FOR YOUR BRAND</p>
            <h2>어디에 사용할 예정인가요?</h2>
          </div>
        </div>
        <div className="cb-usecase-grid">
          {useCases.map((item) => (
            <Link href={item.href} key={item.title} className="cb-usecase-card">
              <strong>{item.title}</strong>
              <span>{item.body}</span>
              <em>자세히 보기 →</em>
            </Link>
          ))}
        </div>
      </section>

      <section className="cb-home-assist">
        <div>
          <p className="cb-kicker">DESIGN ASSIST</p>
          <h2>직접 설계하기 어렵다면 GPT가 정리합니다.</h2>
          <p>제품 사진·실측·수량만 있어도 필요한 사양을 정리하고 다음 단계까지 안내합니다.</p>
        </div>
        <a href={STUDIO_LINKS.consultation} className="cb-btn cb-btn--primary">간편 제작 상담 시작</a>
      </section>
    </main>
  );
}
