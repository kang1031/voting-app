"use server";

import { redirect } from "next/navigation";
import { judgeVote } from "@/lib/poll-rules";
import { castVote, getPoll, getVoterOptionId } from "@/lib/polls";
import { getOrIssueVoterId, getVoterId, withdrawVoterId } from "@/lib/voter";
import type { VoteNotice } from "./notices";

export async function castVoteAction(formData: FormData): Promise<void> {
  const pollId = String(formData.get("pollId") ?? "");
  const optionId = String(formData.get("optionId") ?? "");

  const poll = await getPoll(pollId);
  if (!poll) redirect("/?notice=deleted");

  const existingVoterId = await getVoterId();
  const alreadyVoted =
    existingVoterId !== null && (await getVoterOptionId(poll.id, existingVoterId)) !== null;

  const judgement = judgeVote({
    poll: { deadline: poll.deadline, optionIds: poll.options.map((o) => o.id) },
    optionId,
    alreadyVoted,
    now: new Date(),
  });
  if (!judgement.ok) backToPoll(poll.id, judgement.reason);

  const voter = await getOrIssueVoterId();
  const outcome = await castVote(poll.id, optionId, voter.id);
  if (outcome === "poll-gone") {
    // 판정과 저장 사이에 삭제됐다. 표가 없으니 방금 발급한 쿠키도 남기지 않는다.
    if (voter.issued) await withdrawVoterId();
    redirect("/?notice=deleted");
  }
  backToPoll(poll.id, outcome === "already-voted" ? "already-voted" : undefined);
}

function backToPoll(pollId: string, notice?: VoteNotice): never {
  redirect(notice ? `/polls/${pollId}?notice=${notice}` : `/polls/${pollId}`);
}
