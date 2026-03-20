export type RouteDockKind = "home" | "mode" | "production" | "resource" | "ops";

export type RouteDockItem = {
  id: string;
  label: string;
  href: string;
  kind: RouteDockKind;
};

export const routeDockItems: RouteDockItem[] = [
  { id: "dock-home",      label: "홈",       href: "/",                  kind: "home" },
  { id: "dock-mode",      label: "모드 선택", href: "/mode-select",       kind: "mode" },
  { id: "dock-keyring",   label: "키링",     href: "/workbench/keyring", kind: "production" },
  { id: "dock-pop",       label: "POP",      href: "/pop-studio",        kind: "production" },
  { id: "dock-storage",   label: "보관함",    href: "/storage",           kind: "ops" },
  { id: "dock-materials", label: "원자재",    href: "/materials-room",    kind: "resource" },
  { id: "dock-parts",     label: "부자재",    href: "/parts-room",        kind: "resource" },
  { id: "dock-option",    label: "옵션",     href: "/option-store",      kind: "resource" },
  { id: "dock-seller",    label: "판매자",    href: "/seller",            kind: "ops" },
  { id: "dock-b2b",       label: "B2B",      href: "/b2b",               kind: "ops" },
  { id: "dock-clearance", label: "재고정리",  href: "/clearance",         kind: "ops" },
];

export function getRouteDockKindClass(kind: RouteDockKind, active: boolean) {
  if (active) {
    return "border-cyan-300/40 bg-cyan-300 text-slate-950";
  }

  switch (kind) {
    case "home":
      return "border-white/10 bg-white/5 text-white";
    case "mode":
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
    case "production":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
    case "resource":
      return "border-violet-300/20 bg-violet-300/10 text-violet-100";
    default:
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }
}