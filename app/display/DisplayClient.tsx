"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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
type Fields = { purpose: Purpose; brand: string; productName: string; productShape: "round" | "other"; diameterMm: string; heightMm: string; measurementsConfirmed: boolean; productsPerStand: string; quantity: string; materialId: string; printSide: "front" | "rear"; requestedDate: string; notes: string; name: string; company: string; email: string; website: string; privacyConsent: boolean; marketingConsent: boolean };
const initial: Fields = { purpose: "hero", brand: "", productName: "", productShape: "round", diameterMm: "", heightMm: "", measurementsConfirmed: false, productsPerStand: "1", quantity: "1", materialId: "white-matte", printSide: "front", requestedDate: "", notes: "", name: "", company: "", email: "", website: "", privacyConsent: false, marketingConsent: false };
type Receipt = { requestId: string; receivedAt: string; message?: string };
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
  ["이곳에서 신청하면 바로 제작되나요?", "지금은 제작 상담과 견적을 요청하는 단계입니다. 접수번호가 발급된 뒤 사양·가격·납기와 시안을 확정해야 주문을 진행할 수 있습니다. 상담 접수 자체로 결제나 제작이 시작되지 않습니다."],
  ["제품 치수를 아직 모르는데 문의할 수 있나요?", "가능합니다. 모르는 치수는 비워 두고 보내주세요. 정확한 제작 사양을 확정할 때는 실측과 끼움 여유를 확인해야 합니다. 비원형 용기는 요청사항에 가로·깊이·높이를 적어주세요."],
];

