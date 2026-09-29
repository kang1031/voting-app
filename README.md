# 투표 앱

운영자가 투표를 올리면 사람들이 선택지 하나를 골라 투표하고 결과를 보는 간단한 웹앱입니다. Next.js 16, Tailwind v4, Neon Postgres를 쓰고 Vercel에 배포합니다.

- 용어: [CONTEXT.md](CONTEXT.md)
- 결정 기록: [docs/adr/](docs/adr/)

## 환경변수

`.env.local`(로컬)과 Vercel 프로젝트 설정(운영)에 다음 값을 둡니다.

| 이름 | 설명 |
|---|---|
| `DATABASE_URL` | Neon 연결 문자열. 로컬은 `dev` 브랜치, 운영은 `main` 브랜치 |
| `ADMIN_PASSWORD` | 운영자 로그인 비밀번호. 충분히 길게 |
| `SESSION_SECRET` | 운영자 세션 쿠키 서명용 무작위 값(32자 이상) |

## 명령어

```bash
npm install
npm run db:migrate   # 아직 적용하지 않은 db/migrations/*.sql 적용
npm run dev          # http://localhost:3000
npm test             # 투표 규칙 단위 테스트
npm run typecheck
npm run lint
```

새 스키마 변경은 `db/migrations/`에 다음 번호의 `.sql` 파일로 추가합니다. 이미 적용한 파일은 수정하지 않습니다.
