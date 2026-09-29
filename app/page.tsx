import Link from "next/link";
import { isClosed } from "@/lib/poll-rules";
import { listPolls, type PollSummary } from "@/lib/polls";
import { LocalTime } from "./local-time";

export const dynamic = "force-dynamic";

export default async function Home(props: PageProps<"/">) {
  const { notice } = await props.searchParams;
  const now = new Date();
  const polls = await listPolls();
  const open = polls.filter((p) => !isClosed(p, now));
  const closed = polls.filter((p) => isClosed(p, now));

  return (
    <div className="flex flex-col gap-8">
      {notice === "deleted" && (
        <p
          role="status"
          className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          삭제된 투표입니다.
        </p>
      )}
      <PollSection title="진행 중" polls={open} empty="진행 중인 투표가 없습니다." />
      <PollSection title="마감됨" polls={closed} empty="마감된 투표가 없습니다." />
    </div>
  );
}

function PollSection({ title, polls, empty }: { title: string; polls: PollSummary[]; empty: string }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {polls.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {polls.map((poll) => (
            <li key={poll.id}>
              <Link
                href={`/polls/${poll.id}`}
                className="block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600"
              >
                <span className="block font-medium break-words">{poll.question}</span>
                {poll.deadline && (
                  <span className="text-sm text-slate-500">
                    마감 <LocalTime iso={poll.deadline.toISOString()} />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
