# 형상 관리 및 컨벤션 규칙

- 작성일: 2026-09-18
- 적용 범위: 원안 10개 항목 중 7개 채택(D-006). 제외 항목과 사유는 본 문서 8절에 기록.

## 1. 이슈 관리
- 템플릿: `기능 개발`(배경/목표/체크리스트), `QA 버그`(재현 입력값/기대 결과/실제 결과) 2종만 운용
- 제목 형식: `[타입] 작업 내용 요약` (타입: feat, fix, qa, docs)
- 라벨: `type:feat`, `type:fix`, `type:qa`, `status:in-progress`, `status:review`
- 마일스톤: M1~M5 (`03-roadmap.md` 기준)

## 2. 브랜치 전략
- 방식: GitHub Flow (main 단일 기준 브랜치, Git Flow 미채택 — 1인 프로젝트 규모에서 develop/release 분기 불필요)
- 네이밍: `타입/#이슈번호-작업내용` (예: `feat/#3-account-extractor`)
- main 보호: main 직접 푸시 금지, PR 병합만 허용
- 브랜치 생명주기: 병합 즉시 삭제

## 3. 커밋 메시지 규칙
- 타입 Prefix: `feat`, `fix`, `refactor`, `test`, `docs`, `qa`
- 구조: 제목 한 줄 + 본문(선택, 변경 이유) + 꼬리말(이슈 링크)
- 이슈 링킹: 꼬리말에 `Closes #이슈번호`
- 분리 기준: UI 변경과 로직(정규식) 변경은 별도 커밋으로 분리

## 4. Pull Request 규칙
- 템플릿 항목: 작업 내용 요약 / 셀프 리뷰 체크리스트 / QA 정답률 스크린샷 또는 리포트 링크
- 셀프 리뷰 체크리스트: 유닛테스트 통과 여부, QA 스크립트 실행 여부, 콘솔 에러 없음 확인
- 병합 전략: Squash & Merge (커밋 이력 단순화)
- QA 리포트 연동: `qa/report/`의 최신 리포트 파일 경로를 PR 본문에 명시

## 5. 문서화 규칙
- README 목차: 아키텍처, 실행 방법, 테스트 실행 방법, 최신 정답률
- CHANGELOG: Keep a Changelog 형식 준용, 버전별 Added/Changed/Fixed 및 정답률 수치 기록

## 6. 자동화 파이프라인 (CI/CD)
- CI: PR 생성 시 GitHub Actions로 유닛테스트 자동 실행
- CD: main 병합 시 GitHub Pages 자동 배포
- QA 게이트: AI QA 스크립트는 초기 단계에서 로컬 수동 실행(API 비용 발생으로 인해 CI 자동 실행 미채택). 정답률 95% 미만 시 병합 보류

## 7. 환경 변수 및 보안
- `.gitignore`: `.env`, `node_modules`, `qa/cases-raw.json`(원본 생성 케이스에 개인정보 유사 패턴 포함 가능성 대비)
- API Key 관리: 로컬 `.env`로만 관리, 저장소에 커밋 금지. GitHub Secrets는 CI에서 QA 자동 실행을 도입하는 시점에 등록

## 8. 초기 단계 제외 항목 및 사유
| 항목 | 사유 | 재검토 시점 |
|------|------|-------------|
| 포맷터/린터(Prettier, ESLint) 세부 규칙 | 1인 프로젝트, 코드 스타일 충돌 당사자 없음 | 협업자 합류 시 |
| 프로젝트 보드(GitHub Projects) | 마일스톤 5개, 이슈 수 적어 칸반 보드 없이도 추적 가능 | 이슈 20개 이상 누적 시 |
| Git Hooks(Husky, Commitlint) | 본인 1인 작업으로 강제화 도구 없이도 컨벤션 준수 가능 | 커밋 규칙 위반 반복 발생 시 |
