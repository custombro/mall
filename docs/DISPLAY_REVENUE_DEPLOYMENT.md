# 진열대 상담 판매 경로 배포·운영 인수인계

작성일: 2026-11-12. 이 문서는 구현된 코드와 실제 운영 연결을 구분한다. **작성 시점에는 Cloudflare 로그인, 신규 D1 연결 및 비밀값 등록이 완료되지 않았고, 신규 `/display` 경로의 운영 배포도 확인되지 않았다.** 아래 확인 항목을 통과하기 전에는 온라인 상담 접수가 가동되었다고 안내하지 않는다.

## 기존 자산과 이번 변경

| 영역 | 대상 | 역할 |
|---|---|---|
| 기존 공개 쇼핑몰 | `https://mall.custombro.org/` | 기존 고객 접점 유지 |
| 기존 Pages 프로젝트 | `custombro-mall-order-v1` | 현재 공개 도메인에 연결된 배포 대상 |
| 소스 기준 | GitHub `custombro/mall` | 기존 저장소에 변경 반영 |
| 신규 고객 경로 | `/display` | 제품 정보·소재·동일 디자인 수량·희망 조건·연락처를 받아 상담 접수 |
| 신규 공개 API | `/api/display-inquiries` | GET은 접수 준비 여부만 반환, POST는 상담 저장 및 접수번호 반환 |
| 신규 운영 API | `/api/display-operations` | 인증된 운영 연결만 미가져온 상담 조회·연결 확인 가능 |
| 기존 비공개 스튜디오 | `appgprj_6af47411aaa88191a66aca03ea6a41ac` | `/business`에서 영업 내역, `/admin`에서 기존 주문·문의 관리 |

Next.js는 기존 `output: "export"`를 유지한다. `/display`는 정적 화면이며, 서버 저장은 저장소 루트의 `functions/` 아래 Cloudflare Pages Functions가 수행한다. 기존 스튜디오의 공개 범위, 생산 도면 다운로드 권한 및 기존 쇼핑몰의 다른 기능은 별도로 유지한다. 새 Pages 프로젝트나 새 도메인으로 대체할 필요가 없다.

## 실제 가동에 필요한 설정

| 위치 | 이름 | 값·용도 |
|---|---|---|
| 공개 Pages의 Production D1 binding | `INQUIRIES_DB` | 로그인 후 확인한 실제 D1 데이터베이스 연결 |
| 공개 Pages의 Production secret | `INQUIRY_OPERATOR_TOKEN` | 운영 API 인증용 무작위 비밀값. 공백 없는 32~512자로 준비 |
| 비공개 Sites 서버 secret | `MALL_INTAKE_TOKEN` | 위 `INQUIRY_OPERATOR_TOKEN`과 정확히 같은 값 |
| 비공개 Sites 서버 환경변수 | `MALL_INTAKE_ENABLED` | 양쪽 배포·연결 확인 후 문자열 `true`로 활성화 |
| 기존 GitHub Actions secrets | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | 기존 Production Pages Deploy 워크플로우에서 사용. 실제 등록·유효성 확인 필요 |

비밀값을 Git, `NEXT_PUBLIC_*`, 브라우저 JavaScript, 문서, 고객 메일 또는 작업 로그에 기록하지 않는다. 여기에는 실제 계정 ID·D1 ID·토큰을 넣지 않았다. Preview 환경을 연결한다면 별도의 테스트 데이터베이스와 토큰을 사용한다. Production 고객 데이터베이스를 Preview에 재사용하지 않는다.

### 기존 설정을 먼저 보존

Cloudflare에서 기존 계정과 `custombro-mall-order-v1` 프로젝트를 확인한다. 현재 커스텀 도메인, Production 배포 ID·소스 커밋, 환경변수 및 바인딩 이름을 기록한다. 현재 Wrangler 설정을 내려받으려면 인증된 상태에서 다음 공식 명령을 사용한다.

```bash
npx wrangler pages download config custombro-mall-order-v1
```

