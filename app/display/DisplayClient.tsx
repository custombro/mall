"use client";

import { useEffect, useState } from "react";
import { STUDIO_LINKS } from "../../lib/studio-links";
import s from "./display.module.css";

const purposes = [
  { id: "hero", number: "01", title: "한 병을 위한 무대", subtitle: "싱글 제품 · 앰플 꽂이", copy: "주력 제품 한 병과 브랜드 메시지를 함께 보여주는 미니 진열대입니다.", detail: "제품 홀 · 하부 받침 · 브랜드 배면판" },
  { id: "collection", number: "02", title: "라인업을 한눈에", subtitle: "멀티 제품 · 세트 진열", copy: "서로 다른 제품의 크기와 순서에 맞춰 한 컬렉션으로 정리합니다.", detail: "제품별 자리 · 간격 · 인쇄 영역 검토" },
  { id: "exhibition", number: "03", title: "브랜드가 만나는 자리", subtitle: "박람회 · 팝업 · 매장", copy: "설치 공간과 운반 방식을 함께 고려해 전시 현장에 맞게 구성합니다.", detail: "설치 공간 · 분리 조립 · 납기 협의" },
  { id: "reorder", number: "04", title: "다음 시즌에도 이어서", subtitle: "같은 디자인 재주문 · 교체판", copy: "기존 제작물 정보를 바탕으로 추가 수량이나 교체할 인쇄판을 검토합니다.", detail: "기존 규격 확인 · 호환 검토 · 반복 제작" },
  { id: "partner", number: "05", title: "여러 브랜드의 제작 파트너", subtitle: "대행사 · OEM · 유통사", copy: "브랜드별 사양을 나눠 접수하고 공통으로 제작할 수 있는 부분을 찾습니다.", detail: "프로젝트별 견적 · 브랜드별 구성 협의" },
] as const;
type Purpose = typeof purposes[number]["id"];
const materials = [
  { id: "clear", label: "투명 · 유광" }, { id: "clear-matte", label: "투명 · 무광" },
  { id: "white-gloss", label: "진백 · 유광" }, { id: "white-matte", label: "진백 · 무광" },
  { id: "mirror", label: "미러" }, { id: "transparent-color", label: "투명 컬러" },
  { id: "matte-color", label: "무광 컬러" }, { id: "gloss-color", label: "유광 컬러" },
] as const;
type Receipt = { requestId: string; receivedAt: string };
const draftKey = "CB_DISPLAY_INQUIRY_DRAFT_V1";
const receiptKey = "CB_DISPLAY_INQUIRY_RECEIPT_V1";

