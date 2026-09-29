import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// ORM 없이 SQL을 직접 쓴다(ADR-0002). 태그드 템플릿이 파라미터를 바인딩한다.
let client: NeonQueryFunction<false, false> | undefined;

export function db(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
    client = neon(url);
  }
  return client;
}
