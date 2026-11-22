import type { Metadata } from "next";
import Link from "next/link";
import { STUDIO_LINKS } from "../../lib/studio-links";
import s from "../../components/customer-service.module.css";

export const metadata: Metadata = {
  title: "제작 문의·A/S | 커스텀브로",
  description: "제작 사양과 파일 준비, 주문 조회, 파손 문의를 확인하고 내 상담을 접수하세요.",
};

// Also published in the existing /display customer contact section.
const supportEmail = "custombro365@gmail.com";
const emailDrafts = [
  {
    title: "제작·견적 문의",
    description: "만들 제품, 크기와 수량, 사용 목적을 알려 주세요. 아직 정하지 못한 항목은 비워 두셔도 됩니다.",
    subject: "[커스텀브로] 제작·견적 문의",
    body: "문의 상품·제작물:\n제품 크기·규격(알고 있는 내용):\n필요 수량:\n사용 목적·희망 일정:\n문의 내용:\n\n참고 이미지나 도면은 메일 앱에서 직접 첨부해 주세요.",
  },
  {
    title: "주문·조회·출고 문의",
    description: "접수번호나 주문번호가 있다면 함께 적어 주세요. 조회 화면이 열리지 않는 경우에도 문의할 수 있습니다.",
    subject: "[커스텀브로] 주문·조회·출고 문의",
    body: "접수번호 또는 주문번호(있는 경우):\n확인할 내용:\n확인이 필요한 일정(있는 경우):\n\n비회원 조회코드, 비밀번호, 카드·결제정보와 전체 배송주소는 적지 마세요.",
  },
  {
    title: "파손·A/S 문의",
    description: "제품 상태와 확인한 날짜를 적고, 제품 전체·문제 부위·포장 상태의 사진을 메일에 첨부해 주세요.",
    subject: "[커스텀브로] 파손·A/S 문의",
    body: "접수번호 또는 주문번호(있는 경우):\n문제를 확인한 날짜:\n제품 상태와 문의 내용:\n\n제품 전체·문제 부위·포장 상태의 사진은 메일 앱에서 직접 첨부해 주세요.",
  },
];

const questions = [
  { question: "어떤 크기를 알려드리면 되나요?", answer: "진열할 제품의 가장 넓은 지름 또는 가로·세로, 전체 높이와 무게를 알려 주세요. 화면의 기본 치수는 시작값이며, 실제 제품과 재료 두께·끼움 여유를 확인한 뒤 제작 사양을 정합니다." },
  { question: "어떤 이미지 파일을 준비하나요?", answer: "편집기에는 JPG·PNG·WebP 이미지를 올릴 수 있습니다. 로고는 배경이 투명한 PNG를 사용하면 배치하기 편합니다. 최종 인쇄 데이터는 제작 전에 확인합니다." },
  { question: "화면에 표시된 예상가로 바로 제작되나요?", answer: "예상 제작비는 사양을 정할 때 참고하는 금액입니다. 제작 가능 여부와 최종 사양을 확인하고 확정 견적을 안내합니다. 결제와 제작 확정 상태는 접수 내역에서 확인해 주세요." },
  { question: "비회원도 접수하고 내역을 볼 수 있나요?", answer: "비회원으로 계속을 선택해 제작 검토를 요청할 수 있습니다. 접수할 때 받은 조회코드를 별도로 보관하고 비회원 조회 화면에서 입력하세요. 회원 계정에 연결된 과거 기록은 로그인 후 확인합니다." },
  { question: "제작 중 수정이나 출고 일정이 궁금해요.", answer: "접수번호와 변경하고 싶은 내용을 문의에 남겨 주세요. 현재 제작 단계와 기록을 확인한 뒤 안내합니다. 변경 가능 여부나 출고일은 확인 전까지 확정되지 않습니다." },
  { question: "제품이 파손된 상태로 도착했어요.", answer: "제품 전체, 파손 부위와 포장 상태가 보이는 사진을 첨부해 문의해 주세요. 다칠 위험이 있다면 사용을 멈추고 파손 부위를 직접 만지지 마세요. 처리 방법은 주문과 사진을 확인한 뒤 안내합니다." },
];

export default function QAPage() {
  return <main className={s.page}>
    <header className={s.heading}>
      <p className={s.eyebrow}>CUSTOMBRO · 고객 상담</p>
      <h1>제작 문의·A/S</h1>
      <p>처음 만드는 제품의 사양부터 접수한 주문과 파손 문의까지, 필요한 내용을 남겨 주세요.</p>
    </header>
    <div className={s.actions}>
      <a className={s.button} href={STUDIO_LINKS.support}>문의·A/S 접수와 답변 확인</a>
      <Link className={s.secondary} href="/order-check">주문·제작 내역 조회</Link>
      <a className={s.secondary} href="#email">이메일 문의 준비</a>
    </div>
    <h2 className={s.faqHeading}>자주 묻는 질문</h2>
    <section className={s.faq} aria-label="자주 묻는 질문과 답변">
      {questions.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
    </section>
    <section id="email" aria-labelledby="email-heading">
      <h2 id="email-heading" className={s.faqHeading}>이메일로 문의하기</h2>
      <p className={s.note}>온라인 상담이나 주문 조회 화면이 열리지 않으면 이메일로 문의해 주세요. 아래에서 필요한 항목이 적힌 메일 초안을 열 수 있습니다.</p>
      <div className={s.grid}>
        {emailDrafts.map(draft => <article className={s.card} key={draft.subject}>
          <h2>{draft.title}</h2><p>{draft.description}</p>
          <a className={s.button} aria-label={`${draft.title} 메일 초안 열기`} href={`mailto:${supportEmail}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}>메일 앱에서 초안 열기</a>
        </article>)}
      </div>
      <p className={s.note}>초안을 여는 것만으로 문의가 접수되지는 않습니다. 메일 앱에서 내용을 확인하고 필요한 파일을 첨부한 뒤 직접 발송해 주세요. 문의에는 필요한 내용만 적고, 비회원 조회코드·비밀번호·카드 등 결제정보·전체 배송주소는 포함하지 마세요.</p>
      <p className={s.note}>메일 앱이 열리지 않으면 <a href={`mailto:${supportEmail}`}>{supportEmail}</a> 주소를 복사해 평소 사용하는 이메일에서 작성해 주세요. 이 페이지에서는 메일 발송 여부와 접수 상태를 확인할 수 없습니다.</p>
    </section>
    <section className={s.help}>
      <div><h2>제품 제작을 처음 시작하나요?</h2><p>사용할 곳과 제품 크기, 필요한 수량을 알려 주시면 사양부터 정리합니다.</p></div>
      <a className={s.secondary} href={STUDIO_LINKS.consultation}>간편 제작 상담</a>
    </section>
  </main>;
}
