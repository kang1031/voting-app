# 이슈 트래커: 로컬 마크다운

이 저장소의 이슈와 스펙은 `.scratch/` 아래의 마크다운 파일로 관리한다.

## 규칙

- 기능 하나당 디렉터리 하나: `.scratch/<feature-slug>/`
- 스펙은 `.scratch/<feature-slug>/spec.md`
- 구현 이슈는 티켓 하나당 파일 하나로 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`에 둔다. 번호는 `01`부터 시작하며, 여러 티켓을 한 파일에 합치지 않는다.
- 트리아지 상태는 각 이슈 파일 상단 근처의 `Status:` 줄에 기록한다(역할 문자열은 `triage-labels.md` 참고).
- 댓글과 대화 기록은 파일 맨 아래 `## Comments` 제목 아래에 이어 붙인다.

## 스킬이 "이슈 트래커에 게시하라"고 할 때

`.scratch/<feature-slug>/` 아래에 새 파일을 만든다(디렉터리가 없으면 만든다).

## 스킬이 "관련 티켓을 가져오라"고 할 때

참조된 경로의 파일을 읽는다. 보통 사용자가 경로나 이슈 번호를 직접 알려준다.

## 웨이파인딩 작업

`/wayfinder`가 사용한다. **맵(map)**은 파일 하나이고, 티켓마다 **자식(child)** 파일이 하나씩 있다.

- **맵**: `.scratch/<effort>/map.md` (Notes / Decisions-so-far / Fog 본문).
- **자식 티켓**: `.scratch/<effort>/issues/NN-<slug>.md`. 번호는 `01`부터 시작하고 본문에 질문을 적는다. `Type:` 줄에 티켓 종류(`research`/`prototype`/`grilling`/`task`)를, `Status:` 줄에 `claimed`/`resolved`를 기록한다.
- **차단 관계**: 상단 근처의 `Blocked by: NN, NN` 줄. 나열된 파일이 모두 `resolved`가 되면 차단이 풀린다.
- **프런티어**: `.scratch/<effort>/issues/`에서 열려 있고, 차단되지 않았고, 아무도 맡지 않은 파일을 찾는다. 번호가 가장 작은 것이 우선이다.
- **맡기(claim)**: 작업을 시작하기 전에 `Status: claimed`로 바꾸고 저장한다.
- **해결(resolve)**: `## Answer` 제목 아래에 답을 붙이고 `Status: resolved`로 바꾼 뒤, 맵 `map.md`의 Decisions-so-far에 요지와 링크를 추가한다.
