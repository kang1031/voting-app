import { describe, expect, it } from "vitest";
import { isClosed, validatePollInput } from "./poll-rules";

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