function DisplayConcept({ multi = false, small = false }: { multi?: boolean; small?: boolean }) {
  return <svg viewBox="0 0 620 470" role="img" aria-label={multi ? "여러 화장품을 올린 아크릴 진열대 구성 예시" : "하부 받침과 배면판을 갖춘 한 병 진열대 구성 예시"} className={small ? s.smallConcept : s.concept}>
    <ellipse cx="315" cy="398" rx="221" ry="29" fill="#304334" opacity=".11" />
    <path d="M165 138 425 97 455 310 190 361Z" fill="#f8f7f0" stroke="#6b7e6f" strokeWidth="2" />
    <path d="m165 138 7-7 260-41-7 7Z" fill="#d4ddd2" stroke="#6b7e6f" strokeWidth="1.5" />
    <path d="m425 97 7-7 30 220-7 9Z" fill="#b8c7bb" stroke="#6b7e6f" strokeWidth="1.5" />
    <path d="m190 361 265-51 77 56-268 58-107-70Z" fill="#b8c5ae" stroke="#63755f" strokeWidth="2" />
    <path d="m157 354 107 70 268-58v13l-269 58-106-69Z" fill="#879b80" stroke="#63755f" strokeWidth="2" />
    <path d="m157 369 106 68 269-58v9l-269 59-106-69Z" fill="#e8e7df" stroke="#63755f" strokeWidth="2" />
    <g fill="#697763" fontFamily="Arial,sans-serif" transform="rotate(-9 276 181)"><text x="218" y="175" fontSize="13" letterSpacing="4">YOUR BRAND</text><text x="218" y="197" fontSize="7" letterSpacing="2">A LITTLE STAGE. A BIG IMPRESSION.</text></g>
    {(multi ? [0, 84, 168] : [75]).map((dx, i) => <g key={dx} transform={`translate(${dx} ${multi ? -dx * .16 : 0})`}>
      <ellipse cx="239" cy="355" rx="27" ry="11" fill="#54674f" opacity=".8" />
      <path d="M217 247q0-15 9-21v-15h27v15q9 6 9 21v105q-22 12-45 0Z" fill={i === 1 ? "#e7c6ad" : "#e5e4d7"} stroke="#6b7665" strokeWidth="1.5" />
      <ellipse cx="239.5" cy="211" rx="14" ry="4" fill="#a0ae91" stroke="#6b7665" />
      <path d="M225 198q14-5 29 0v17q-14 6-29 0Z" fill="#d5dcc8" stroke="#6b7665" />
      <ellipse cx="239.5" cy="198" rx="14.5" ry="4" fill="#f4f3ea" stroke="#6b7665" />
      <path d="M218 277q21 8 43 0v44q-21 8-43 0Z" fill="#f8f6eb" />
      <text x="239" y="297" textAnchor="middle" fill="#697763" fontSize="6" fontFamily="Arial,sans-serif" letterSpacing="1">BRAND</text>
      <path d="M227 306h25" stroke="#b6bba6" />
    </g>)}
  </svg>;
}

const faqs = [
  ["도면을 직접 만들어야 하나요?", "제품 크기, 수량, 사용 장소를 알려주시면 됩니다. 구조와 인쇄 위치를 함께 검토하며, 제작 도면은 운영자가 관리합니다."],
  ["어떤 소재에 배면 인쇄를 할 수 있나요?", "현재 접수 기준에서는 투명 유광 아크릴만 배면 인쇄를 선택할 수 있습니다. 진백·컬러·미러 및 무광 소재는 전면 인쇄로 검토합니다. 배면 인쇄는 투명판 뒤쪽에 인쇄하고 앞에서 보는 방식입니다."],
  ["수량이 늘어나면 가격이 달라지나요?", "동일한 디자인을 반복 제작하면 공통 준비 작업을 나눌 수 있습니다. 수량별 제작 효율을 반영해 견적을 검토하며, 소재·색상·가공 종류가 늘어나면 비용도 달라집니다."],
  ["이곳에서 신청하면 바로 제작되나요?", "스튜디오에서 제작 상담을 접수하고 내 제작 요청에서 답변을 확인합니다. 접수 후 사양·가격·납기와 시안을 확정해야 제작을 진행할 수 있습니다. 상담 접수 자체로 결제나 제작이 시작되지 않습니다."],
  ["제품 치수를 아직 모르는데 문의할 수 있나요?", "가능합니다. 모르는 치수는 비워 두고 보내주세요. 정확한 제작 사양을 확정할 때는 실측과 끼움 여유를 확인해야 합니다. 비원형 용기는 요청사항에 가로·깊이·높이를 적어주세요."],
];

const consultationHref = (purpose: Purpose) => STUDIO_LINKS.consultation + "&purpose=" + encodeURIComponent(purpose);
type PreviousInquiry = { draft: string; receipt: Receipt | null; unreadable: boolean };
const emptyPrevious: PreviousInquiry = { draft: "", receipt: null, unreadable: false };

