# 01: 프로젝트 기반 준비

**What to build:** 이후 모든 티켓이 기댈 바닥을 깐다(먼저 하는 준비 작업). 개발자가 테스트를 돌리고, 개발용 Neon DB에 스키마를 적용하고, 한국어로 된 빈 앱 화면을 띄울 수 있게 한다.

- Vitest를 설정하고, DB·쿠키·Next.js에 의존하지 않는 순수 함수 모듈인 `투표 규칙` 모듈의 빈 틀과 첫 테스트를 만든다. 이 모듈이 앱의 유일한 테스트 경계다.
- ORM 없이 SQL을 직접 작성한다(ADR-0002). 번호를 붙인 SQL 마이그레이션 파일을 두고, 아직 적용하지 않은 파일만 실행하는 `npm run db:migrate` 스크립트를 만든다. 적용 이력은 DB 테이블에 기록한다.
- 초기 스키마를 만든다.
  - 투표: UUID ID, 질문, 마감(nullable `timestamptz`), 생성 시각
  - 선택지: 투표에 속하고 표시 순서를 가진다
  - 표: 투표, 선택지, 투표자 익명 ID, 생성 시각
  - (투표, 투표자 익명 ID)에 유일 제약을 건다(ADR-0001).
  - 투표를 삭제하면 선택지와 표도 함께 삭제되게 한다(cascade).
- `@neondatabase/serverless`의 `neon()`으로 DB 클라이언트를 만든다. 연결 문자열은 `DATABASE_URL`에서 읽는다.
- `create-next-app` 기본 페이지를 한국어(`lang="ko"`) 빈 레이아웃으로 바꾼다. 앱 제목만 둔다.
- 필요한 환경변수(`DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`)를 README에 적는다.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] `npm test`가 통과한다(`투표 규칙` 모듈의 첫 테스트 포함)
- [x] `npm run db:migrate`를 Neon `dev` 브랜치에 실행하면 스키마가 생긴다
- [x] `npm run db:migrate`를 두 번 실행해도 오류 없이 아무 일도 하지 않는다
- [x] 같은 투표자 익명 ID로 한 투표에 두 번째 표를 넣으면 DB가 거부한다
- [x] 투표 행을 삭제하면 그 투표의 선택지와 표도 사라진다
- [x] `npm run dev`로 띄운 첫 화면이 한국어 빈 레이아웃이다
- [x] `npm run build`와 `npm run lint`가 통과한다
