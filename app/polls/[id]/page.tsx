import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canSeeResult, computeResult, isClosed } from "@/lib/poll-rules";
import { getOptionCounts, getPoll, getVoterOptionId } from "@/lib/polls";
import { getVoterId } from "@/lib/voter";
import { BackToListLink } from "@/app/back-to-list-link";
import { LocalTime } from "@/app/local-time";
import { ResultView } from "@/app/result-view";
import { voteNoticeMessage } from "./notices";
import { VoteForm } from "./vote-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/polls/[id]">): Promise<Metadata> {
  const poll = await getPoll((await props.params).id);
  return { title: poll ? `${poll.question} · 투표 앱` : "투표 앱" };
}

export default async function PollPage(props: PageProps<"/polls/[id]">) {
  const { id } = await props.params;
  const notice = voteNoticeMessage((await props.searchParams).notice);
  const poll = await getPoll(id);
  if (!poll) notFound();

  const closed = isClosed(poll, new Date());
  // 운영자도 이 화면에서는 이 브라우저의 투표자로 본다. 운영자 전용 결과는 /admin에 있다.
  const voterId = await getVoterId();
  const myOptionId = voterId ? await getVoterOptionId(poll.id, voterId) : null;
  const showResult = canSeeResult({ viewer: "voter", hasVoted: myOptionId !== null, closed });
  // 결과가 숨겨져 있으면 표 수를 아예 읽지 않아 응답에도 포함되지 않는다.
  const result = showResult ? computeResult(await getOptionCounts(poll.id), myOptionId) : null;

  return (
    <article className="flex flex-col gap-4">
      <BackToListLink />
      <header>
        <h1 className="text-xl font-bold break-words">{poll.question}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {closed ? "마감된 투표" : myOptionId ? "투표 완료" : "진행 중"}
          {poll.deadline && (
            <>
              {" · 마감 "}
              <LocalTime iso={poll.deadline.toISOString()} />
            </>
          )}
        </p>
      </header>
      {notice && (
        <p
          role="status"
          className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          {notice}
        </p>
      )}
      {result ? <ResultView result={result} /> : <VoteForm pollId={poll.id} options={poll.options} />}
    </article>
  );
}
