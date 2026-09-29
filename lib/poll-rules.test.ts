import { describe, expect, it } from "vitest";
import { canSeeResult, computeResult, isClosed, judgeVote, validatePollInput } from "./poll-rules";

const now = new Date("2026-10-01T12:00:00Z");
const later = new Date("2026-10-02T12:00:00Z");
const earlier = new Date("2026-09-30T12:00:00Z");

describe("마감 여부 판정", () => {
  it("마감이 없는 투표는 계속 진행 중이다", () => {
    expect(isClosed({ deadline: null }, now)).toBe(false);
  });

  it("마감 시각 전에는 진행 중이다", () => {
    expect(isClosed({ deadline: later }, now)).toBe(false);
  });

  it("마감 시각이 되는 순간부터 마감됨이다", () => {
    expect(isClosed({ deadline: now }, now)).toBe(true);
    expect(isClosed({ deadline: earlier }, now)).toBe(true);
  });
});

describe("투표 생성 입력 검증", () => {
  it("앞뒤 공백을 잘라낸 입력을 돌려준다", () => {
    const result = validatePollInput(
      { question: "  점심 뭐 먹지?  ", options: [" 김밥 ", "라면"], deadline: null },
      now,
    );
    expect(result).toEqual({
      ok: true,
      value: { question: "점심 뭐 먹지?", options: ["김밥", "라면"], deadline: null },
    });
  });

  const valid = { question: "질문", options: ["가", "나"], deadline: null };

  it("질문은 공백을 잘라낸 뒤 1~200자여야 한다", () => {
    expect(validatePollInput({ ...valid, question: "   " }, now)).toEqual({
      ok: false,
      errors: { question: "질문을 입력해 주세요." },
    });
    expect(validatePollInput({ ...valid, question: "가".repeat(201) }, now)).toEqual({
      ok: false,
      errors: { question: "질문은 200자 이하로 입력해 주세요." },
    });
    expect(validatePollInput({ ...valid, question: "가".repeat(200) }, now).ok).toBe(true);
  });

  const optionsError = (options: string[]) => {
    const result = validatePollInput({ ...valid, options }, now);
    return result.ok ? undefined : result.errors.options;
  };

  it("선택지는 2~10개여야 한다", () => {
    expect(optionsError(["하나"])).toBe("선택지는 2개 이상이어야 합니다.");
    expect(optionsError(Array.from({ length: 11 }, (_, i) => `${i}`))).toBe(
      "선택지는 10개 이하여야 합니다.",
    );
    expect(optionsError(["1", "2"])).toBeUndefined();
    expect(optionsError(Array.from({ length: 10 }, (_, i) => `${i}`))).toBeUndefined();
  });

  it("선택지는 공백을 잘라낸 뒤 1~100자여야 한다", () => {
    expect(optionsError(["가", "  "])).toBe("빈 선택지가 있습니다.");
    expect(optionsError(["가", "나".repeat(101)])).toBe("선택지는 100자 이하로 입력해 주세요.");
    expect(optionsError(["가", "나".repeat(100)])).toBeUndefined();
  });

  it("공백을 잘라낸 문구가 같은 선택지는 허용하지 않는다", () => {
    expect(optionsError(["김밥", " 김밥 "])).toBe("같은 선택지가 두 번 있습니다.");
  });

  const deadlineError = (deadline: Date | null) => {
    const result = validatePollInput({ ...valid, deadline }, now);
    return result.ok ? undefined : result.errors.deadline;
  };

  it("마감은 비워두거나 현재보다 뒤여야 한다", () => {
    expect(deadlineError(null)).toBeUndefined();
    expect(deadlineError(later)).toBeUndefined();
    expect(deadlineError(now)).toBe("마감 시각은 현재 이후여야 합니다.");
    expect(deadlineError(earlier)).toBe("마감 시각은 현재 이후여야 합니다.");
  });

  it("해석할 수 없는 마감 시각은 거부한다", () => {
    expect(deadlineError(new Date("not a date"))).toBe("마감 시각을 확인해 주세요.");
  });

  it("여러 필드가 틀리면 필드별 오류를 모두 돌려준다", () => {
    expect(validatePollInput({ question: "", options: ["가"], deadline: earlier }, now)).toEqual({
      ok: false,
      errors: {
        question: "질문을 입력해 주세요.",
        options: "선택지는 2개 이상이어야 합니다.",
        deadline: "마감 시각은 현재 이후여야 합니다.",
      },
    });
  });
});

