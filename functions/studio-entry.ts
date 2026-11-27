import { STUDIO_ORIGIN, STUDIO_DESTINATIONS } from "../lib/studio-links";

type DestinationKey = keyof typeof STUDIO_DESTINATIONS;
const allowedPurposes = new Set(["hero", "collection", "exhibition", "reorder", "partner"]);

const headers = {
  "Cache-Control": "no-store, max-age=0, no-transform",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

function isDestination(value: string | null): value is DestinationKey {
  return value !== null && Object.prototype.hasOwnProperty.call(STUDIO_DESTINATIONS, value);
}

function fallbackResponse(): Response {
  const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>커스텀브로 온라인 설계 서비스 안내</title>
<style>
*{box-sizing:border-box}body{font-family:system-ui,"Noto Sans KR",sans-serif;background:#f5f6f0;color:#213b31;margin:0;min-height:100vh;display:grid;place-items:center;padding:20px}
main{width:min(100%,560px);background:white;border:1px solid #cbd6c8;border-radius:16px;padding:clamp(24px,5vw,44px);box-shadow:0 12px 38px #1e352014}
small{letter-spacing:.12em;font-weight:750;color:#5b7664}h1{font-size:clamp(23px,4vw,32px);line-height:1.35}p{line-height:1.85;color:#4c6357}
a{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:8px;border:1px solid #436450;color:#2c4b37;text-decoration:none;min-height:44px;font-weight:650}
a.primary{background:#294b3b;color:white}nav{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.email{word-break:break-all}
</style></head>
<body><main><small>CUSTOMBRO · ACRYLIC STUDIO</small>
<h1>온라인 설계 서비스는 준비 중입니다.</h1>
<p>현재 스튜디오는 고객 접속을 제한하고 있습니다. 설계·저장·견적·주문이 정상 이용 가능하다고 안내하지 않겠습니다.</p>
<p>제작 관련 상담은 기존 커스텀브로 고객 이메일로 접수할 수 있습니다. 제품 크기, 수량, 필요한 인쇄면 및 희망 사용일을 함께 알려주세요. 문의만으로 확정 견적이나 제작이 시작되지는 않습니다.</p>
<p class="email"><strong><!--email_off-->custombro365@gmail.com<!--/email_off--></strong></p>
<nav><!--email_off--><a class="primary" href="mailto:custombro365@gmail.com?subject=Custombro%20acrylic%20production%20inquiry">이메일로 제작 문의</a><!--/email_off--><a href="/display#display-inquiry">제작 안내로 돌아가기</a><a href="/">공개몰 홈</a></nav>
</main></body></html>`;
  return new Response(html, { status: 200, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
}

/**
 * Existing Pages Functions runtime. No persistent storage, token or extra
 * source of authority: a safe navigation check for the existing Studio only.
 */
export async function onRequest({ request }: { request: Request }): Promise<Response> {
  if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: { ...headers, Allow: "GET" } });
  const url = new URL(request.url);
  const to = url.searchParams.get("to");
  const purpose = url.searchParams.get("purpose");
  const keys = [...url.searchParams.keys()];
  if (!isDestination(to) ||
      url.searchParams.getAll("to").length !== 1 ||
      keys.some(key => key !== "to" && key !== "purpose") ||
      (purpose !== null && (to !== "consultation" || !allowedPurposes.has(purpose) || url.searchParams.getAll("purpose").length !== 1))) {
    return new Response("Invalid studio destination", { status: 400, headers });
  }

  const destination = new URL(STUDIO_DESTINATIONS[to], STUDIO_ORIGIN);
  if (purpose !== null) destination.searchParams.set("purpose", purpose);

  // The publicly accessible start path must respond successfully; owner-only
  // preview permissions must never be interpreted as customer readiness.
  try {
    const readiness = await fetch(new URL("/start", STUDIO_ORIGIN), {
      method: "GET",
      redirect: "manual",
      headers: { Accept: "text/html" },
      signal: AbortSignal.timeout(4000),
    });
    const contentType = readiness.headers.get("content-type") || "";
    if (readiness.status === 200 && contentType.includes("text/html")) {
      return new Response(null, { status: 302, headers: { ...headers, Location: destination.toString() } });
    }
  } catch {
    // Upstream inaccessible or timed out; keep customers on the existing mall.
  }
  return fallbackResponse();
}
