"use server";

import { redirect } from "next/navigation";
import { requireOperator } from "@/lib/operator";
import { closeEarly, validatePollInput, type PollInputErrors } from "@/lib/poll-rules";
import { createPoll, deletePoll, getPoll, setDeadline } from "@/lib/polls";

export type CreatePollState = { errors?: PollInputErrors };

export async function createPollAction(
  _prev: CreatePollState,
  formData: FormData,
): Promise<CreatePollState> {
  await requireOperator();

  // 마감은 브라우저가 로컬 시각을 UTC ISO 문자열로 바꿔 보낸다. 비어 있으면 마감 없음.
  const rawDeadline = String(formData.get("deadline") ?? "");
  const result = validatePollInput(
    {
      question: String(formData.get("question") ?? ""),
      options: formData.getAll("option").map(String),
      deadline: rawDeadline === "" ? null : new Date(rawDeadline),
    },
    new Date(),
  );
  if (!result.ok) return { errors: result.errors };

  const id = await createPoll(result.value);
  redirect(`/polls/${id}`);
}

export async function closePollEarlyAction(formData: FormData): Promise<void> {
  await requireOperator();
  const poll = await getPoll(String(formData.get("pollId") ?? ""));
  if (poll) await setDeadline(poll.id, closeEarly(poll, new Date()));
  redirect("/admin");
}

export async function deletePollAction(formData: FormData): Promise<void> {
  await requireOperator();
  const poll = await getPoll(String(formData.get("pollId") ?? ""));
  if (poll) await deletePoll(poll.id);
  redirect("/admin");
}
