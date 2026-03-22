"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type RouteItem = {
  href: string;
  label: string;
  description: string;
};

type RouteGroup = {
  title: string;
  caption: string;
  items: RouteItem[];
};

const routeGroups: RouteGroup[] = [
  {
    title: "허브",
    caption: "진입과 분기",
    items: [
      { href: "/", label: "홈", description: "소개보다 진입 결정을 먼저 보여주는 허브" },
      { href: "/mode-select", label: "모드 선택", description: "제작 · 운영 · 판매 분기 허브" },
      { href: "/qa", label: "제작 가이드", description: "전체 split IA 점검 체크리스트" },
    ],
  },
  {
    title: "제작",
    caption: "작업 판단",
    items: [
      { href: "/workbench/keyring", label: "키링 작업대", description: "본체 결정 → 파츠 조합 → 생산 판단" },
      { href: "/pop-studio", label: "POP 스튜디오", description: "구조물 계열 POP 설계와 조합 허브" },
    ],
  },
  {
    title: "운영",
    caption: "생산 지원",
    items: [
      { href: "/storage", label: "서랍", description: "제작 완료 → 재호출 → 리오더 회수 허브" },
    ],
  },
  {
    title: "판매",
    caption: "운영과 소진",
    items: [
      { href: "/option-store", label: "옵션 스토어", description: "결합 · 포장 · 후가공 옵션 분리" },
      { href: "/seller", label: "크루 판매", description: "크루 판매 · 운영 · 정산 허브" },
      { href: "/b2b", label: "대량주문", description: "대량 주문 · 기관 · 반복 거래 운영" },
      { href: "/clearance", label: "재고정리", description: "남은 재고 · 샘플 · 보류 자재 소진" },
    ],
  },
];

const dockSignals = [
  "홈은 소개보다 진입이 먼저 보여야 한다.",
  "모드 선택은 다음 행동을 한 줄로 설명해야 한다.",
  "작업대는 상품 소개가 아니라 조합 판단 허브여야 한다.",
  "운영 공간은 예쁜 공방 사진보다 생산 구조가 먼저 읽혀야 한다.",
  "판매 공간은 서로 다른 운영 목적이 문구 단계에서 분리되어야 한다.",
];

function isActivePath(currentPath: string, href: string) {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function RouteDock() {
  const pathname = usePathname();

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            분기 IA 안내
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            전체 동선은 허브 → 제작 → 운영 → 판매 역할이 분리되어 보여야 합니다.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            각 화면은 예쁜 소개 페이지가 아니라, 다음 액션이 무엇인지 빠르게 이해시키는 공간이어야 합니다.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100">
          현재 위치: <span className="font-semibold">{pathname}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="grid gap-4 lg:grid-cols-2">
          {routeGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{group.title}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {group.caption}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                  {group.items.length} routes
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "rounded-2xl border px-4 py-4 transition",
                        active
                          ? "border-cyan-300/45 bg-cyan-400/10"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-[11px] font-medium",
                            active
                              ? "bg-cyan-300/20 text-cyan-100"
                              : "bg-white/5 text-slate-400",
                          ].join(" ")}
                        >
                          {active ? "현재" : "이동"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                      <p className="mt-2 text-xs text-slate-500">{item.href}</p>
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm font-semibold text-white">빠른 실패 신호</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            아래 항목 중 하나라도 화면에서 바로 읽히지 않으면 split IA 문구가 아직 부족한 상태입니다.
          </p>

          <ul className="mt-4 space-y-3">
            {dockSignals.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-3 text-sm leading-6 text-slate-200"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}