기존 Wrangler 파일이 있다면 먼저 보관하고, 내려받은 설정을 실제 Dashboard 값과 대조한다. 확인되지 않은 계정·데이터베이스 ID로 새 설정 파일을 작성하지 않는다. 기존 설정을 유지하면서 `INQUIRIES_DB`만 추가한다. Dashboard 설정 방식을 유지할지, 검토한 Wrangler 파일을 배포 기준으로 삼을지 정한 뒤 두 방식을 섞어 덮어쓰지 않는다. DNS 및 기존 도메인 연결을 변경할 필요는 없다.

### 데이터베이스 초기화

로그인 후 선택한 상담용 D1에 `migrations/0001_display_inquiries.sql`을 적용한다. 이 파일은 `display_inquiries`, `display_intake_limits` 테이블과 대기 조회 인덱스를 만든다. 기존 테이블을 삭제하지 않는다. 명령의 데이터베이스 이름은 반드시 Dashboard에서 확인한 실제 값으로 지정한다.

```bash
npx wrangler d1 execute <확인한_D1_이름> --remote --file=migrations/0001_display_inquiries.sql
```

위 꺾쇠 부분은 명령 예시용 자리표시자이며 그대로 실행하지 않는다. 적용 후 두 테이블 존재와 `INQUIRIES_DB` 바인딩 대상을 읽어서 확인한다. 새로운 비밀값·바인딩이 실제 배포 런타임에 반영되도록 해당 환경을 배포한다.

## 기존 배포 절차 유지

기준 파일은 `.github/workflows/production-pages.yml`과 `docs/APPROVAL_FIRST_DEPLOY_FLOW.md`이다.

1. 검토한 변경을 GitHub에 반영하고 배포할 전체 커밋 SHA를 기록한다.
2. 로컬에서 `npm run build`, `npx tsc --noEmit`을 통과시킨다. 상담 API 회귀 검사는 Node 22.13 이상에서 `node --experimental-strip-types --test tests/display-intake.test.mjs`로 실행한다. 기존 Actions의 Node 20.19 설정에서는 이 테스트 명령을 그대로 추가하지 않는다.
3. GitHub Actions의 **Production Pages Deploy → Run workflow**에서 확인한 커밋을 `ref`로 지정한다. `main`을 지정하면 실행 시점의 브랜치가 선택되므로 정확한 커밋이 더 명확하다.
4. 기존 `production` Environment에 보호 규칙이 있다면 그 승인 절차를 따른다. 워크플로우 트리거 변경이나 우회 배포로 승인 절차를 생략하지 않는다.
5. 워크플로우의 빌드·타입 검사·`wrangler pages deploy out` 결과를 확인한다. 정적 `out` 파일과 함께 루트 `functions/`가 배포되는지 확인한다. 정적 파일만 Dashboard에 끌어놓아 API가 빠진 배포를 만들지 않는다.
6. 비공개 스튜디오는 자체 Sites 배포 흐름으로 반영하며 현재 owner-private 권한을 유지한다. 공개몰 배포와 스튜디오 배포는 별개의 결과로 확인한다.

## 연결 방식과 처리 범위

비공개 스튜디오의 `mall_intake_connection`은 설정 준비 여부만 보여 준다. 실제 통신 성공이나 고객 답변 전달을 증명하지 않는다. `sync_mall_inquiries`는 고정된 공개몰 운영 API에서 최대 10건을 읽어 기존 비공개 영업·상담 큐에 저장한다.

저장에 성공한 건만 공개몰에 연결 확인을 남긴다. 네트워크가 끊겨 연결 확인이 실패해도 같은 공개 접수 ID를 재사용하므로 재실행으로 상담·주문을 중복 생성하지 않는다. 공개몰에서 가져온 내용은 **상담만 생성하며, 생산 주문이나 결제를 만들지 않는다.** 자동 가져오기는 도구가 존재하는 것만으로 실행되지 않으므로 기존 고객 문의 예약 작업의 실제 활성 상태와 실행 결과를 따로 확인해야 한다.

