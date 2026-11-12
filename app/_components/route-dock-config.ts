import { STUDIO_LINKS } from "../../lib/studio-links";

export type RouteDockItem = {
  label: string;
  href: string;
  matchStartsWith?: string[];
};

const routeDockItems: RouteDockItem[] = [
  { label: "홈", href: "/" },
  { label: "상품 보기", href: STUDIO_LINKS.products },
  { label: "키링 만들기", href: STUDIO_LINKS.keyring, matchStartsWith: ["/workbench/keyring"] },
  { label: "진열대 만들기", href: STUDIO_LINKS.display, matchStartsWith: ["/display"] },
  { label: "내 제작 요청", href: STUDIO_LINKS.requests },
  { label: "문의·A/S", href: STUDIO_LINKS.support },
];

export const ROUTE_DOCK_ITEMS = routeDockItems;
export default routeDockItems;
