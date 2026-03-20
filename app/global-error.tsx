"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 24, fontFamily: '"Segoe UI","Noto Sans KR","Malgun Gothic",Arial,sans-serif', background: "#111827", color: "#ffffff" }}>
        <h1 style={{ marginTop: 0, fontSize: 28 }}>CB Mall 오류 화면</h1>
        <p style={{ lineHeight: 1.7, opacity: 0.9 }}>
          개발 서버 렌더링 중 오류가 발생했다.
        </p>
        <pre style={{ whiteSpace: "pre-wrap", padding: 16, borderRadius: 12, background: "#1f2937", overflow: "auto" }}>
{String(error?.message ?? "UNKNOWN_ERROR")}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          style={{ marginTop: 16, height: 44, padding: "0 16px", borderRadius: 10, border: "1px solid #374151", background: "#2563eb", color: "#fff", cursor: "pointer" }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}