**외부 고객에게 답변을 보내는 경로는 아직 연결되지 않았다.** 비공개 스튜디오 대화에 저장한 답변은 공개몰 고객에게 자동 전달되지 않는다. 이메일 문의 버튼은 고객의 메일 앱을 열 뿐 메일을 자동 발송하지 않는다. 고객 이메일 또는 별도 고객 상담 화면을 연결하고 실제 전달을 확인하기 전에는 자동 고객 응대 완료라고 표시하지 않는다.

예상 제작비는 확정 견적·결제·매출이 아니다. 결제사 및 입금 확인 연결이 없으므로 결제 확인 매출은 미확인으로 둔다. 동일 디자인 반복 수량의 할인과 서로 다른 디자인 묶음 견적을 구분한다. 고객의 희망일 역시 확정 납기로 바꾸지 않는다.

## 한 번의 실제 연결 확인

합성 테스트 정보만 사용하고 운영 기록에는 `연결 확인용`임을 표시한다.

- [ ] `/display`가 기존 도메인에서 열리고 기존 홈·다른 메뉴도 동작한다.
- [ ] GET `/api/display-inquiries`가 `acceptingInquiries: true`를 반환한다. 이 응답에 연락처 등 고객 정보가 없다.
- [ ] 화면에서 테스트 상담을 제출하고 서버가 발급한 `CBI-…` 접수번호를 확인한다. 브라우저 임시저장·이메일 앱 열기를 서버 접수로 계산하지 않는다.
- [ ] 같은 접수 키·같은 내용의 재시도가 동일 접수번호를 반환하고, 같은 키의 다른 내용은 409로 거절된다.
- [ ] 운영 토큰 없이 `/api/display-operations`에 접근하면 401이며 상담 자료가 노출되지 않는다.
- [ ] 스튜디오 owner 계정에서 `mall_intake_connection` 준비 상태와 `sync_mall_inquiries`의 실제 `checked`, `acknowledged`, `failures` 결과를 확인한다.
- [ ] `/business`에 같은 상담이 한 번만 나타나며 기존 문의 내역과 연결된다. 생산 주문·결제 완료가 자동 생성되지 않는다.
- [ ] 다시 가져와도 중복 상담이 생기지 않고, 이미 연결된 건은 공개몰 대기 목록에서 제외된다.
- [ ] 일반 방문자는 영업 목록·생산 도면·다른 고객 자료를 읽을 수 없다.
- [ ] 외부 고객 답변, 결제 확인, 예약 작업은 각각 별도 실제 결과가 확인된 항목만 가동으로 기록한다.

## 중단·롤백

연결 이상 시 먼저 스튜디오의 `MALL_INTAKE_ENABLED`를 `false`로 설정해 가져오기를 중지한다. 이미 저장된 상담은 보존한다. 공개몰을 되돌려야 하면 배포 전에 기록한 **마지막 정상 Production 커밋**을 동일한 Production Pages Deploy 워크플로우의 `ref`로 지정하고 기존 승인 절차를 거친다. 현재 GitHub HEAD가 마지막 정상 운영 버전이라고 추정하지 않는다.

롤백 중에도 새 D1 테이블·상담 기록은 삭제하지 않는다. 새 상담을 계속 받을지 중단할지는 실제 접수 화면과 API 준비 상태를 함께 확인하여 결정한다. 코드 롤백은 데이터베이스 복원이나 고객 회신 발송을 의미하지 않는다.

## 근거

- [Cloudflare Pages Functions 설정 및 기존 설정 다운로드](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Cloudflare Pages Functions 바인딩](https://developers.cloudflare.com/pages/functions/bindings/)
- 저장소의 `next.config.ts`, `functions/api/display-inquiries.ts`, `functions/api/display-operations.ts`, `migrations/0001_display_inquiries.sql`
- 기존 `.github/workflows/production-pages.yml`, `.github/workflows/preview-pages.yml`, `docs/APPROVAL_FIRST_DEPLOY_FLOW.md`

