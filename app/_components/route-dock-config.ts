export type RouteDockItem = {
  label: string;
  href: string;
  matchStartsWith?: string[];
};

const routeDockItems: RouteDockItem[] = [
  { label: "홈", href: "/" },
  { label: "제작", href: "/workbench", matchStartsWith: ["/workbench"] },
  { label: "주문", href: "/orders", matchStartsWith: ["/orders"] },
  { label: "주문확인", href: "/order-check", matchStartsWith: ["/order-check"] },
  { label: "내정보", href: "/my", matchStartsWith: ["/my"] },
];

export const ROUTE_DOCK_ITEMS = routeDockItems;
export default routeDockItems;
