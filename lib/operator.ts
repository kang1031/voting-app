import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session-token";

export async function isOperator(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, new Date());
}

/** 운영자 화면과 모든 운영자 서버 액션의 진짜 인증 검사. proxy는 낙관적 검사만 한다. */
export async function requireOperator(): Promise<void> {
  if (!(await isOperator())) redirect("/admin/login");
}
