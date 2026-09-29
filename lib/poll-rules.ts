// 투표 규칙: DB·쿠키·Next.js에 의존하지 않는 순수 함수 모음. 앱의 유일한 테스트 경계다.
// 용어는 CONTEXT.md를 따른다.

export type PollTiming = { deadline: Date | null };

/** 투표 생성 제한. 글자 수는 코드 포인트 단위(DB의 char_length와 같음)이고, DB의 CHECK 제약과 맞춰야 한다. */
export const POLL_LIMITS = {
  questionMaxLength: 200,
  optionMaxLength: 100,
  minOptions: 2,
  maxOptions: 10,
} as const;

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
  const { questionMaxLength, optionMaxLength, minOptions, maxOptions } = POLL_LIMITS;

  if (question === "") errors.question = "질문을 입력해 주세요.";
  else if (charLength(question) > questionMaxLength)
    errors.question = `질문은 ${questionMaxLength}자 이하로 입력해 주세요.`;

  if (options.length < minOptions) errors.options = `선택지는 ${minOptions}개 이상이어야 합니다.`;
  else if (options.length > maxOptions) errors.options = `선택지는 ${maxOptions}개 이하여야 합니다.`;
  else if (options.some((o) => o === "")) errors.options = "빈 선택지가 있습니다.";
  else if (options.some((o) => charLength(o) > optionMaxLength))
    errors.options = `선택지는 ${optionMaxLength}자 이하로 입력해 주세요.`;
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

export type VoteRejection = "closed" | "already-voted" | "unknown-option";
export type VoteJudgement = { ok: true } | { ok: false; reason: VoteRejection };

/**
 * 표 제출 판정. 마감을 가장 먼저 본다.
 * "이미 투표함"은 1차 방어일 뿐이고, 동시에 들어온 요청은 DB 유일 제약이 막는다.
 */
export function judgeVote({
  poll,
  optionId,
  alreadyVoted,
  now,
}: {
  poll: PollTiming & { optionIds: string[] };
  optionId: string;
  alreadyVoted: boolean;
  now: Date;
}): VoteJudgement {
  if (isClosed(poll, now)) return { ok: false, reason: "closed" };
  if (alreadyVoted) return { ok: false, reason: "already-voted" };
  if (!poll.optionIds.includes(optionId)) return { ok: false, reason: "unknown-option" };
  return { ok: true };
}

export type Viewer = "operator" | "voter";

/** 결과 공개 여부 판정: 운영자는 언제나, 투표자는 표를 던진 뒤나 마감된 뒤에 본다. */
export function canSeeResult({
  viewer,
  hasVoted,
  closed,
}: {
  viewer: Viewer;
  hasVoted: boolean;
  closed: boolean;
}): boolean {
  return viewer === "operator" || hasVoted || closed;
}

export type OptionCount = { id: string; label: string; count: number };
export type OptionResult = OptionCount & { percent: number; mine: boolean };
export type PollResult = { total: number; options: OptionResult[] };

/** 결과 계산. 비율은 정수 %이고, 표가 있으면 합계가 정확히 100이 되도록 최대 나머지 방식으로 반올림한다. */
export function computeResult(counts: OptionCount[], myOptionId: string | null): PollResult {
  const total = counts.reduce((sum, o) => sum + o.count, 0);
  const percents = total === 0 ? counts.map(() => 0) : largestRemainderPercents(counts, total);
  return {
    total,
    options: counts.map((o, i) => ({ ...o, percent: percents[i], mine: o.id === myOptionId })),
  };
}

function largestRemainderPercents(counts: OptionCount[], total: number): number[] {
  const exact = counts.map((o) => (o.count * 100) / total);
  const percents = exact.map(Math.floor);
  let remaining = 100 - percents.reduce((sum, p) => sum + p, 0);
  // 나머지가 큰 순서, 같으면 앞 선택지부터 1%씩 더 준다.
  const order = exact
    .map((value, i) => ({ i, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.i - b.i);
  for (const { i } of order) {
    if (remaining <= 0) break;
    percents[i] += 1;
    remaining -= 1;
  }
  return percents;
}

/** 조기 마감 계산: 마감을 지금으로 앞당긴 새 마감. 이미 마감된 투표는 그대로 두어 연장하지 않는다. */
export function closeEarly(poll: PollTiming, now: Date): Date {
  return poll.deadline !== null && isClosed(poll, now) ? poll.deadline : now;
}
