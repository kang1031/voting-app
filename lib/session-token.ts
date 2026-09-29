import { createHmac, createHash, timingSafeEqual } from "node:crypto";

// 운영자 세션 토큰: "<만료 시각(ms)>.<HMAC 서명>". Next.js에 의존하지 않아 proxy와 서버 코드가 함께 쓴다.

export const SESSION_COOKIE = "operator_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET은 32자 이상이어야 합니다.");
  return value;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", secret()).update(`operator.${expiresAt}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // 길이가 달라도 비교 시간이 드러나지 않도록 해시끼리 비교한다.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function createSessionToken(now: Date): { token: string; expiresAt: Date } {
  const expiresAt = now.getTime() + SESSION_MAX_AGE_SECONDS * 1000;
  return { token: `${expiresAt}.${sign(expiresAt)}`, expiresAt: new Date(expiresAt) };
}

export function verifySessionToken(token: string | undefined, now: Date): boolean {
  if (!token) return false;
  const [rawExpiresAt, signature, ...rest] = token.split(".");
  const expiresAt = Number(rawExpiresAt);
  if (rest.length > 0 || !signature || !Number.isSafeInteger(expiresAt)) return false;
  if (expiresAt <= now.getTime()) return false;
  return safeEqual(signature, sign(expiresAt));
}

export function isOperatorPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD가 설정되지 않았습니다.");
  return safeEqual(input, expected);
}
