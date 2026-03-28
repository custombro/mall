"use client";

export function KeyringPreviewDock() {
  return (
    <>
      <a
        href="/"
        data-cb-home-chip="1"
        style={{
          position: "fixed",
          top: 14,
          left: 14,
          zIndex: 120,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 999,
          background: "rgba(6,12,24,.92)",
          border: "1px solid rgba(125,211,252,.24)",
          boxShadow: "0 12px 24px rgba(0,0,0,.28)",
          textDecoration: "none",
          color: "#e5eefc",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: ".04em",
        }}
      >
        <span
          data-cb-home-dot="1"
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(125,211,252,.16)",
            color: "#7dd3fc",
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          CB
        </span>
        <span>CUSTOMBRO HOME</span>
      </a>
      <span style={{ display: "none" }}>CB_FULLWIDTH_V11</span>
    </>
  );
}
