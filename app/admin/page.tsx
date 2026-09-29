import type { Metadata } from "next";
import Link from "next/link";
import { requireOperator } from "@/lib/operator";
import { canSeeResult, computeResult, isClosed } from "@/lib/poll-rules";
import { getAllOptionCounts, listPolls, type PollSummary } from "@/lib/polls";
import { LocalTime } from "@/app/local-time";
import { ResultView } from "@/app/result-view";
import { logout } from "./auth-actions";
import { ConfirmButton } from "./confirm-button";
import { CreatePollForm } from "./create-poll-form";
import { closePollEarlyAction, deletePollAction } from "./poll-actions";

export const metadata: Metadata = { title: "운영자 화면 · 투표 앱" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireOperator();

  const now = new Date();
  const [polls, counts] = await Promise.all([listPolls(), getAllOptionCounts()]);
  const open = polls.filter((p) => !isClosed(p, now));
  const closed = polls.filter((p) => isClosed(p, now));
  const section = (title: string, list: PollSummary[], isOpen: boolean) => (
    <section>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {list.map((poll) => (
            <AdminPollCard key={poll.id} poll={poll} counts={counts.get(poll.id) ?? []} isOpen={isOpen} />
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="flex flex-col gap-8">
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
      {section("진행 중", open, true)}
      {section("마감됨", closed, false)}
    </div>
  );
}

function AdminPollCard({
  poll,
  counts,
  isOpen,
}: {
  poll: PollSummary;
  counts: Parameters<typeof computeResult>[0];
  isOpen: boolean;
}) {
  const showResult = canSeeResult({ viewer: "operator", hasVoted: false, closed: !isOpen });
  const buttonClass = "rounded-md border px-3 py-1 text-sm disabled:opacity-50";

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <Link href={`/polls/${poll.id}`} className="font-medium break-words underline-offset-2 hover:underline">
          {poll.question}
        </Link>
        <p className="text-sm text-slate-500">
          {poll.deadline ? (
            <>
              마감 <LocalTime iso={poll.deadline.toISOString()} />
            </>
          ) : (
            "마감 없음"
          )}
        </p>
      </div>
      {showResult && <ResultView result={computeResult(counts, null)} />}
      <div className="flex gap-2">
        {isOpen && (
          <form action={closePollEarlyAction}>
            <input type="hidden" name="pollId" value={poll.id} />
            <ConfirmButton
              message="지금 마감할까요? 마감 시각은 다시 늘릴 수 없습니다."
              className={`${buttonClass} border-slate-300 dark:border-slate-700`}
            >
              지금 마감
            </ConfirmButton>
          </form>
        )}
        <form action={deletePollAction}>
          <input type="hidden" name="pollId" value={poll.id} />
          <ConfirmButton
            message="정말 삭제할까요? 선택지와 모든 표가 함께 사라지며 되돌릴 수 없습니다."
            className={`${buttonClass} border-red-300 text-red-700 dark:border-red-800 dark:text-red-400`}
          >
            삭제
          </ConfirmButton>
        </form>
      </div>
    </li>
  );
}
