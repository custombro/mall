import type { Metadata } from "next";
import Link from "next/link";
import { STUDIO_LINKS } from "../../lib/studio-links";
import s from "../../components/customer-service.module.css";

export const metadata: Metadata = {
  title: "맞춤 제작 시작하기 | 커스텀브로",
  description: "진열대와 키링을 직접 설계하거나 제품 사양으로 제작 상담을 시작하세요.",
};

const products = [
  { title: "아크릴 진열대", description: "제품 크기와 수량에 맞는 구조를 고르고 소재·타공·인쇄를 정합니다.", href: STUDIO_LINKS.display, action: "진열대 만들기" },
  { title: "아크릴 키링", description: "외곽 모양과 크기, 구멍 위치, 앞뒤 인쇄를 직접 구성합니다.", href: STUDIO_LINKS.keyring, action: "키링 만들기" },
  { title: "그 밖의 아크릴 제품", description: "스탠디·안내판·명패 등 원하는 상품을 고르고 크기와 수량을 알려 주세요.", href: STUDIO_LINKS.products, action: "전체 상품 보기" },
];

export default function OrdersPage() {
  return <main className={s.page}>
    <header className={s.heading}>
      <p className={s.eyebrow}>CUSTOMBRO · 맞춤 제작</p>
      <h1>만들고 싶은 제품부터 선택하세요.</h1>
      <p>디자인과 사양을 정한 뒤 제작 검토를 요청할 수 있습니다. 최종 사양과 견적을 확인하고 제작을 진행합니다.</p>
    </header>
    <section className={s.grid} aria-label="제작할 제품 선택">
      {products.map(product => <article className={s.card} key={product.title}>
        <h2>{product.title}</h2><p>{product.description}</p>
        <a className={s.button} href={product.href}>{product.action}</a>
      </article>)}
    </section>
    <section className={s.help}>
      <div><h2>어떤 구조가 맞을지 모르겠다면</h2><p>제품의 크기, 사용할 곳과 필요한 수량부터 알려 주세요.</p></div>
      <a className={s.button} href={STUDIO_LINKS.consultation}>제작 상담 시작</a>
    </section>
    <p className={s.note}>이미 접수했다면 <Link href="/order-check">주문·제작 내역 조회</Link>에서 이어서 확인하세요.</p>
  </main>;
}
