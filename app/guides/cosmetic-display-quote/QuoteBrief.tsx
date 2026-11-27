"use client";

import { useRef, useState } from "react";
import styles from "./guide.module.css";

const initialBrief = `[화장품 미니 진열대 제작 상담]
제품명:
제품 크기(mm)·무게(g):
한 진열대에 놓을 제품 개수:
설치 공간 가로·깊이·높이(mm):
원하는 형태·색·실제 두께(mm):
로고·인쇄 내용:
만들 진열대 수량 / 디자인 종류:
희망 사용일 / 받을 지역:
제품·설치 장소 사진: 메일에 첨부
회신받을 연락처:
추가 요청:

참고한 안내: 화장품 미니 진열대 견적 준비 가이드`;

export default function QuoteBrief() {
  const [brief, setBrief] = useState(initialBrief);
  const [notice, setNotice] = useState("");
  const [copying, setCopying] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const mailHref = `mailto:custombro365@gmail.com?subject=${encodeURIComponent("[제작 안내 글] 화장품 미니 진열대 견적 문의")}&body=${encodeURIComponent(brief)}`;

  async function copyBrief() {
    if (copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(brief);
      setNotice("작성 내용을 복사했습니다. 메일이나 메모에 붙여 넣어 주세요.");
    } catch {
      field.current?.focus();
      field.current?.select();
      setNotice("자동 복사를 사용할 수 없습니다. 선택된 내용을 직접 복사해 주세요.");
    } finally {
      setCopying(false);
    }
  }

  return <div className={styles.briefForm}>
    <label htmlFor="display-quote-brief">상담 준비 내용 <span>모르는 항목은 ‘미정’으로 적어 주세요.</span></label>
    <textarea id="display-quote-brief" ref={field} value={brief} rows={14} maxLength={2000} onChange={event => { setBrief(event.target.value); setNotice(""); }} aria-describedby="display-quote-help display-quote-notice" spellCheck={false} />
    <div className={styles.actions}>
      <button className={styles.primary} type="button" disabled={copying} onClick={copyBrief}>{copying ? "복사 중…" : "작성 내용 복사"}</button>
      <a className={styles.secondary} href={mailHref}>메일 앱에서 문의 작성 <span aria-hidden="true">↗</span></a>
    </div>
    <p className={styles.help} id="display-quote-help">내용은 이 페이지에서만 유지됩니다. 메일 앱에서 수신자·내용을 확인한 뒤 직접 보내 주세요. 메일 앱이 없으면 복사한 내용을 custombro365@gmail.com으로 보내 주세요.</p>
    <p className={styles.notice} role="status" aria-live="polite" id="display-quote-notice">{notice}</p>
  </div>;
}
