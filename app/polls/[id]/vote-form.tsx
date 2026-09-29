"use client";

import { useFormStatus } from "react-dom";
import type { PollOption } from "@/lib/polls";
import { castVoteAction } from "./vote-actions";

export function VoteForm({ pollId, options }: { pollId: string; options: PollOption[] }) {
  function confirmVote(event: React.FormEvent<HTMLFormElement>) {
    const optionId = new FormData(event.currentTarget).get("optionId");
    const label = options.find((o) => o.id === optionId)?.label;
    if (!label || !window.confirm(`선택 후에는 바꿀 수 없습니다. '${label}'에 투표할까요?`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={castVoteAction} onSubmit={confirmVote} className="flex flex-col gap-3">
      <input type="hidden" name="pollId" value={pollId} />
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">선택지</legend>
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 break-words has-[:checked]:border-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:has-[:checked]:border-slate-100"
          >
            <input type="radio" name="optionId" value={option.id} required className="shrink-0" />
            <span className="min-w-0">{option.label}</span>
          </label>
        ))}
      </fieldset>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
    >
      {pending ? "투표하는 중…" : "투표하기"}
    </button>
  );
}
