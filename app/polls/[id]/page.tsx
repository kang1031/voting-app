import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isClosed } from "@/lib/poll-rules";
import { getPoll } from "@/lib/polls";
import { LocalTime } from "@/app/local-time";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/polls/[id]">): Promise<Metadata> {
  const poll = await getPoll((await props.params).id);
  return { title: poll ? `${poll.question} · 투표 앱` : "투표 앱" };
}

export default async function PollPage(props: PageProps<"/polls/[id]">) {
  const { id } = await props.params;
  const poll = await getPoll(id);
  if (!poll) notFound();
  const closed = isClosed(poll, new Date());

  return (
    <article className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold break-words">{poll.question}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {closed ? "마감된 투표" : "진행 중"}
          {poll.deadline && (
            <>
              {" · 마감 "}
              <LocalTime iso={poll.deadline.toISOString()} />
            </>
          )}
        </p>
      </header>
      <ul className="flex flex-col gap-2">
        {poll.options.map((option) => (
          <li
            key={option.id}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 break-words dark:border-slate-800 dark:bg-slate-900"
          >
            {option.label}
          </li>
        ))}
      </ul>
    </article>
  );
}
