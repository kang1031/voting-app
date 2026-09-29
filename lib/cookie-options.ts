/** 운영자 세션과 투표자 쿠키가 함께 쓰는 설정. 스크립트에서 읽을 수 없고, 운영 환경에서는 HTTPS로만 보낸다. */
export const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;