describe("표 제출 판정", () => {
  const poll = { deadline: later, optionIds: ["a", "b"] };

  it("진행 중인 투표에서 처음 고른 그 투표의 선택지는 허용한다", () => {
    expect(judgeVote({ poll, optionId: "a", alreadyVoted: false, now })).toEqual({ ok: true });
  });

  it("마감된 투표에는 표를 받지 않는다. 마감 시각과 같은 순간도 마감이다", () => {
    const closed = { ...poll, deadline: now };
    expect(judgeVote({ poll: closed, optionId: "a", alreadyVoted: false, now })).toEqual({
      ok: false,
      reason: "closed",
    });
  });

  it("이미 표를 던진 투표자는 다시 던질 수 없다", () => {
    expect(judgeVote({ poll, optionId: "b", alreadyVoted: true, now })).toEqual({
      ok: false,
      reason: "already-voted",
    });
  });

  it("그 투표의 선택지가 아니면 거부한다", () => {
    expect(judgeVote({ poll, optionId: "z", alreadyVoted: false, now })).toEqual({
      ok: false,
      reason: "unknown-option",
    });
  });

  it("마감이 이미 투표함보다 먼저 판정된다", () => {
    const closed = { ...poll, deadline: earlier };
    expect(judgeVote({ poll: closed, optionId: "a", alreadyVoted: true, now })).toEqual({
      ok: false,
      reason: "closed",
    });
  });
});

describe("결과 공개 여부 판정", () => {
  it("투표자는 진행 중인 투표에 표를 던지기 전에는 결과를 볼 수 없다", () => {
    expect(canSeeResult({ viewer: "voter", hasVoted: false, closed: false })).toBe(false);
  });
});

describe("결과 공개 여부 판정: 공개되는 경우", () => {
  it("투표자는 표를 던진 뒤에 결과를 본다", () => {
    expect(canSeeResult({ viewer: "voter", hasVoted: true, closed: false })).toBe(true);
  });

  it("마감된 투표는 표를 던지지 않은 투표자도 결과를 본다", () => {
    expect(canSeeResult({ viewer: "voter", hasVoted: false, closed: true })).toBe(true);
  });

  it("운영자는 언제나 결과를 본다", () => {
    expect(canSeeResult({ viewer: "operator", hasVoted: false, closed: false })).toBe(true);
  });
});

describe("결과 계산", () => {
  it("선택지별 표 수, 비율, 내가 고른 선택지, 총 표 수를 돌려준다", () => {
    const result = computeResult(
      [
        { id: "a", label: "김밥", count: 3 },
        { id: "b", label: "라면", count: 1 },
      ],
      "b",
    );
    expect(result).toEqual({
      total: 4,
      options: [
        { id: "a", label: "김밥", count: 3, percent: 75, mine: false },
        { id: "b", label: "라면", count: 1, percent: 25, mine: true },
      ],
    });
  });
});

describe("결과 계산: 경계", () => {
  it("표가 하나도 없으면 모든 비율이 0%다", () => {
    const result = computeResult(
      [
        { id: "a", label: "가", count: 0 },
        { id: "b", label: "나", count: 0 },
      ],
      null,
    );
    expect(result.total).toBe(0);
    expect(result.options.map((o) => o.percent)).toEqual([0, 0]);
  });

  it("비율 합계가 100%가 되도록 반올림한다", () => {
    const result = computeResult(
      [
        { id: "a", label: "가", count: 1 },
        { id: "b", label: "나", count: 1 },
        { id: "c", label: "다", count: 1 },
      ],
      null,
    );
    expect(result.options.map((o) => o.percent)).toEqual([34, 33, 33]);
  });

  it("한 선택지에만 표가 있으면 그 선택지가 100%다", () => {
    const result = computeResult(
      [
        { id: "a", label: "가", count: 0 },
        { id: "b", label: "나", count: 5 },
      ],
      "b",
    );
    expect(result.options.map((o) => o.percent)).toEqual([0, 100]);
  });
});
