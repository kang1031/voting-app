// 투표 규칙: DB·쿠키·Next.js에 의존하지 않는 순수 함수 모음. 앱의 유일한 테스트 경계다.
// 용어는 CONTEXT.md를 따른다.

export type PollTiming = { deadline: Date | null };

export type PollInput = { question: string; options: string[]; deadline: Date | null };
export type PollInputErrors = { question?: string; options?: string; deadline?: string };
export type PollInputResult =
  | { ok: true; value: PollInput }
  | { ok: false; errors: PollInputErrors };

/** 투표 생성 입력 검증 */
export function validatePollInput(input: PollInput, now: Date): PollInputResult {
  const question = input.question.trim();
  const options = input.options.map((o) => o.trim());
  const errors: PollInputErrors = {};

  if (question === "") errors.question = "질문을 입력해 주세요.";
  else if (charLength(question) > 200) errors.question = "질문은 200자 이하로 입력해 주세요.";

  if (options.length < 2) errors.options = "선택지는 2개 이상이어야 합니다.";
  else if (options.length > 10) errors.options = "선택지는 10개 이하여야 합니다.";
  else if (options.some((o) => o === "")) errors.options = "빈 선택지가 있습니다.";
  else if (options.some((o) => charLength(o) > 100))
    errors.options = "선택지는 100자 이하로 입력해 주세요.";
  else if (new Set(options).size !== options.length)
    errors.options = "같은 선택지가 두 번 있습니다.";

  const { deadline } = input;
  if (deadline !== null && Number.isNaN(deadline.getTime()))
    errors.deadline = "마감 시각을 확인해 주세요.";
  else if (deadline !== null && isClosed({ deadline }, now))
    errors.deadline = "마감 시각은 현재 이후여야 합니다.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { question, options, deadline } };
}

// DB의 char_length와 같게 코드 포인트 단위로 센다.
function charLength(text: string): number {
  return [...text].length;
}

/** 마감 여부 판정: 마감이 없으면 계속 진행 중이고, 마감 시각이 되는 순간부터 마감됨이다. */
export function isClosed(poll: PollTiming, now: Date): boolean {
  return poll.deadline !== null && poll.deadline.getTime() <= now.getTime();
}
