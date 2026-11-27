import type { Metadata } from "next";
import Link from "next/link";
import QuoteBrief from "./QuoteBrief";
import styles from "./guide.module.css";

const canonical = "https://mall.custombro.org/guides/cosmetic-display-quote";
const title = "화장품 미니 진열대 제작, 견적 전에 준비할 5가지";
const description = "제품 실측, 한 진열대에 놓을 개수, 설치 공간, 로고·인쇄 자료, 제작 수량을 정리하는 커스텀브로 제작 안내. 상담 준비 양식을 복사해 사용하세요.";

export const metadata: Metadata = {
  title: `${title} | 커스텀브로`,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "article", locale: "ko_KR", siteName: "커스텀브로" },
};

const steps = [
  {
    id: "measurements", short: "제품 크기", title: "제품의 실제 크기",
    body: "제품별 가로·깊이·높이를 mm로 적어 주세요. 원통형 용기는 가장 넓은 부분의 지름도 필요합니다. 뚜껑이나 펌프가 튀어나오면 그 부분까지 재고, 제품 한 개의 무게와 제품 사진을 함께 준비해 주세요.",
    note: "제품을 꽂아 세울 계획이라면 구멍에 들어갈 부분의 크기도 따로 재 주세요.",
  },
  {
    id: "display-count", short: "진열 개수", title: "한 진열대에 놓을 수량",
    body: "한 진열대에 놓을 제품 개수와 만들 진열대 개수를 각각 적어 주세요. 제품 종류별 진열 개수, 앞뒤 줄 수, 테스터를 따로 둘지도 알려 주세요. 제품을 꺼낼 때 손이 들어갈 공간도 생각해 주세요.",
    note: "예: 한 진열대에 세럼 6개를 놓고, 같은 진열대를 10개 제작 — 진열 개수 6개 / 제작 수량 10개.",
  },
  {
    id: "space", short: "설치 공간", title: "설치할 공간",
    body: "설치 자리의 가로·깊이·사용 가능한 높이를 재 주세요. 진열대 뒤에 로고나 설명을 넣는 뒷판이 필요하면 그 높이도 포함합니다. 선반 안인지, 계산대 위인지와 설치 장소 사진을 함께 전달하면 배치를 설명하기 좋습니다.",
    note: "제품을 올린 전체 높이와, 위쪽에서 제품을 꺼낼 공간까지 확인해 주세요.",
  },
  {
    id: "printing", short: "로고·인쇄", title: "로고와 인쇄 내용",
    body: "로고 파일, 문구, 원하는 색과 인쇄 위치를 준비해 주세요. 투명하게 남길 곳과 흰색 바탕을 넣을 곳을 구분하면 좋습니다. 인쇄가 필요 없으면 ‘인쇄 없음’으로 적어 주세요. 화면의 색과 실물 인쇄색에는 차이가 있을 수 있습니다.",
    note: "작은 화면 캡처보다는 가지고 있는 로고 원본 파일을 준비해 주세요.",
  },
  {
    id: "production-count", short: "제작 수량", title: "만들 진열대 수량",
    body: "진열대 전체 수량과 같은 디자인인지, 지점별 문구가 다른지 적어 주세요. 희망 사용일과 받을 지역도 함께 남겨 주세요. 희망일은 확정 납기와 다르며, 가격과 일정은 사양 검토 후 확인합니다.",
    note: "같은 디자인의 반복 제작과, 여러 디자인을 각각 제작하는 경우를 구분해 주세요.",
  },
] as const;

const faqs = [
  ["사진만 보내도 치수를 알 수 있나요?", "사진은 형태 참고용입니다. 제품과 설치 공간의 실측값을 함께 준비해 주세요. 아직 모르는 항목은 ‘미정’으로 적고, 제작 전 실측을 확인합니다."],
  ["판 두께는 어떻게 정하나요?", "희망 두께가 있다면 2 mm·2.7 mm·5 mm처럼 실제 수치로 적어 주세요. 필요한 두께는 판 크기, 제품 무게와 지지 구조를 함께 확인합니다. 모든 형태에서 같은 두께를 선택할 수 있는 것은 아닙니다."],
  ["제품을 꽂는 구멍도 제품 크기와 같게 하면 되나요?", "제품이 들어갈 부분을 실측해 전달해 주세요. 구멍 크기와 끼움 여유는 형태와 제작 조건을 확인한 뒤 정합니다. 고객이 임의로 여유 치수를 더하기보다 제품의 실제 크기를 알려 주세요."],
  ["뒷면에 인쇄해서 앞에서 볼 수 있나요?", "투명 유광 아크릴은 뒤쪽에 인쇄하고 앞에서 보는 배면 인쇄를 검토할 수 있습니다. 진백·컬러·미러·무광 소재는 전면 인쇄 기준으로 확인합니다."],
  ["화면에 나온 예상 금액으로 바로 제작되나요?", "예상 금액과 상담 접수는 최종 견적이나 제작 확정이 아닙니다. 확정 견적의 소재·크기·인쇄·수량·배송 조건과 일정을 확인한 뒤 진행합니다."],
] as const;

