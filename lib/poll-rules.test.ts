import { describe, expect, it } from "vitest";
import { isClosed } from "./poll-rules";

const now = new Date("2026-10-01T12:00:00Z");

describe("마감 여부 판정", () => {
  it("마감이 없는 투표는 계속 진행 중이다", () => {
    expect(isClosed({ deadline: null }, now)).toBe(false);
  });
});
