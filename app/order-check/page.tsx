import type { Metadata } from "next";
import { STUDIO_LINKS } from "../../lib/studio-links";
import s from "../../components/customer-service.module.css";

export const metadata: Metadata = {
  title: "주문·제작 내역 조회 | 커스텀브로",
  description: "회원 로그인 또는 비회원 조회코드로 내 제작 요청, 견적과 진행 상태를 확인하세요.",
  robots: { index: false, follow: true },
};

export default function OrderCheckPage() {
  return <main className={s.page}>
    <header className={s.heading}>
      <p className={s.eyebrow}>CUSTOMBRO · 내 제작 내역</p>
      <h1>주문과 제작 진행을 확인하세요.</h1>
      <p>접수할 때 이용한 방식으로 내역을 여세요. 제작 상담·요청, 견적·결제와 진행 상태를 확인할 수 있습니다.</p>
    </header>
    <section className={s.grid} aria-label="주문 조회 방법">
      <article className={s.card}>
        <h2>회원으로 접수했나요?</h2>
        <p>접수한 계정으로 로그인해 내 주문과 제작 요청을 확인하세요. 이미 로그인했다면 바로 내역으로 연결됩니다.</p>
        <a className={s.button} href={STUDIO_LINKS.requests}>내 주문·제작 요청 보기</a>
      </article>
      <article className={s.card}>
        <h2>비회원으로 접수했나요?</h2>
        <p>접수 당시 별도로 보관한 비회원 조회코드를 입력하세요. 해당 코드에 연결된 본인의 제작 내역을 확인합니다.</p>
        <a className={s.button} href={STUDIO_LINKS.guestRequests}>비회원 조회코드로 확인</a>
      </article>
    </section>
    <section className={s.help}>
      <div><h2>조회코드가 없거나 내역을 찾을 수 없나요?</h2><p>접수번호와 문의 내용을 남겨 주세요. 본인 확인 후 안내합니다.</p></div>
      <a className={s.secondary} href={STUDIO_LINKS.support}>주문 내역 문의</a>
    </section>
    <p className={s.note}>상담 접수와 예상 제작비는 결제 완료를 뜻하지 않습니다. 실제 결제·제작·출고 상태는 각 내역의 기록을 확인해 주세요.</p>
  </main>;
}
