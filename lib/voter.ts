import "server-only";
import { cookies } from "next/headers";
import { BASE_COOKIE_OPTIONS } from "./cookie-options";
import { isUuid } from "./uuid";

// 투표자 익명 ID(ADR-0001). 처음 표를 던질 때만 발급한다.
const VOTER_COOKIE = "voter_id";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export async function getVoterId(): Promise<string | null> {
  const value = (await cookies()).get(VOTER_COOKIE)?.value;
  return value && isUuid(value) ? value : null;
}

/** 서버 액션에서만 호출한다(쿠키는 렌더링 중에 설정할 수 없다). issued는 이번에 새로 발급했는지 여부. */
export async function getOrIssueVoterId(): Promise<{ id: string; issued: boolean }> {
  const existing = await getVoterId();
  if (existing) return { id: existing, issued: false };
  const id = crypto.randomUUID();
  (await cookies()).set(VOTER_COOKIE, id, { ...BASE_COOKIE_OPTIONS, maxAge: ONE_YEAR_SECONDS });
  return { id, issued: true };
}

/** 표가 저장되지 않았는데 방금 발급한 쿠키를 거둬들인다. */
export async function withdrawVoterId(): Promise<void> {
  (await cookies()).delete(VOTER_COOKIE);
}