function previousDraft(raw: string): string {
  if (raw.length > 16000) throw new Error("Oversized browser draft");
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid browser draft");
  const v = value as Record<string, unknown>;
  if (!["brand", "productName", "notes", "name", "email", "purpose"].some(key => typeof v[key] === "string")) throw new Error("Invalid browser draft");
  const field = (key: string, limit: number) => typeof v[key] === "string" ? (v[key] as string).slice(0, limit) : "";
  const purpose = purposes.find(p => p.id === v.purpose)?.subtitle ?? "미정";
  const material = materials.find(m => m.id === v.materialId)?.label ?? "미정";
  return [
    "[공개몰에 임시 저장했던 제작 상담 내용 · 자동 접수되지 않음]",
    "사용 목적: " + purpose,
    "브랜드명: " + (field("brand", 80) || "미정"),
    "제품명: " + (field("productName", 120) || "미정"),
    "용기 형태: " + (v.productShape === "round" ? "원형" : v.productShape === "other" ? "비원형" : "미정"),
    "본체 지름: " + (field("diameterMm", 40) || "미정") + " mm",
    "전체 높이: " + (field("heightMm", 40) || "미정") + " mm",
    "직접 측정 여부: " + (v.measurementsConfirmed === true ? "작성 당시 직접 측정으로 표시" : "미확인"),
    "진열대당 제품 수: " + (field("productsPerStand", 40) || "미정"),
    "제작 수량: " + (field("quantity", 40) || "미정"),
    "희망 소재: " + material,
    "희망 인쇄: " + (v.printSide === "rear" ? "배면" : v.printSide === "front" ? "전면" : "미정"),
    "희망 수령일: " + (field("requestedDate", 40) || "협의"),
    "담당자: " + field("name", 80),
    "회사 / 소속: " + field("company", 120),
    "회신 이메일: " + field("email", 254),
    "",
    "요청사항:",
    field("notes", 1500) || "없음",
  ].join("\n");
}

function previousReceipt(raw: string): Receipt {
  if (raw.length > 2048) throw new Error("Oversized browser receipt");
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid browser receipt");
  const v = value as Record<string, unknown>;
  if (typeof v.requestId !== "string" || !/^CBI-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v.requestId) || typeof v.receivedAt !== "string" || !Number.isFinite(Date.parse(v.receivedAt))) throw new Error("Invalid browser receipt");
  return { requestId: v.requestId, receivedAt: v.receivedAt };
}

