# Approval-first deploy flow

이 저장소는 로컬 PowerShell 복붙 대신 **승인형 온라인 흐름**으로 옮기기 위한 기본 파일을 포함합니다.

## 들어간 것

- `.github/workflows/preview-pages.yml`
  - Pull Request가 열리거나 갱신될 때 자동 실행
  - `npm ci -> npm run build -> npx tsc --noEmit -> Cloudflare Pages preview deploy`
- `.github/workflows/production-pages.yml`
  - GitHub Actions의 **Run workflow** 버튼으로만 실행
  - `ref`를 지정해 원하는 커밋/브랜치를 배포 가능
  - `environment: production` 으로 설정되어 있어 GitHub Environment 보호 규칙을 켜면 승인 후 실행 가능

## 딱 한 번 수동으로 해야 하는 것

### 1) GitHub Secrets 등록

Repository Settings -> Secrets and variables -> Actions -> New repository secret

다음 2개를 넣어야 합니다.

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 2) production 환경 승인 켜기

Repository Settings -> Environments -> New environment -> `production`

권장 설정:

- Required reviewers: 본인 계정
- Prevent self-review: 필요 시 선택

이렇게 하면 `Production Pages Deploy`를 눌렀을 때 **승인 버튼 1회** 후 실행됩니다.

## 실제 운영 흐름

### 미리보기
1. 브랜치 작업
2. PR 생성
3. `Preview Pages Deploy` 자동 실행
4. preview URL 확인

### 운영 반영
1. main 반영 또는 배포할 ref 준비
2. Actions -> `Production Pages Deploy`
3. `Run workflow` 클릭
4. production 환경 승인
5. 배포 완료

## 장점

- 로컬 PowerShell 복붙 최소화
- 확인 후 배포 흐름으로 전환 가능
- 특정 ref를 바로 운영 배포 가능
- build / typecheck를 배포 전에 고정적으로 통과시킴

## 현재 남은 것

이 문서와 워크플로우 파일만으로는 **시크릿 등록과 environment 승인 규칙 설정**까지는 자동으로 못 합니다.
그 2개만 수동으로 완료하면, 이후에는 확인 기반 운영 흐름으로 갈 수 있습니다.
