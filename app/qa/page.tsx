import Link from "next/link";

const routeChecks = [
  { href: "/", label: "홈", goal: "mode-select 진입이 바로 보이는지 확인" },
  { href: "/mode-select", label: "모드 선택", goal: "workbench / pop / storage 분기 동선 확인" },
  { href: "/workbench/keyring", label: "키링 작업대", goal: "작업 흐름과 상태 설명이 실제 작업대처럼 읽히는지 확인" },
  { href: "/pop-studio", label: "POP 스튜디오", goal: "POP 전용 설계 흐름이 키링과 분리되어 보이는지 확인" },
  { href: "/storage", label: "보관함", goal: "제작 완료 / 재주문 회수 흐름이 보이는지 확인" },
  { href: "/materials-room", label: "원자재실", goal: "아크릴 판재 랙 중심 톤이 살아있는지 확인" },
  { href: "/parts-room", label: "부자재실", goal: "금속 하드웨어 존 / 서랍 흐름이 읽히는지 확인" },
  { href: "/option-store", label: "옵션 스토어", goal: "고리 / 포장 / 추가 옵션 분기 구조 확인" },
  { href: "/seller", label: "셀러 센터", goal: "크루 판매 / 판매자 흐름 분리 확인" },
  { href: "/b2b", label: "B2B 허브", goal: "대량 주문 / 기관 주문 흐름 확인" },
  { href: "/clearance", label: "클리어런스", goal: "남는 재고 / 땡처리 흐름 확인" },
];

const sceneTargets = [
  "원자재실은 밝은 소품방이 아니라 금속 랙에 아크릴 원장을 적재한 산업형 존으로 읽혀야 한다.",
  "부자재실은 D링, O링, 체인, OPP가 텍스트와 구조로 명확하게 분리되어야 한다.",
  "보관함은 제작 완료 → 보관 → 재주문 회수 흐름이 서랍/박스 단위로 보여야 한다.",
  "작업대는 레고/테트리스처럼 파츠를 조합하는 제작 허브로 해석되어야 한다.",
  "이미지 안 AI 글자에 의존하지 말고 실제 DOM 텍스트로 의미를 보강해야 한다.",
];

const qaRules = [
  "첫 화면에서 어디로 들어가야 하는지 3초 안에 이해되어야 한다.",
  "각 페이지의 제목, 서브카피, 카드 설명이 실제 공정 용어와 맞아야 한다.",
  "이미 구현된 split IA를 다시 만들지 말고 설명력과 동선만 보강한다.",
  "화면 톤이 어긋나면 다음 패치에서 이미지보다 텍스트 구조를 먼저 고친다.",
  "build / tsc 통과 전 완료 선언 금지.",
];

export default function QAPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
          CustomBro / Split IA QA
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          화면 QA 체크리스트
        </h1>

        <p className="mt-4 max-w-4xl text-sm leading-7 text-white/70">
          최신 baseline 다음 우선순위인 화면 QA와 공방 컨셉 디테일 보강을 바로 진행할 수 있도록 만든
          내부 점검용 라우트입니다. 각 페이지를 빠르게 열어보고 실제 공방 동선, 원자재/부자재 분리,
          보관함 회수 흐름, 작업대 허브성, 판매/대량주문 분기 구조를 확인합니다.
        </p>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">라우트 점검 순서</h2>
            <div className="mt-4 grid gap-3">
              {routeChecks.map((route, index) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition hover:border-white/25 hover:bg-black/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">
                      {String(index + 1).padStart(2, "0")}. {route.label}
                    </span>
                    <span className="text-xs text-white/45">{route.href}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/70">{route.goal}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold">공방 컨셉 타겟</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                {sceneTargets.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold">QA 규칙</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                {qaRules.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}