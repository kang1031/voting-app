import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-xl font-bold">투표를 찾을 수 없습니다</h1>
      <p className="text-slate-500">삭제되었거나 잘못된 주소입니다.</p>
      <Link href="/" className="underline">
        목록으로
      </Link>
    </div>
  );
}
