# CB_MALL_ONEFILE_HANDOFF

## 0. 기준선
- Branch: main
- LOCAL_HEAD: b1d75b9381b5298595e21eec076eddbe300842e3
- ORIGIN_HEAD: b1d75b9381b5298595e21eec076eddbe300842e3
- Ahead / Behind: 0 / 0
- Generated At: 2026-03-21 14:58:39
- Repo: C:\Users\hjk86\mall_front\next-app

## 1. 이번 작업에서 완료한 핵심
- split IA 기준으로 홈 / 모드선택 / 작업대 / 운영공간 / 판매공간 텍스트 구조 보강 완료
- /qa 라우트 추가 및 QA 가이드 강화 완료
- RouteDock 기반 전체 동선 정리 완료
- materials-room / parts-room / storage copy 보강 완료
- option-store / seller / b2b / clearance copy 보강 완료
- home / mode-select / workbench/keyring copy 보강 완료
- build PASS
- tsc PASS
- GitHub main push 완료

## 2. 현재 라우트 상태
- /                     : 홈 허브 카피 보강 완료
- /mode-select          : 제작 / 운영 / 판매 분기 카피 보강 완료
- /workbench/keyring    : 본체 결정 → 파츠 조합 → 생산 판단 카피 보강 완료
- /materials-room       : 금속 랙 / 판재 / usable stock 기준 카피 보강 완료
- /parts-room           : 링 / 체인 / 포장 / 조합 판정 카피 보강 완료
- /storage              : 제작 완료 → 보관 → 재호출 / 리오더 흐름 카피 보강 완료
- /option-store         : 결합 / 포장 / 후가공 옵션 분리 카피 보강 완료
- /seller               : 셀러 운영 / 정산 / 리오더 허브 카피 보강 완료
- /b2b                  : 수량 / 납기 / 자재 우선 판정 카피 보강 완료
- /clearance            : 소진 허브 카피 보강 완료
- /qa                   : split IA QA 체크리스트 강화 완료

## 3. 핵심 설계 원칙
- GitHub-first: 원격 main이 단일 원본
- 로컬은 실행 / 검증 / 작업 사본
- 홈은 소개 페이지가 아니라 진입 허브
- 모드 선택은 실제 행동 분기 허브
- 작업대는 상품소개가 아니라 조합 판단 허브
- 원자재실은 밝은 소품방이 아니라 금속 랙 기반 판재 존
- 부자재실은 고리 / 체인 / 포장 파츠를 기능별로 분리
- 보관함은 창고가 아니라 recall / reorder 허브
- 판매 영역은 option / seller / b2b / clearance 역할이 문구 단계에서 분리되어야 함

## 4. 다음 채팅방 시작 절차
1. CB_MALL_MASTER_OPERATING_STANDARD_PERMANENT.md 먼저 읽기
2. CB_MALL_PROGRESS_SNAPSHOT_LATEST.md 읽기
3. 이 파일 읽기
4. git fetch --all --prune
5. 현재 branch 확인
6. LOCAL_HEAD / ORIGIN_HEAD / ahead-behind / git status 확인
7. snapshot 기준선과 실제 repo 상태 대조
8. 그 기준선에서 바로 이어서 코드작업
- 충돌 시 CONFLICT로 멈추고 이유만 짧게 출력
- 로컬 제로베이스 재시작 금지
- 이미 구현된 것 다시 만들기 금지
- build / tsc 검증 없이 완료 선언 금지

## 5. 바로 다음 우선순위
1. 실제 화면 최종 QA
2. 실제 화면에서 어색한 페이지가 있으면 그 페이지만 미세 문구 패치
3. 패치 후 build / tsc / commit / push
4. 작업 종료 시 handoff / snapshot 다시 갱신

## 6. 최근 커밋
b1d75b9 docs(cb-mall): update latest progress snapshot after split ia final
ab1a236 feat(cb-mall): finalize split ia route dock and qa guide
6bbea21 docs(cb-mall): update latest progress snapshot after hub copy
313b1a6 feat(cb-mall): strengthen hub and workbench copy structure
f923e3f docs(cb-mall): update latest progress snapshot after sales copy
87f2b83 feat(cb-mall): strengthen sales route copy structure
6b744b2 docs(cb-mall): update latest progress snapshot after room copy
9a8e909 feat(cb-mall): strengthen room copy structure

## 7. 최신 snapshot 원문
# CB_MALL_PROGRESS_SNAPSHOT_LATEST

- Branch: main
- LOCAL_HEAD: ab1a2360e49931f7ea71c594c495eb7f72834acb
- ORIGIN_HEAD: ab1a2360e49931f7ea71c594c495eb7f72834acb
- Ahead / Behind: 0 / 0
- Snapshot Time: 2026-03-21 14:53:25
- Last Commit: feat(cb-mall): finalize split ia route dock and qa guide
- Updated Files:
  1. app/_components/RouteDock.tsx
  2. app/qa/page.tsx
- Build: PASS
- TSC: PASS
- Current Route Status:
  1. /qa 강화 완료
  2. RouteDock split IA 전체 동선 정리 완료
  3. /materials-room copy 보강 완료
  4. /parts-room copy 보강 완료
  5. /storage copy 보강 완료
  6. /option-store copy 보강 완료
  7. /seller copy 보강 완료
  8. /b2b copy 보강 완료
  9. /clearance copy 보강 완료
  10. / home hub copy 보강 완료
  11. /mode-select copy 보강 완료
  12. /workbench/keyring copy 보강 완료
- Next Priority:
  1. 실제 화면 최종 QA
  2. 작업 마무리용 onefile handoff 갱신
  3. 필요 시 미세 문구 패치 후 build / tsc / commit / push