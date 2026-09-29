"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** 시각을 보는 사람의 브라우저 시간대로 보여준다. 서버 렌더링 중에는 UTC로 표시했다가 하이드레이션 뒤 바꾼다. */
export function LocalTime({ iso }: { iso: string }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const date = new Date(iso);
  const text = isClient
    ? date.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })
    : date.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) +
      " (UTC)";
  return <time dateTime={iso}>{text}</time>;
}
