// 투표 규칙: DB·쿠키·Next.js에 의존하지 않는 순수 함수 모음. 앱의 유일한 테스트 경계다.
// 용어는 CONTEXT.md를 따른다.

export type PollTiming = { deadline: Date | null };

/** 마감 여부 판정: 마감이 없으면 계속 진행 중이고, 마감 시각이 되는 순간부터 마감됨이다. */
export function isClosed(poll: PollTiming, now: Date): boolean {
  return poll.deadline !== null && poll.deadline.getTime() <= now.getTime();
}
