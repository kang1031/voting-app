import "server-only";
import { cookies } from "next/headers";

// 투표자 익명 ID(ADR-0001). 처음 표를 던질 때만 발급한다.
const VOTER_COOKIE = "voter_id";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getVoterId(): Promise<string | null> {
  const value = (await cookies()).get(VOTER_COOKIE)?.value;
  return value && UUID.test(value) ? value : null;
}

/** 서버 액션에서만 호출한다(쿠키는 렌더링 중에 설정할 수 없다). */
export async function getOrIssueVoterId(): Promise<string> {
  const existing = await getVoterId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  (await cookies()).set(VOTER_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  return id;
}
