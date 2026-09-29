# ORM 없이 Neon 서버리스 드라이버로 SQL을 직접 작성한다

DB 접근은 `@neondatabase/serverless`(`neon()` HTTP 방식, 파라미터 바인딩은 태그드 템플릿)로 직접 작성한 SQL을 사용한다. 스키마 변경은 `db/migrations/` 아래에 번호를 붙인 `.sql` 파일로 두고, 작은 `npm run db:migrate` 스크립트로 적용한다. 스키마가 작아서(polls, options, votes) ORM은 의존성과 코드 생성·마이그레이션 도구만 늘릴 뿐 그만한 값을 하지 못하고, SQL을 직접 쓰면 모든 쿼리가 그대로 보인다.

## 검토한 대안

- **Drizzle ORM**: 가장 가벼운 타입 지원 선택지였지만, 테이블 3개짜리 스키마에 계층을 하나 더 두지 않으려고 제외.
- **Prisma**: 서버리스(Vercel) 환경에서 설정이 무거워 제외.

## 결과

마이그레이션 스크립트만은 여러 SQL 문을 한 트랜잭션으로 실행해야 해서 같은 패키지의 `Pool`(WebSocket)을 쓴다. 앱 코드는 `neon()` HTTP만 쓴다.

행(row) 타입은 TypeScript로 직접 선언하고 마이그레이션과 맞춰 유지해야 한다. 이 ADR을 다시 검토하지 않은 채 ORM을 도입해 "고치지" 않는다.
