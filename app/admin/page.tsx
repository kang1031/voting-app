import type { Metadata } from "next";
import { requireOperator } from "@/lib/operator";
import { logout } from "./auth-actions";
import { CreatePollForm } from "./create-poll-form";

export const metadata: Metadata = { title: "운영자 화면 · 투표 앱" };

export default async function AdminPage() {
  await requireOperator();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">운영자 화면</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-slate-500 underline">
            로그아웃
          </button>
        </form>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-bold">새 투표 만들기</h2>
        <CreatePollForm />
      </section>
    </div>
  );
}
