import type { PollResult } from "@/lib/poll-rules";

/** 결과: 선택지별 표 수·비율·막대. 투표자 화면과 운영자 화면이 함께 쓴다. */
export function ResultView({ result }: { result: PollResult }) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {result.options.map((option) => (
          <li
            key={option.id}
            className={`rounded-lg border bg-white px-4 py-3 dark:bg-slate-900 ${
              option.mine
                ? "border-slate-900 dark:border-slate-100"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 break-words">
                {option.label}
                {option.mine && (
                  <span className="ml-2 rounded bg-slate-900 px-1.5 py-0.5 text-xs text-white dark:bg-slate-100 dark:text-slate-900">
                    내 선택
                  </span>
                )}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-slate-600 dark:text-slate-400">
                {option.count}표 · {option.percent}%
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              role="img"
              aria-label={`${option.percent}%`}
            >
              <div
                className="h-full rounded-full bg-slate-700 dark:bg-slate-300"
                style={{ width: `${option.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-500">총 {result.total}표</p>
    </div>
  );
}
