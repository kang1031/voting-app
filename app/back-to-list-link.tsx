import Link from "next/link";

/** 메인 화면(투표 목록)으로 돌아가는 버튼 */
export function BackToListLink() {
  return (
    <Link
      href="/"
      className="self-start rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      ← 목록으로
    </Link>
  );
}
