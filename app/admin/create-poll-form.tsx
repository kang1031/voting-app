"use client";

import { useActionState, useState } from "react";
import { POLL_LIMITS } from "@/lib/poll-rules";
import { createPollAction, type CreatePollState } from "./poll-actions";

const { minOptions, maxOptions } = POLL_LIMITS;

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export function CreatePollForm() {
  const [state, formAction, pending] = useActionState<CreatePollState, FormData>(
    createPollAction,
    {},
  );
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [localDeadline, setLocalDeadline] = useState("");

  // datetime-local 값은 브라우저 시간대 기준이므로 여기서 UTC ISO로 바꿔 보낸다.
  const deadlineIso =
    localDeadline === "" ? "" : (() => {
      const date = new Date(localDeadline);
      return Number.isNaN(date.getTime()) ? "invalid" : date.toISOString();
    })();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">질문</span>
        <input
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className={inputClass}
        />
        <FieldError message={state.errors?.question} />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          선택지 ({minOptions}~{maxOptions}개)
        </legend>
        {options.map((option, i) => (
          <div key={i} className="flex gap-2">
            <input
              name="option"
              value={option}
              onChange={(e) => setOptions(options.map((o, j) => (j === i ? e.target.value : o)))}
              required
              aria-label={`선택지 ${i + 1}`}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setOptions(options.filter((_, j) => j !== i))}
              disabled={options.length <= minOptions}
              className="shrink-0 rounded-md border border-slate-300 px-3 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              삭제
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOptions([...options, ""])}
          disabled={options.length >= maxOptions}
          className="self-start rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700"
        >
          선택지 추가
        </button>
        <FieldError message={state.errors?.options} />
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">마감 시각 (선택)</span>
        <input
          type="datetime-local"
          name="deadlineLocal"
          value={localDeadline}
          onChange={(e) => setLocalDeadline(e.target.value)}
          className={inputClass}
        />
        <input type="hidden" name="deadline" value={deadlineIso} />
        <span className="text-xs text-slate-500">비워두면 삭제하기 전까지 계속 열려 있습니다.</span>
        <FieldError message={state.errors?.deadline} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
      >
        {pending ? "만드는 중…" : "투표 만들기"}
      </button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="text-sm text-red-600 dark:text-red-400">
      {message}
    </span>
  );
}
