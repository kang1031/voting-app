import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session-token";

// 낙관적 검사: 로그인하지 않은 사람을 운영자 화면에서 로그인 화면으로 보낸다.
// 실제 권한 검사는 각 페이지와 서버 액션의 requireOperator()가 한다.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token, new Date())) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
