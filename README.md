# 비정형 텍스트 패턴 추출기

서버 비용 없이 브라우저에서 정규식·문자열 알고리즘만으로 계좌번호, 해시태그, 자연어 날짜를 추출/변환하는 정적 웹 유틸리티.

**배포**: https://jiyeongxxxkim.github.io/text-pattern-extractor/

## 아키텍처

```
src/lib/   순수 함수 (extractAccount, generateHashtags, parseDate) — UI와 분리
index.html UI. 위 함수를 ES 모듈로 직접 import, 빌드 단계 없음
qa/        AI 기반 엣지케이스 QA 파이프라인 (개발 단계 도구, 런타임에는 미포함)
docs/      기획·설계·의사결정 기록
```

자세한 설계 배경은 `docs/04-architecture.md`, 의사결정 이력은 `docs/00-decision-log.md` 참조.

## 사용 기술

- Vanilla JavaScript (ES Modules) — 프레임워크·번들러 없음
- Vitest — 유닛테스트
- Claude Code 서브에이전트 — AI 기반 QA 케이스 생성/채점(개발 도구로만 사용, 서비스 런타임에는 AI 미연동)

## 실행 방법

```bash
npm install
npx serve .   # 또는 python3 -m http.server 등 정적 서버. file:// 프로토콜은 ES 모듈 CORS 제약으로 동작하지 않음
```

## 테스트 실행

```bash
npm test               # 유닛테스트 27건
node qa/run-qa.mjs      # 사전 생성된 qa/cases/*.json 기반 QA 재검증 (계좌·날짜는 결정적 채점)
```

## 최신 QA 결과 (2026-09-18 기준, `qa/report/2026-09-18.json`)

| 카테고리 | 정답률 | 비고 |
|---|---|---|
| 계좌번호 | 97.06% (33/34) | 결정적 채점 |
| 날짜 | 100% (33/33) | 결정적 채점 |
| 해시태그 | 60~73% | AI 채점, 재실행마다 변동(D-011) |

## 주요 엣지케이스 방어 로직

- **계좌번호**: 은행명 한 글자 오타를 편집거리 1 이내로 보정(궁민은행→국민은행). 휴대폰번호(010-11자리), 9자리 이하 숫자는 계좌번호로 오인하지 않음.
- **전화번호**: 한국 전화번호 국번(010/011/016~019/070/02/03X~06X)은 법정 고정 목록이라 오탈자 걱정 없이 prefix+총 자릿수만으로 계좌번호 등 다른 숫자와 AI 없이 구분. 마침표/공백/하이픈 구분자 모두 지원.
- **날짜**: 상대일(내일/모레/내일모레 등), "이번 주/다음 주/다다음 주 + 요일", 오전·오후·저녁·밤 시간 표현 지원. 이번 주의 지난 요일도 정상 계산.
- **해시태그**: 조사 제거 + 술어(동사/형용사) 활용형 제외로 명사 위주 추출. 단, 형태소 분석기 없이는 풀 수 없는 구조적 한계가 있음 — 자세한 내용은 `docs/00-decision-log.md` D-010 참조.

## 알려진 한계

- 계좌: "예전 계좌 X 말고 새 계좌 Y" 같은 부정 표현 미지원(D-009)
- 날짜: "금요일에 봐요"처럼 이번/다음/다다음 없이 단독으로 쓰인 요일 표현 미지원
- 해시태그: 띄어쓰기 없는 동사구("영화보고"), 조사와 동음인 명사 어미("고양이"→"고양") 등은 사전·형태소 분석 없이는 해결 불가(D-010)

## 실사용자 피드백 반영 (M6)

배포 후 실제 사용자(인스타 공구 운영자) 테스트 피드백 5건을 반영했다. 전체 내용은 `docs/06-user-feedback.md` 참조.

## 문서

- [`docs/00-decision-log.md`](docs/00-decision-log.md) — 의사결정 기록
- [`docs/01-project-charter.md`](docs/01-project-charter.md) — 프로젝트 헌장
- [`docs/02-conventions.md`](docs/02-conventions.md) — 형상 관리 컨벤션
- [`docs/03-roadmap.md`](docs/03-roadmap.md) — 마일스톤 및 실행 결과
- [`docs/04-architecture.md`](docs/04-architecture.md) — 아키텍처 설계
- [`docs/05-test-plan.md`](docs/05-test-plan.md) — 테스트 계획
