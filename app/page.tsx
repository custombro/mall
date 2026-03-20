import Link from "next/link";

type HubCard = {
  href: string;
  title: string;
  subtitle: string;
  bullets: string[];
  cta: string;
};

const makingCards: HubCard[] = [
  {
    href: "/mode-select",
    title: "제작 모드 선택",
    subtitle: "무엇을 만들지 먼저 고르고 바로 작업대로 들어갑니다.",
    bullets: [
      "제작 유형별 진입점 정리",
      "혼란 없이 다음 화면으로 연결",
      "허브형 구조의 첫 관문",
    ],
    cta: "모드 선택 열기",
  },
  {
    href: "/workbench/keyring",
    title: "키링 작업대",
    subtitle: "작업대 위에서 배치·옵션·제작 흐름을 잡는 핵심 공간입니다.",
    bullets: [
      "작업 중심 동선",
      "실제 제작 UI 허브",
      "다음 확장 작업대의 기준",
    ],
    cta: "작업대 열기",
  },
  {
    href: "/pop-studio",
    title: "POP 스튜디오",
    subtitle: "POP/진열물 제작 흐름을 별도 공간으로 분리해 관리합니다.",
    bullets: [
      "POP 전용 진입점",
      "후속 제작 인터랙션 확장 기반",
      "제품군별 분기 구조 정리",
    ],
    cta: "POP 스튜디오 열기",
  },
];

const roomCards: HubCard[] = [
  {
    href: "/storage",
    title: "보관함",
    subtitle: "완성 작업물, 진행 중인 결과물, 서랍형 재주문 흐름의 중심입니다.",
    bullets: [
      "서랍/보관함 기반 UX",
      "작업물 재호출",
      "재주문 동선 연결",
    ],
    cta: "보관함 열기",
  },
  {
    href: "/materials-room",
    title: "원자재 룸",
    subtitle: "아크릴 원장과 재료를 공간 개념으로 정리하는 자재 허브입니다.",
    bullets: [
      "원자재 존 분리",
      "산업용 선반/랙 톤 유지",
      "작업 전 재료 확인",
    ],
    cta: "원자재 룸 열기",
  },
  {
    href: "/parts-room",
    title: "부자재 룸",
    subtitle: "고리, 스탠드, 보조 파츠 같은 세부 부품을 따로 관리합니다.",
    bullets: [
      "부자재 동선 분리",
      "조합 전 파츠 확인",
      "추후 BOM 연결 기반",
    ],
    cta: "부자재 룸 열기",
  },
  {
    href: "/option-store",
    title: "옵션 스토어",
    subtitle: "추가 옵션과 구성품을 제품 흐름과 분리해 선택하는 공간입니다.",
    bullets: [
      "옵션 선택 분리",
      "구성 변경 대응",
      "후속 가격 정책 확장 기반",
    ],
    cta: "옵션 스토어 열기",
  },
];

const salesCards: HubCard[] = [
  {
    href: "/seller",
    title: "판매자 센터",
    subtitle: "크루 판매와 판매자 관점 흐름을 위한 관리 공간입니다.",
    bullets: [
      "판매자 전용 동선",
      "후속 정산/관리 확장",
      "크루 판매 구조 기반",
    ],
    cta: "판매자 센터 열기",
  },
  {
    href: "/b2b",
    title: "B2B / 공공기관",
    subtitle: "대량 주문과 기관 수요를 일반 소비자 흐름과 분리합니다.",
    bullets: [
      "대량 주문 전용 진입",
      "기관/행사용 흐름 분리",
      "후속 견적/납기 대응",
    ],
    cta: "B2B 허브 열기",
  },
  {
    href: "/clearance",
    title: "재고 정리",
    subtitle: "남는 재고와 땡처리 성격의 상품을 일반 제작 흐름과 분리합니다.",
    bullets: [
      "재고 소진 전용 공간",
      "정규 제작 동선과 분리",
      "판매 구조 다층화",
    ],
    cta: "재고 정리 열기",
  },
];

function HubSection({
  eyebrow,
  title,
  description,
  cards,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cards: HubCard[];
}) {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/10"
          >
            <div className="flex h-full flex-col gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                <p className="text-sm leading-6 text-slate-300">{card.subtitle}</p>
              </div>

              <ul className="space-y-2 text-sm text-slate-200">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
                <span>{card.cta}</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-10 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(15,23,42,0.92),rgba(59,130,246,0.16))] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2">
                {["GitHub-first", "Hub IA", "Workbench", "Storage", "Crew Sale"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                  CustomBro Mall
                </p>
                <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  홈은 모든 걸 한 화면에 늘어놓는 곳이 아니라,
                  <br className="hidden sm:block" />
                  각 작업 공간으로 들어가는 허브여야 합니다.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  지금 홈은 제작, 보관, 자재, 판매, 대량주문 같은 흐름을
                  허브형으로 분기시키는 메인 입구입니다. 각 페이지는 자기 역할에
                  집중하고, 홈은 소개와 진입만 담당하도록 정리합니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/mode-select"
                  className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  제작 시작
                </Link>
                <Link
                  href="/storage"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  보관함 보기
                </Link>
                <Link
                  href="/seller"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  판매자 센터
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-stretch">
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                  현재 구조 원칙
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  <li>• 홈은 허브, 상세 작업은 각 전용 라우트로 분리</li>
                  <li>• 작업대와 보관함은 별도 공간으로 유지</li>
                  <li>• 원자재와 부자재는 서로 다른 룸으로 분리</li>
                  <li>• 판매/대량주문/재고정리는 운영 흐름으로 분리</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                  바로 들어가기
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["/workbench/keyring", "키링 작업대"],
                    ["/pop-studio", "POP 스튜디오"],
                    ["/materials-room", "원자재 룸"],
                    ["/parts-room", "부자재 룸"],
                    ["/option-store", "옵션 스토어"],
                    ["/b2b", "B2B"],
                  ].map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 transition hover:bg-white/10"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <HubSection
          eyebrow="Making Flow"
          title="제작 시작"
          description="무엇을 만들지 선택하고 작업대로 진입하는 제작 중심 동선입니다. 홈은 작업 자체를 길게 설명하지 않고, 적절한 작업 공간으로 정확히 보내는 역할에 집중합니다."
          cards={makingCards}
        />

        <HubSection
          eyebrow="Rooms"
          title="보관 · 원자재 · 부자재 · 옵션 공간"
          description="공방형 UX의 핵심은 물건과 행위를 공간으로 이해시키는 데 있습니다. 보관함, 원자재, 부자재, 옵션을 한 화면에 섞지 않고 각각의 방으로 분리합니다."
          cards={roomCards}
        />

        <HubSection
          eyebrow="Sales / Operations"
          title="판매 · 운영 흐름"
          description="일반 제작 흐름과 다른 판매/운영 목적의 페이지를 분리해 구조를 덜 복잡하게 유지합니다. 판매자, 대량주문, 재고정리 흐름은 각각 별도 진입점을 가집니다."
          cards={salesCards}
        />

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                Next Step
              </p>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                다음 작업은 각 공간의 완성도를 높이는 것입니다.
              </h2>
              <p className="text-sm leading-7 text-slate-300 sm:text-base">
                허브 구조가 정리됐으니 이제는 각 전용 라우트 내부에서 인터랙션,
                상태 연결, 화면 밀도를 다듬는 순서로 진행하면 됩니다.
              </p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                1. 키링 작업대 상호작용 고도화
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                2. 보관함/서랍 UX 연결 강화
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                3. 원자재/부자재/옵션 데이터 연결
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                4. 판매·B2B·재고정리 운영 흐름 세부화
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}