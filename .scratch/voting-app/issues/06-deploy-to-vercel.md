# 06: Vercel 배포

**What to build:** 투표 앱을 Vercel에 배포해, 운영 URL에서 운영자와 투표자가 전체 흐름을 쓸 수 있게 한다. Vercel과 Neon 계정에서 해야 하는 작업이라 사람이 맡는다.

- 저장소를 Vercel 프로젝트에 연결한다(git remote가 필요하면 먼저 추가한다).
- Neon `main` 브랜치를 운영 DB로 쓰고, 그 연결 문자열로 `npm run db:migrate`를 실행한다.
- Vercel 운영 환경변수를 등록한다: `DATABASE_URL`(Neon `main` 브랜치), `ADMIN_PASSWORD`(충분히 긴 값), `SESSION_SECRET`(무작위 값).
- 운영 URL에서 전체 흐름을 시연한다: 로그인 → 투표 만들기 → 다른 브라우저로 투표하고 결과 보기 → 조기 마감 → 삭제.

**Blocked by:** 05 (운영자가 결과를 보고, 조기 마감하고, 삭제한다)

**Status:** ready-for-human

- [ ] 운영 URL에서 첫 화면이 열린다
- [ ] 운영 DB에 모든 마이그레이션이 적용되어 있다
- [ ] 운영 URL에서 위 시연 흐름이 끝까지 동작한다
- [ ] 개발용(`dev`) DB와 운영용(`main`) DB의 데이터가 섞이지 않는다