export default function DisplayClient() {
  const [previous, setPrevious] = useState<PreviousInquiry>(emptyPrevious);
  const [copyNotice, setCopyNotice] = useState("");
  useEffect(() => {
    const stored: PreviousInquiry = { ...emptyPrevious };
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) stored.draft = previousDraft(raw);
    } catch { stored.unreadable = true; }
    try {
      const raw = localStorage.getItem(receiptKey);
      if (raw) stored.receipt = previousReceipt(raw);
    } catch { stored.unreadable = true; }
    // Existing browser records and public API records are retained unchanged.
    // New requests belong to the Studio's existing customer session and ticket.
    setPrevious(stored);
  }, []);
  const previousText = [
    previous.receipt ? [
      "[이 브라우저에 보관된 이전 공개몰 접수번호]",
      previous.receipt.requestId,
      "접수시각: " + new Date(previous.receipt.receivedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) + " (한국 시간)",
      ...(previous.draft ? ["아래 임시 초안과 같은 접수 내용이라는 뜻은 아닙니다."] : []),
    ].join("\n") : "",
    previous.draft,
  ].filter(Boolean).join("\n\n");
  async function copyPrevious() {
    if (!previousText) return;
    try {
      await navigator.clipboard.writeText(previousText);
      setCopyNotice("이전 내용을 복사했습니다. 필요한 내용만 스튜디오 상담에 붙여넣어 확인해 주세요. 자동으로 접수되지는 않습니다.");
    } catch {
      setCopyNotice("자동 복사를 사용할 수 없습니다. 아래 내용에서 필요한 부분을 선택해 직접 복사해 주세요.");
    }
  }
  return <main className={s.page}>
    <div className={s.wrap}>
      <nav className={s.localNav} aria-label="진열대 페이지 이동"><a href="#display-offers">제작 구성</a><a href="#display-process">진행 방식</a><a href="#display-faq">자주 묻는 질문</a><a href={STUDIO_LINKS.display} className={s.navCta}>직접 디자인 →</a></nav>
      <section className={s.hero}>
        <div className={s.heroCopy}><p className={s.eyebrow}>CUSTOMBRO · BRAND DISPLAY</p><h1>좋은 제품이<br />더 잘 보이는 자리.</h1><p className={s.lead}>화장품 한 병부터 브랜드의 전체 라인업까지.<br className={s.desktopBreak} /> 제품에 맞는 크기와 인쇄로 작은 진열대를 만듭니다.</p><div className={s.heroActions}><a className={s.primary} href={STUDIO_LINKS.display}>우리 제품으로 직접 디자인 <span aria-hidden="true">↗</span></a><a className={s.textLink} href={STUDIO_LINKS.consultation}>제작 상담부터 시작하기 →</a></div><p className={s.heroNote}>제품 크기·소재·인쇄 범위·수량을 확인한 뒤 견적을 안내합니다. 구조와 납기는 제작 전에 검토합니다.</p></div>
        <div className={s.heroVisual}><span className={s.visualLabel}>SINGLE PRODUCT DISPLAY</span><DisplayConcept /><div className={s.visualCaption}><span>제품 홀 + 하부 받침 + 배면판</span><span>구성 예시 · 실제 제작 사진 아님</span></div></div>
      </section>
      <div className={s.promiseStrip}><span>제품 크기에 맞춘 구조 검토</span><span>소재·인쇄·수량별 개별 견적</span><span>같은 디자인 추가 제작 상담</span></div>
      <section id="display-offers" className={s.section}><div className={s.sectionHeading}><div><p className={s.eyebrow}>WHAT ARE YOU DISPLAYING?</p><h2>어디에, 무엇을 보여주고 싶으세요?</h2></div><p>용도부터 고르면 필요한 정보를 함께 정리할 수 있습니다.</p></div>
        <div className={s.offerGrid}>{purposes.map((p, i) => <a key={p.id} href={consultationHref(p.id)} className={s.offer}><span className={s.offerTop}><span>{p.number}</span><span aria-hidden="true">↗</span></span>{i < 2 && <div className={s.offerArt}><DisplayConcept multi={i === 1} small /></div>}<span className={s.offerSubtitle}>{p.subtitle}</span><strong>{p.title}</strong><span className={s.offerCopy}>{p.copy}</span><span className={s.offerDetail}>{p.detail}</span><span className={s.offerLink}>이 구성으로 상담하기 →</span></a>)}</div>
      </section>
      <section id="display-process" className={`${s.section} ${s.process}`}><div><p className={s.eyebrow}>FROM PRODUCT TO DISPLAY</p><h2>고객은 제품을 알려주고,<br />우리는 제작할 정보를 정리합니다.</h2><p>복잡한 설계를 처음부터 완성할 필요는 없습니다.</p></div><ol><li><span>01</span><div><strong>제품과 수량 알려주기</strong><p>제품 크기, 사용 장소, 희망 수량과 일정을 남겨주세요.</p></div></li><li><span>02</span><div><strong>구조·시안·견적 확인</strong><p>맞는 소재와 인쇄 방식을 검토하고 제작 조건을 협의합니다.</p></div></li><li><span>03</span><div><strong>확정 후 제작 진행</strong><p>최종 시안과 금액·납기를 확인한 뒤 제작을 진행합니다.</p></div></li></ol></section>
      <section id="display-inquiry" className={`${s.section} ${s.inquiry}`}>
        <aside className={s.inquiryAside}><p className={s.eyebrow}>LET’S MAKE YOUR DISPLAY</p><h2>우리 제품에 맞는<br />진열대를 문의하세요.</h2><p>아직 정하지 못한 항목은 비워 두세요.<br />확인한 정보부터 함께 정리하겠습니다.</p><div className={s.quoteNote}><span>견적 안내</span><strong>사양과 수량에 맞춘 개별 견적</strong><p>소재 종류·색상·가공·조립·인쇄 공정에 따라 금액이 달라집니다. 동일 디자인의 수량이 늘어나면 제작 효율을 반영해 검토합니다.</p><p>최종 견적에서 제작 금액·부가세·배송비와 총액을 구분해 안내합니다.</p></div><div className={s.directContact}><span>이메일로 상담하기</span><a href="mailto:custombro365@gmail.com">custombro365@gmail.com ↗</a></div></aside>
        <section className={s.form} aria-labelledby="display-consultation-title">
          <div className={s.formHeading}><h3 id="display-consultation-title">제작 상담부터 답변 확인까지</h3><span>스튜디오에서 같은 접수 내역으로 이어집니다.</span></div>
          <p>제품 크기와 수량, 원하는 인쇄 내용을 알려주세요. 회원 또는 비회원으로 접수한 뒤 추가 문의와 답변을 확인할 수 있습니다.</p>
          <ol>
            <li>제품 정보와 필요한 수량을 입력합니다.</li>
            <li>제작 사양과 참고 자료를 확인하고 상담을 접수합니다.</li>
            <li>내 제작 요청에서 접수 내역과 답변을 이어서 확인합니다.</li>
          </ol>
          <a className={s.primary} href={STUDIO_LINKS.consultation}>스튜디오에서 제작 상담 시작 <span aria-hidden="true">↗</span></a>
          <a className={s.textLink} href={STUDIO_LINKS.requests}>접수 내역과 답변 확인 →</a>
          <p className={s.help}>비회원으로 접수하면 발급되는 조회 코드를 보관해 주세요. 상담 접수만으로 결제나 제작이 시작되지는 않습니다.</p>
          {(previous.draft || previous.receipt || previous.unreadable) && <section aria-label="이전 작성·접수 내용" className={s.previous}>
            <h4>{previous.draft || previous.receipt ? "이전에 이 브라우저에서 작성한 내용" : "브라우저 기록 확인"}</h4>
            {(previous.draft || previous.receipt) && <p>아래 기록은 그대로 보관되어 있습니다. 임시 초안은 접수 완료가 아니며, 이전 접수번호는 그때의 상담을 확인할 때 사용합니다.</p>}
            {previousText && <>
              <label className={s.field}>이전 작성·접수 내용<textarea readOnly rows={10} value={previousText} /></label>
              <div className={s.draftActions}><button type="button" onClick={copyPrevious}>이전 내용 복사</button></div>
            </>}
            {previous.unreadable && <p>브라우저의 이전 기록을 확인하지 못했습니다. 저장된 내용은 변경하지 않았으며, 새 상담은 위의 스튜디오에서 시작할 수 있습니다.</p>}
            {previous.receipt && <p>이전 접수 확인이 필요하면 접수번호와 함께 <a href="mailto:custombro365@gmail.com">이메일로 문의해 주세요.</a></p>}
            {copyNotice && <p role="status">{copyNotice}</p>}
          </section>}
        </section>
      </section>
      <section id="display-faq" className={`${s.section} ${s.faq}`}><div><p className={s.eyebrow}>GOOD TO KNOW</p><h2>제작 전에 궁금한 것들.</h2></div><div>{faqs.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
      <footer className={s.footer}><strong>CUSTOMBRO <span>DISPLAY STUDIO</span></strong><p>제품의 크기부터, 브랜드가 보이는 방식까지.</p><a href="mailto:custombro365@gmail.com">custombro365@gmail.com ↗</a></footer>
    </div>
  </main>;
}