const structuredData = [
  { "@context": "https://schema.org", "@type": "Article", headline: title, description, inLanguage: "ko-KR", mainEntityOfPage: canonical, author: { "@type": "Organization", name: "커스텀브로", url: "https://mall.custombro.org/" } },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://mall.custombro.org/" },
    { "@type": "ListItem", position: 2, name: "화장품 진열대", item: "https://mall.custombro.org/cosmetic-display" },
    { "@type": "ListItem", position: 3, name: "견적 준비 안내", item: canonical },
  ] },
];

export default function CosmeticDisplayQuoteGuide() {
  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <nav className={styles.breadcrumb} aria-label="현재 위치">
        <Link href="/">홈</Link><span aria-hidden="true">/</span>
        <Link href="/cosmetic-display">화장품 진열대</Link><span aria-hidden="true">/</span>
        <span aria-current="page">견적 준비 안내</span>
      </nav>

      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>커스텀브로 제작 안내</p>
          <h1>화장품 미니 진열대,<br />견적 전에 준비할 5가지</h1>
          <p className={styles.lead}>담을 제품과 놓을 공간부터 정하면 상담이 쉬워집니다.<br className={styles.desktopBreak} /> 아직 정하지 못한 항목은 ‘미정’으로 남겨도 됩니다.</p>
          <a href="#quote-brief" className={styles.primary}>상담 준비 양식으로 이동 <span aria-hidden="true">↓</span></a>
        </div>
        <nav className={styles.contents} aria-label="이 글의 목차">
          <p>견적 준비 체크리스트</p>
          <ol>{steps.map((step, index) => <li key={step.id}><a href={`#${step.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{step.short}<span aria-hidden="true">↘</span></a></li>)}</ol>
        </nav>
      </header>

      <div className={styles.readingLayout}>
        <article aria-label="견적을 준비하는 다섯 단계" className={styles.article}>
          {steps.map((step, index) => (
            <section id={step.id} key={step.id} className={styles.step}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div><h2>{step.title}</h2><p>{step.body}</p><p className={styles.tip}>{step.note}</p></div>
            </section>
          ))}
        </article>
        <aside className={styles.aside}>
          <p className={styles.eyebrow}>먼저 기억해 주세요</p>
          <h2>실측은 mm로,<br />수량은 두 가지로.</h2>
          <p>제품을 몇 개 놓는지와 진열대를 몇 개 만드는지를 나누어 적으면, 처음부터 같은 기준으로 상담할 수 있습니다.</p>
          <div className={styles.quantityExample}><span>한 진열대에 놓을 제품</span><strong>6개</strong><span>만들 진열대</span><strong>10개</strong><small>수량을 구분하기 위한 예시입니다.</small></div>
          <Link href="/cosmetic-display">화장품 진열대 구성 살펴보기 <span aria-hidden="true">→</span></Link>
        </aside>
      </div>

      <section className={styles.faq} aria-labelledby="guide-faq-title">
        <p className={styles.eyebrow}>자주 묻는 질문</p>
        <h2 id="guide-faq-title">처음 제작할 때 궁금한 점</h2>
        <div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <section id="quote-brief" className={styles.brief} aria-labelledby="quote-brief-title">
        <div><p className={styles.eyebrow}>견적 준비 양식</p><h2 id="quote-brief-title">아는 내용부터 채워 주세요.</h2><p>아래 양식을 수정한 뒤 복사하거나 메일 앱으로 옮길 수 있습니다. 제품과 설치 장소 사진은 메일에 첨부해 주세요.</p></div>
        <QuoteBrief />
      </section>
      <footer className={styles.footer}><Link href="/cosmetic-display">← 화장품 진열대 소개</Link><Link href="/display#display-inquiry">온라인 상담 안내 보기 →</Link></footer>
    </main>
  );
}
