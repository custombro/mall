export type RouteDockItem = {
  label: string;
  href: string;
};

const routeDockItems: RouteDockItem[] = [
  { label: "작업대", href: "/mode-select" },
  { label: "제작중", href: "/workbench/keyring" },
  { label: "서랍", href: "/storage" },
  { label: "전체", href: "/" },
];

export const ROUTE_DOCK_ITEMS = routeDockItems;
export default routeDockItems;