export default function DisplayClient() {
  const [f, setF] = useState<Fields>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [previousReceipt, setPreviousReceipt] = useState<Receipt | null>(null);
  const attempt = useRef<{ signature: string; key: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [intakeReady, setIntakeReady] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    fetch("/api/display-inquiries", { cache: "no-store", signal: controller.signal })
      .then(async response => response.ok && (await response.json())?.acceptingInquiries === true)
      .then(ready => { if (mounted) setIntakeReady(ready); })
      .catch(() => { if (mounted) setIntakeReady(false); });
    return () => { mounted = false; controller.abort(); };
  }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(receiptKey);
      if (raw) { const r = JSON.parse(raw); if (typeof r.requestId === "string" && typeof r.receivedAt === "string") setPreviousReceipt(r); }
    } catch { /* Browsing without storage remains supported. */ }
  }, []);
  function retireReceipt() {
    if (receipt) setPreviousReceipt(receipt);
    setReceipt(null);
  }
  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    if (busy) return;
    retireReceipt();
    setF(old => ({ ...old, [key]: value, ...(key === "materialId" && value !== "clear" ? { printSide: "front" as const } : {}) }));
    setNotice("");
  }
  function choose(purpose: Purpose) {
    if (busy) return;
    update("purpose", purpose);
    if (purpose === "hero") update("productsPerStand", "1");
    if (purpose === "collection") update("productsPerStand", "3");
    document.getElementById("display-inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("display-brand")?.focus({ preventScroll: true }), 350);
  }
  const selectedPurpose = purposes.find(x => x.id === f.purpose) ?? purposes[0];
  const materialName = materials.find(x => x.id === f.materialId)?.label ?? "미정";
  const emailBody = ["[화장품 진열대 제작 상담]", `용도: ${selectedPurpose.subtitle}`, `브랜드: ${f.brand || "미정"}`, `제품명: ${f.productName || "미정"}`, `형태: ${f.productShape === "round" ? "원형" : "비원형"}`, `지름: ${f.diameterMm || "미정"} mm / 높이: ${f.heightMm || "미정"} mm`, `진열 제품 수: ${f.productsPerStand} / 제작 수량: ${f.quantity}`, `소재: ${materialName} / 인쇄: ${f.printSide === "rear" ? "배면" : "전면"}`, `희망일: ${f.requestedDate || "협의"}`, `담당자: ${f.name} / 회사: ${f.company}`, `회신 이메일: ${f.email}`, "", `요청사항: ${f.notes || "없음"}`, "", "온라인 접수 확인이 완료되지 않아 이메일로 문의합니다."].join("\n");
  const mailHref = `mailto:custombro365@gmail.com?subject=${encodeURIComponent(`[진열대 제작 상담] ${f.brand || f.company || selectedPurpose.subtitle}`)}&body=${encodeURIComponent(emailBody)}`;
  function saveDraft() {
    try { sessionStorage.setItem(draftKey, JSON.stringify({ ...f, privacyConsent: false, marketingConsent: false, website: "" })); setNotice("이 브라우저 탭에 임시 저장했습니다. 온라인으로 접수된 상태는 아닙니다."); } catch { setNotice("브라우저 저장을 사용할 수 없습니다. 입력한 내용은 현재 화면에 남아 있습니다."); }
  }
  function restoreDraft() {
    if (busy) return;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) { setNotice("이 탭에 저장된 작성 내용이 없습니다."); return; }
      const parsed = JSON.parse(raw) as Partial<Fields>;
      const next = { ...initial };
      for (const key of Object.keys(initial) as (keyof Fields)[]) {
        if (typeof parsed[key] === typeof initial[key]) Object.assign(next, { [key]: parsed[key] });
      }
      if (!purposes.some(x => x.id === next.purpose)) next.purpose = "hero";
      if (!materials.some(x => x.id === next.materialId)) next.materialId = "white-matte";
      if (next.productShape !== "round" && next.productShape !== "other") next.productShape = "round";
      if (next.printSide !== "rear" || next.materialId !== "clear") next.printSide = "front";
      next.privacyConsent = false; next.marketingConsent = false; next.website = "";
      retireReceipt();
      setF(next); setNotice("작성 내용을 불러왔습니다. 아직 온라인으로 접수되지 않았습니다.");
    } catch { setNotice("저장된 작성 내용을 불러오지 못했습니다."); }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy || intakeReady !== true || !formRef.current?.reportValidity()) return;
    setError(""); setReceipt(null);
    const numeric = (value: string) => value.trim() === "" ? null : Number(value);
    const brief = { purpose: f.purpose, brand: f.brand.trim(), productName: f.productName.trim(), productShape: f.productShape, diameterMm: f.productShape === "round" ? numeric(f.diameterMm) : null, heightMm: numeric(f.heightMm), measurementsConfirmed: f.productShape === "round" && f.measurementsConfirmed && !!f.diameterMm && !!f.heightMm, productsPerStand: Number(f.productsPerStand), quantity: Number(f.quantity), materialId: f.materialId, printSide: f.materialId === "clear" ? f.printSide : "front", requestedDate: f.requestedDate, notes: f.notes.trim() };
    const payload = { brief, contact: { name: f.name.trim(), company: f.company.trim(), email: f.email.trim() }, privacyConsent: f.privacyConsent, marketingConsent: f.marketingConsent, website: f.website };
    const signature = JSON.stringify(payload);
    if (attempt.current?.signature !== signature) attempt.current = { signature, key: crypto.randomUUID() };
    setBusy(true);
    const controller = new AbortController(); const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/display-inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, idempotencyKey: attempt.current.key }), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 503 || response.status === 404) throw new Error("현재 온라인 접수가 연결되지 않아 전송되지 않았습니다. 작성 내용은 그대로 남아 있습니다. 아래 이메일 문의로 이어갈 수 있습니다.");
        if (response.status === 429) throw new Error("짧은 시간에 요청이 많습니다. 잠시 후 같은 내용으로 다시 접수해 주세요.");
        if (response.status === 400 || response.status === 422) throw new Error("입력 내용을 확인해 주세요. 이름·이메일, 제품 수와 제작 수량, 소재와 인쇄 방식이 올바른지 확인해 주세요.");
        throw new Error("접수 확인 응답을 받지 못했습니다. 잠시 후 같은 내용으로 다시 시도하거나 이메일로 문의해 주세요.");
      }
      if (typeof data.requestId !== "string" || !data.requestId || typeof data.receivedAt !== "string") throw new Error("서버 접수번호를 확인하지 못했습니다. 현재 접수 완료로 표시할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      const confirmed: Receipt = { requestId: data.requestId, receivedAt: data.receivedAt, message: typeof data.message === "string" ? data.message : undefined };
      setReceipt(confirmed); setPreviousReceipt(null);
      try { localStorage.setItem(receiptKey, JSON.stringify({ requestId: confirmed.requestId, receivedAt: confirmed.receivedAt })); sessionStorage.removeItem(draftKey); } catch { /* Server receipt remains valid. */ }
    } catch (err) {
      setError(err instanceof Error && err.name !== "AbortError" ? err.message : "접수 확인 응답을 받지 못했습니다. 작성 내용은 남아 있습니다. 같은 내용으로 다시 보내면 중복 접수 여부를 확인합니다.");
    } finally { window.clearTimeout(timer); setBusy(false); }
  }
  return <main className={s.page}>
    <div className={s.wrap}>
      <nav className={s.localNav} aria-label="진열대 페이지 이동"><a href="#display-offers">제작 구성</a><a href="#display-process">진행 방식</a><a href="#display-faq">자주 묻는 질문</a><a href={STUDIO_LINKS.display} className={s.navCta}>직접 디자인 →</a></nav>
      <section className={s.hero}>
        <div className={s.heroCopy}><p className={s.eyebrow}>CUSTOMBRO · BRAND DISPLAY</p><h1>좋은 제품이<br />더 잘 보이는 자리.</h1><p className={s.lead}>화장품 한 병부터 브랜드의 전체 라인업까지.<br className={s.desktopBreak} /> 제품에 맞는 크기와 인쇄로 작은 진열대를 만듭니다.</p><div className={s.heroActions}><a className={s.primary} href={STUDIO_LINKS.display}>우리 제품으로 직접 디자인 <span aria-hidden="true">↗</span></a><a className={s.textLink} href={STUDIO_LINKS.consultation}>제작 상담부터 시작하기 →</a></div><p className={s.heroNote}>제품 크기와 소재를 정하며 예상 제작비를 확인하세요. 구조와 납기는 제작 전에 검토합니다.</p></div>
        <div className={s.heroVisual}><span className={s.visualLabel}>SINGLE PRODUCT DISPLAY</span><DisplayConcept /><div className={s.visualCaption}><span>제품 홀 + 하부 받침 + 배면판</span><span>구성 예시 · 실제 제작 사진 아님</span></div></div>
      </section>
      <div className={s.promiseStrip}><span>제품 크기에 맞춘 구조 검토</span><span>소재·인쇄·수량별 개별 견적</span><span>같은 디자인 추가 제작 상담</span></div>
      <section id="display-offers" className={s.section}><div className={s.sectionHeading}><div><p className={s.eyebrow}>WHAT ARE YOU DISPLAYING?</p><h2>어디에, 무엇을 보여주고 싶으세요?</h2></div><p>용도부터 고르면 필요한 정보를 함께 정리할 수 있습니다.</p></div>
        <div className={s.offerGrid}>{purposes.map((p, i) => <button type="button" key={p.id} onClick={() => choose(p.id)} disabled={busy} className={s.offer}><span className={s.offerTop}><span>{p.number}</span><span aria-hidden="true">↗</span></span>{i < 2 && <div className={s.offerArt}><DisplayConcept multi={i === 1} small /></div>}<span className={s.offerSubtitle}>{p.subtitle}</span><strong>{p.title}</strong><span className={s.offerCopy}>{p.copy}</span><span className={s.offerDetail}>{p.detail}</span><span className={s.offerLink}>이 구성으로 상담하기 →</span></button>)}</div>
      </section>
      <section id="display-process" className={`${s.section} ${s.process}`}><div><p className={s.eyebrow}>FROM PRODUCT TO DISPLAY</p><h2>고객은 제품을 알려주고,<br />우리는 제작할 정보를 정리합니다.</h2><p>복잡한 설계를 처음부터 완성할 필요는 없습니다.</p></div><ol><li><span>01</span><div><strong>제품과 수량 알려주기</strong><p>제품 크기, 사용 장소, 희망 수량과 일정을 남겨주세요.</p></div></li><li><span>02</span><div><strong>구조·시안·견적 확인</strong><p>맞는 소재와 인쇄 방식을 검토하고 제작 조건을 협의합니다.</p></div></li><li><span>03</span><div><strong>확정 후 제작 진행</strong><p>최종 시안과 금액·납기를 확인한 뒤 제작을 진행합니다.</p></div></li></ol></section>
      <section id="display-inquiry" className={`${s.section} ${s.inquiry}`}>
        <aside className={s.inquiryAside}><p className={s.eyebrow}>LET’S MAKE YOUR DISPLAY</p><h2>우리 제품에 맞는<br />진열대를 문의하세요.</h2><p>아직 정하지 못한 항목은 비워 두세요.<br />확인한 정보부터 함께 정리하겠습니다.</p><div className={s.quoteNote}><span>견적 안내</span><strong>사양과 수량에 맞춘 개별 견적</strong><p>소재 종류·색상·가공·조립·인쇄 공정에 따라 금액이 달라집니다. 동일 디자인의 수량이 늘어나면 제작 효율을 반영해 검토합니다.</p><p>견적의 제작 금액은 <b>부가세 별도</b>이며, 최종 결제 단계에서 부가세와 총액을 확인합니다.</p></div><div className={s.directContact}><span>이메일로 상담하기</span><a href="mailto:custombro365@gmail.com">custombro365@gmail.com ↗</a></div></aside>
        <form ref={formRef} onSubmit={submit} className={s.form}>
          <div className={s.formHeading}><h3>제작 상담 요청</h3><span>이름·이메일·필수 동의가 필요합니다.</span></div>
          {intakeReady !== true && <div className={s.notice} role="status">
            {intakeReady === null ? "온라인 접수 가능 여부를 확인하고 있습니다." : "현재 이 페이지의 온라인 접수 서버가 연결되지 않았습니다."}
            {" "}<a href={STUDIO_LINKS.consultation}>통합 스튜디오에서 상담 시작하기 →</a>
            {" "}<a href={mailHref}>작성 내용을 이메일로 문의하기 →</a>
          </div>}
          <fieldset disabled={busy} className={s.formFields} aria-label="제작 상담 내용">
          <label className={s.field}>사용 목적<select value={f.purpose} onChange={e => update("purpose", e.target.value as Purpose)}>{purposes.map(p => <option key={p.id} value={p.id}>{p.subtitle}</option>)}</select></label>
          <div className={s.twoCol}><label className={s.field}>브랜드명<input id="display-brand" value={f.brand} onChange={e => update("brand", e.target.value)} maxLength={80} placeholder="예: 브랜드 이름" /></label><label className={s.field}>진열할 제품명<input value={f.productName} onChange={e => update("productName", e.target.value)} maxLength={120} placeholder="예: 앰플, 세럼, 크림" /></label></div>
          <fieldset className={s.fieldset}><legend>제품 크기</legend><div className={s.threeCol}><label className={s.field}>용기 형태<select value={f.productShape} onChange={e => update("productShape", e.target.value as "round" | "other")}><option value="round">원형</option><option value="other">비원형 / 기타</option></select></label><label className={s.field}>본체 지름 · mm<input type="number" inputMode="decimal" min="1" max="500" step="0.1" value={f.diameterMm} onChange={e => update("diameterMm", e.target.value)} placeholder="미정이면 비워두세요" disabled={f.productShape === "other"} /></label><label className={s.field}>전체 높이 · mm<input type="number" inputMode="decimal" min="10" max="1000" step="0.1" value={f.heightMm} onChange={e => update("heightMm", e.target.value)} placeholder="뚜껑 포함 높이" /></label></div><p className={s.help}>{f.productShape === "other" ? "비원형은 아래 요청사항에 가로 × 깊이 × 높이와 용기 형태를 알려주세요." : "사진만으로 실측값을 확정하지 않습니다. 제작 전 용기와 꽂이 홀의 여유를 확인합니다."}</p><label className={s.check}><input type="checkbox" checked={f.measurementsConfirmed} onChange={e => update("measurementsConfirmed", e.target.checked)} /> 입력한 치수는 제품을 직접 측정한 값입니다.</label></fieldset>
          <div className={s.twoCol}><label className={s.field}>진열대 하나에 놓을 제품 수<input type="number" inputMode="numeric" min="1" max="12" step="1" required value={f.productsPerStand} onChange={e => update("productsPerStand", e.target.value)} /><small>제품 1~12개 · 더 많으면 요청사항에 적어주세요.</small></label><label className={s.field}>제작할 진열대 수량<input type="number" inputMode="numeric" min="1" max="10000" step="1" required value={f.quantity} onChange={e => update("quantity", e.target.value)} /><small>동일 디자인 기준 · 단위: 개</small></label></div>
          <div className={s.twoCol}><label className={s.field}>희망 아크릴 소재<select value={f.materialId} onChange={e => update("materialId", e.target.value)}>{materials.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></label><label className={s.field}>인쇄 방식<select value={f.printSide} onChange={e => update("printSide", e.target.value as "front" | "rear")}><option value="front">전면 인쇄</option><option value="rear" disabled={f.materialId !== "clear"}>배면 인쇄 · 투명 유광만</option></select></label></div>
          <p className={s.materialNote}>{f.materialId === "clear" ? "투명판은 뒤쪽에 인쇄하고 앞에서 보는 배면 인쇄를 선택할 수 있습니다. 색 표현과 백색 인쇄는 시안에서 함께 확인합니다." : "진백·컬러·미러·무광 소재는 이 접수 기준에서 배면 인쇄를 지원하지 않습니다. 전면 인쇄로 검토합니다."} 소재별 색상·두께와 공급 가능 여부는 상담에서 확인합니다.</p>
          <label className={s.field}>희망 수령일<input type="date" value={f.requestedDate} onChange={e => update("requestedDate", e.target.value)} /><small>희망 일정이며, 확정 납기는 사양 검토 후 안내합니다.</small></label>
          <label className={s.field}>요청사항<textarea value={f.notes} onChange={e => update("notes", e.target.value)} maxLength={1500} rows={4} placeholder="설치 공간, 원하는 컬러, 여러 제품의 크기, 교체할 기존 제작물, 참고 이미지 링크 등을 알려주세요." /><small>이미지·로고 원본은 상담 과정에서 전달 방법을 안내합니다.</small></label>
          <fieldset className={s.fieldset}><legend>회신받을 정보</legend><div className={s.twoCol}><label className={s.field}>담당자 이름 <span aria-hidden="true">*</span><input required autoComplete="name" maxLength={80} value={f.name} onChange={e => update("name", e.target.value)} /></label><label className={s.field}>회사 / 소속<input autoComplete="organization" maxLength={120} value={f.company} onChange={e => update("company", e.target.value)} /></label></div><label className={s.field}>이메일 <span aria-hidden="true">*</span><input type="email" required autoComplete="email" maxLength={254} value={f.email} onChange={e => update("email", e.target.value)} placeholder="reply@yourbrand.com" /></label></fieldset>
          <div className={s.honeypot} aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={e => update("website", e.target.value)} /></label></div>
          <div className={s.consent}><label className={s.check}><input type="checkbox" required checked={f.privacyConsent} onChange={e => update("privacyConsent", e.target.checked)} /><span>[필수] 작성한 이름·이메일·회사명과 제품 정보를 제작 상담 및 견적 회신에 사용하는 데 동의합니다.</span></label><p>동의를 거부할 수 있으며, 동의하지 않으면 온라인 상담을 접수할 수 없습니다. 개인정보 관련 문의: custombro365@gmail.com</p><label className={s.check}><input type="checkbox" checked={f.marketingConsent} onChange={e => update("marketingConsent", e.target.checked)} /><span>[선택] 신규 제작 구성과 재주문 안내를 이메일로 받습니다.</span></label></div>
          {error && <div className={s.error} role="alert"><strong>접수 확인이 필요합니다</strong><p>{error}</p><a href={mailHref}>작성 내용으로 이메일 앱 열기 ↗</a><small>메일 앱을 연 것만으로는 접수되지 않습니다. 내용을 확인한 뒤 직접 발송해야 합니다.</small></div>}
          {receipt && <div className={s.success} role="status"><strong>서버에 상담 요청이 접수되었습니다.</strong><p>접수번호 <b>{receipt.requestId}</b></p><p>접수시각: {new Date(receipt.receivedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })} (한국 시간)</p><small>상담 접수 단계입니다. 가격·납기·결제·제작은 아직 확정되지 않았습니다.</small></div>}
          {!receipt && previousReceipt && <p className={s.previous}>이 브라우저에 보관된 이전 서버 접수번호: <b>{previousReceipt.requestId}</b><br />현재 작성 중인 내용의 접수번호는 아닙니다.</p>}
          {notice && <p role="status" className={s.notice}>{notice}</p>}
          <button className={s.submit} type="submit" disabled={busy || intakeReady !== true}>{busy ? "접수 확인 중…" : "제작 상담 요청 보내기"}<span aria-hidden="true">→</span></button><p className={s.submitNote}>결제가 발생하지 않습니다. 서버 접수번호가 표시되어야 접수가 완료됩니다.</p>
          <div className={s.draftActions}><button type="button" onClick={saveDraft}>이 탭에 임시 저장</button><button type="button" onClick={restoreDraft}>임시 저장 불러오기</button></div>
          </fieldset>
        </form>
      </section>
      <section id="display-faq" className={`${s.section} ${s.faq}`}><div><p className={s.eyebrow}>GOOD TO KNOW</p><h2>제작 전에 궁금한 것들.</h2></div><div>{faqs.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
      <footer className={s.footer}><strong>CUSTOMBRO <span>DISPLAY STUDIO</span></strong><p>제품의 크기부터, 브랜드가 보이는 방식까지.</p><a href="mailto:custombro365@gmail.com">custombro365@gmail.com ↗</a></footer>
    </div>
  </main>;
}
